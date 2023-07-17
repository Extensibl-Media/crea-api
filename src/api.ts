import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { CREAAccessToken, RawCMSFields } from './utils/types';
import {
  getCREAListingsData,
  getCREAToken,
  getWebflowData,
  publishCMSData,
  publishSite,
  removeObsoleteCMSItems,
  syncDataWithCMS
} from './utils/handlers';

export const app = express();

app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Healthcheck endpoint
app.get('/', (_req, res) => {
  res.status(200).send({ status: 'ok' });
});

// CRON job scheduled to run at 1AM Denver time to sync, cleanup, and publish listing data to www.lukemori.com

cron.schedule(
  '0 1 * * *',
  async () => {
    console.log('Running scheduled job!');
    try {
      // Get CREA Listing Data
      const memberToken: CREAAccessToken = await getCREAToken('member');
      const nationalToken: CREAAccessToken = await getCREAToken('national');

      const memberListings = await getCREAListingsData(memberToken);
      const nationalListings = await getCREAListingsData(nationalToken);

      const poolIds = new Set(
        nationalListings.map((listing) => listing.ListingKey)
      );
      const finalData = [
        ...nationalListings,
        ...memberListings.filter((listing) => !poolIds.has(listing.ListingKey))
      ];

      // Get relevant Webflow data
      const {
        collection: { items }
      }: { collection: { items: RawCMSFields[] } } = await getWebflowData();

      // Sync Webflow CMS with listing data and get returned new listing collection items
      const newItems = await syncDataWithCMS(finalData, items);

      // Clean up Webflow CMS of any listings no linger in the CREA database
      await removeObsoleteCMSItems(finalData, items);

      const itemIds = newItems.map((item) => item?._id);

      // Publish new CMS items to site
      await publishCMSData(itemIds);

      // Finally, publish site so all new listings are live
      await publishSite();
    } catch (error) {
      console.log(`Error running job`, error);
    } finally {
      console.log('Scheduled job complete.');
    }
  },
  {
    timezone: 'America/Denver'
  }
);

const api = express.Router();

// Version the api
app.use('/api/v1', api);

/*
  Test Endpoints (Should remain commented out to prevent exposure when not running locally)
  These are just to test and debug data
 */

// Get All CREA Data
// api.get('/crea-raw-data', async (req, res) => {
//   try {
//     const memberToken: CREAAccessToken = await getCREAToken('member');
//     const nationalToken: CREAAccessToken = await getCREAToken('national');

//     const memberListings = await getCREAListingsData(memberToken);
//     const nationalListings = await getCREAListingsData(nationalToken);

//     const poolIds = new Set(
//       nationalListings.map((listing) => listing.ListingKey)
//     );
//     const finalData = [
//       ...nationalListings,
//       ...memberListings.filter((listing) => !poolIds.has(listing.ListingKey))
//     ];

//     return res.status(200).json({ finalData, count: finalData.length });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).end();
//   }
// });

// Get all webflow CMS data for site
// api.get('/webflow-raw-data', async (req, res) => {
//   try {
//     const data = await getWebflowData();
//     return res.status(200).json(data);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).end();
//   }
// });

// Clean up CMS
// api.get('/clean-data', async (req, res) => {
//   try {
//     const memberToken: CREAAccessToken = await getCREAToken('member');
//     const nationalToken: CREAAccessToken = await getCREAToken('national');

//     const memberListings = await getCREAListingsData(memberToken);
//     const nationalListings = await getCREAListingsData(nationalToken);

//     const poolIds = new Set(
//       nationalListings.map((listing) => listing.ListingKey)
//     );
//     const finalData = [
//       ...nationalListings,
//       ...memberListings.filter((listing) => !poolIds.has(listing.ListingKey))
//     ];
//     const {
//       collection: { items }
//     }: { collection: { items: RawCMSFields[] } } = await getWebflowData();

//     const result = await removeObsoleteCMSItems(finalData, items);
//     return res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).end();
//   }
// });

// Manually sync CMS with CREA data
// api.get('/push-data', async (req, res) => {
//   try {
//     const memberToken: CREAAccessToken = await getCREAToken('member');
//     const nationalToken: CREAAccessToken = await getCREAToken('national');

//     const memberListings = await getCREAListingsData(memberToken);
//     const nationalListings = await getCREAListingsData(nationalToken);

//     const poolIds = new Set(
//       nationalListings.map((listing) => listing.ListingKey)
//     );
//     const finalData = [
//       ...nationalListings,
//       ...memberListings.filter((listing) => !poolIds.has(listing.ListingKey))
//     ];

//     const {
//       collection: { items }
//     }: { collection: { items: RawCMSFields[] } } = await getWebflowData();
//     const result = await syncDataWithCMS(finalData, items);
//     return res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).end();
//   }
// });

// Manually run full job
// api.get('/full-sync', async (req, res) => {
//   console.log('Running scheduled job!');
//   try {
//     // Get CREA Listing Data
//     const memberToken: CREAAccessToken = await getCREAToken('member');
//     const nationalToken: CREAAccessToken = await getCREAToken('national');

//     const memberListings = await getCREAListingsData(memberToken);
//     const nationalListings = await getCREAListingsData(nationalToken);

//     const poolIds = new Set(
//       nationalListings.map((listing) => listing.ListingKey)
//     );
//     const finalData = [
//       ...nationalListings,
//       ...memberListings.filter((listing) => !poolIds.has(listing.ListingKey))
//     ];

//     // Get relevant Webflow data
//     const {
//       collection: { items }
//     }: { collection: { items: RawCMSFields[] } } = await getWebflowData();

//     // Sync Webflow CMS with listing data and get returned new listing collection items
//     const newItems = await syncDataWithCMS(finalData, items);

//     // Clean up Webflow CMS of any listings no linger in the CREA database
//     await removeObsoleteCMSItems(finalData, items);

//     const itemIds = newItems.map((item) => item?._id);
//     console.log(itemIds);

//     // Publish new CMS items to site
//     await publishCMSData(itemIds);

//     // Finally, publish site so all new listings are live
//     await publishSite();
//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.log(`Error running job`, error);
//     return res.status(500).end();
//   } finally {
//     console.log('Scheduled job complete.');
//   }
// });
