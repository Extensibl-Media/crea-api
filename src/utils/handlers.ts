import { WebflowClient } from 'webflow-api';
import { chunkArray, slugify, waitForCMSTimeout } from './helpers';
import { CMSListingFields, CREAAccessToken, CREAListingDataRaw } from './types';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { CollectionItem } from 'webflow-api/api';
import { DOMAINS } from './constants';

const webflow = new WebflowClient({ accessToken: process.env.WEBFLOW_API_KEY });

/**
 * Fetch Webflow data for Luke Mori site
 * @returns {object} Object containing APi config, Site data, and Collection data (fields/items)
 */
export const getWebflowSiteData = async () => {
  try {
    const site = await webflow.sites.get(process.env.WEBFLOW_SITE_ID);
    const domains = site.customDomains;
    const collections = await webflow.collections.list(
      process.env.WEBFLOW_SITE_ID
    );
    return {
      site: { ...site, domains },
      collections: collections
    };
  } catch (error) {
    // Handle error
    console.error(error);
    throw new Error(`${error}`);
  }
};
export const getWebflowCollectionData = async (collectionId) => {
  try {
    const collection = await webflow.collections.get(collectionId);

    return collection;
  } catch (error) {
    // Handle error
    console.error(error);
    throw new Error(`${error}`);
  }
};

export const getCollectionItems = async (collectionId: string) => {
  try {
    const data = await webflow.collections.items.listItems(collectionId);

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(`error getting items: ${error}`);
  }
};

export const getAllCollectionItems = async (collectionId: string) => {
  try {
    let allItems: CollectionItem[] = [];
    let offset = 0;
    const limit = 100; // Webflow's default limit

    while (true) {
      const response = await webflow.collections.items.listItems(collectionId, {
        limit,
        offset
      });

      allItems = allItems.concat(response.items);

      if (response.items.length < limit) {
        break;
      }

      offset += limit;
    }

    return allItems;
  } catch (error) {
    console.error('Error getting items:', error);
    throw new Error(`Error getting items: ${error}`);
  }
};

/**
 * Publishes New/Updated items in Webflow CMS
 * @param {string[]} itemIds Array of Webflow CMS Item ids
 */
// export const publishCMSData = async (itemIds: string[]) => {
//   try {
//     console.log('Publishing CMS Items');
//     await webflow
//       .collections.items.publishItem({
//         itemIds,
//         collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID
//       })
//       .then(() => {
//         console.log('Items published successfully');
//       })
//       .catch(() => {
//         console.log('Problem publishing new CMS Items');
//       });
//   } catch (error) {
//     console.log('Error publishing items', error);
//   }
// };

/**
 * Publishes Webflow Site
 */
export const publishSite = async () => {
  console.log('Publishing site');
  try {
    await webflow.sites
      .publish(process.env.WEBFLOW_SITE_ID, { customDomains: DOMAINS })
      .then(() => {
        console.log('Site successfully published');
      })
      .catch(() => {
        console.log('Problem publishing site');
      });
  } catch (error) {
    console.log('Error publishing site', error);
  } finally {
    console.log('Site Publishing Finished');
  }
};

/**
 *
 * @param {CREAListingDataRaw[]} listings
 * @param {RawCMSFields[]} items
 * @returns Array of deleted Webflow CMS items
 */
export const removeObsoleteCMSItems = async (
  listings: CREAListingDataRaw[],
  items: CollectionItem[]
) => {
  console.log(
    'Checking CREA data for any removed listings for Webflow CMS cleanup...'
  );
  try {
    const listingKeys = listings.map((listing) =>
      listing.ListingKey.toString()
    );

    const itemsToDelete = items.filter(
      (item) =>
        !listingKeys.includes(
          item.fieldData?.['listingkey']?.toString() as string
        )
    );

    const deletedItems = [];

    const chunks = chunkArray(itemsToDelete, 100);

    for (const chunk of chunks) {
      const chunkOperations = chunk.map(async (item: CollectionItem) => {
        try {
          await webflow.collections.items.deleteItem(
            process.env.WEBFLOW_LISTING_COLLECTION_ID,
            item.id
          );
          console.log('deleting item', {
            id: item.id,
            slug: item.fieldData?.slug || 'slug not found'
          });
          return item.id;
        } catch (error) {
          console.log(`Error removing item: ${item.id}`, error);
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkOperations);
      deletedItems.push(...chunkResults.filter((result) => result !== null));

      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
    console.log(
      `Cleanup successfully completed, deleted ${deletedItems.length} items`
    );
    return deletedItems;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong cleaning up CMS');
  }
};

/**
 * Dump CREA Listing Data from Webflow Collection
 */
export const dumpCollection = async () => {
  try {
    const items: CollectionItem[] = await getAllCollectionItems(
      process.env.WEBFLOW_LISTING_COLLECTION_ID
    );
    await waitForCMSTimeout();

    const chunks: CollectionItem[][] = chunkArray(items, 120);
    let newItems = [];

    for (const chunk of chunks) {
      const chunkOperations = chunk.map(async (item) => {
        try {
          await webflow.collections.items.deleteItem(
            process.env.WEBFLOW_LISTING_COLLECTION_ID,
            item.id
          );
        } catch (error) {
          console.log(`Error deleting item: ${item.id}`, error);
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkOperations);
      newItems.push(...chunkResults);

      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
    console.log('Successfully dumped CMS Collection');
  } catch (error) {
    console.log(error);
  }
};

/**
 * Requests CREA Access token
 * @returns CREA Access token object
 */
export const getCREAToken = async (feedType: 'member' | 'national') => {
  const feedVars = {
    client_id: {
      member: process.env.MEMBER_CLIENT_ID,
      national: process.env.NATIONAL_POOL_CLIENT_ID
    },
    client_secret: {
      member: process.env.MEMBER_CLIENT_SECRET,
      national: process.env.NATIONAL_POOL_CLIENT_SECRET
    }
  };
  const body = {
    grant_type: 'client_credentials',
    client_id: feedVars.client_id[feedType],
    client_secret: feedVars.client_secret[feedType],
    scope: 'DDFApi_Read'
  };

  try {
    const { data } = await axios.post(
      'https://identity.crea.ca/connect/token',
      body,
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    );
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 *
 * @param {string} officeKey
 * @param {CREAAccessToken} token
 * @returns Office data for provided OfficeKey reference
 */
const getOfficeData = async (officeKey: string, token: CREAAccessToken) => {
  try {
    const { data } = await axios.get(
      `https://ddfapi.realtor.ca/odata/v1/Office/${officeKey}`,
      {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get CREA Agent data
 * @param memberKey
 * @param token
 * @returns Details object of CREA Agent Member
 */
const getCREAMember = async (memberKey: string, token: CREAAccessToken) => {
  try {
    const { data } = await axios.get(
      `https://ddfapi.realtor.ca/odata/v1/Member/${memberKey}`,
      {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
      }
    );
    const finalData = {
      ...data,
      office: await getOfficeData(data.OfficeKey, token)
    };
    return finalData;
  } catch (error) {
    console.log(error);
  }
};

export const getSingleCREAListing: (
  token: CREAAccessToken,
  id: string
) => Promise<any> = async (token, id) => {
  const baseUrl = process.env.BASE_API_URL; // Replace with your API endpoint
  try {
    const response = await axios.get(`${baseUrl}/Property/${id}`, {
      headers: { Authorization: `${token.token_type} ${token.access_token}` }
    });

    return response.data;
  } catch (error) {
    const errorObj = error as any;
    console.log(errorObj.response as any);
  }
};

/**
 * Fetch al CREA listings in National Pool
 * @returns Detailed array of CREA Listings
 */
export const getCREAListingsData: (
  token: CREAAccessToken
) => Promise<{ listings: CREAListingDataRaw[]; count: number }> = async (
  token
) => {
  // const pageSize = 100; // Number of results per page
  const baseUrl = process.env.BASE_API_URL; // Replace with your API endpoint

  let allData = [];

  let nextLink = baseUrl + '/Property';
  let totalCount = 0; // Set the initial totalCount value to a known value or fetch it separately if available
  let fetchedCount = 0;

  try {
    const response = await axios.get(`${baseUrl}/Property?$count=true`, {
      headers: { Authorization: `${token.token_type} ${token.access_token}` }
    });
    totalCount = response.data['@odata.count'];
  } catch (error) {
    console.error('Failed to fetch the total count:', error);
    return null; // Terminate if unable to fetch the total count
  }

  while (fetchedCount < totalCount) {
    try {
      const response = await axios.get(`${nextLink}`, {
        headers: { Authorization: `${token.token_type} ${token.access_token}` }
      });
      const newData = response.data.value; // Replace 'value' with the appropriate field from the API response
      allData = allData.concat(newData);
      fetchedCount += newData.length;

      if (response.data['@odata.nextLink']) {
        nextLink = response.data['@odata.nextLink'];
      } else {
        break; // Terminate the loop if no nextLink is available
      }
    } catch (error) {
      console.error('API request failed:', error);
      break; // Terminate the loop if an error occurs
    }
  }

  const finalData = await Promise.all(
    (allData = allData.map(async (listing) => ({
      ...listing,
      agent: await getCREAMember(listing.ListAgentKey, token)
    })))
  );

  return { listings: finalData, count: totalCount };
};

/**
 * Shapes data from CREA listing to be compatible with Webflow CMS collection entry for Listings
 * @param listing
 * @returns Webflow CMS Listing object
 */

export const shapeCMSFields = (
  listing: CREAListingDataRaw
): CMSListingFields => {
  const featuredImage = listing?.Media?.find(
    (media) => media.PreferredPhotoYN === true
  );
  return {
    name: listing.UnparsedAddress || '',
    listingid: listing.ListingId || '',
    listingkey: listing.ListingKey || '',
    propertysubtype: listing.PropertySubType || '',
    lotsizearea: listing.LotSizeArea || 0,
    lotsizedimensions: listing.LotSizeDimensions || '',
    lotsizeunits: listing.LotSizeUnits || '',
    publicremarks: listing.PublicRemarks?.replace(' (id:58303)', '') || '',
    listprice: listing.ListPrice || 0,
    commoninterest: listing.CommonInterest || '',
    city: listing.City || '',
    yearbuilt: listing.YearBuilt || 0,
    livingarea: listing.LivingArea || 0,
    livingareaunits: listing.LivingAreaUnits || '',
    zoning: listing.Zoning || '',
    'communityfeatures-0': listing?.CommunityFeatures?.join(', ') || '',
    'exteriorfeatures-0': listing.ExteriorFeatures?.join(', ') || '',
    'heating-0': listing.Heating?.join(', ') || '',
    'buildingfeatures-0': listing.BuildingFeatures?.join(', ') || '',
    'flooring-0': listing.Flooring?.join(', ') || '',
    'sewer-0': listing.Sewer?.join(', ') || '',
    'watersource-0': listing.WaterSource?.join(', ') || '',
    'lotfeatures-0': listing.LotFeatures?.join(', ') || '',
    'electric-0': listing.Electric?.join(', ') || '',
    agentname: `${listing.agent.MemberFirstName || ''} ${
      listing.agent.MemberLastName || ''
    }`,
    'featured-image':
      { url: featuredImage?.MediaURL, alt: featuredImage?.LongDescription } ||
      null,
    photos1:
      listing?.Media?.length > 25
        ? listing.Media.slice(0, 25)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : listing.Media.filter(
            (media) => media.MediaCategory === 'Property Photo'
          ).map((img) => ({
            url: img.MediaURL,
            alt: img.LongDescription
          })),
    photos2:
      listing?.Media?.length > 25
        ? listing.Media.slice(25, 50)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : null,
    photos3:
      listing?.Media?.length > 50
        ? listing.Media.slice(50, 75)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : null,
    photos4:
      listing?.Media?.length > 75
        ? listing.Media.slice(75, listing.Media.length - 1)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : null,
    officename: listing.agent.office.OfficeName || '',
    slug: listing.UnparsedAddress ? slugify(listing.UnparsedAddress) : ''
  };
};

/**
 * Syncs Webflow CMS with CREA data
 * @param listings list of CREA listings
 * @param items list of current Webflow CMS Listing entries
 * @returns New array of synced listings in Webflow CMS
 */
export const syncDataWithCMS = async (
  listings: CREAListingDataRaw[],
  items: CollectionItem[]
) => {
  console.log('Syncing webflow CMS with CREA data...');
  try {
    const chunks: CREAListingDataRaw[][] = chunkArray(listings, 100);
    let newItems = [];

    for (const chunk of chunks) {
      const chunkOperations = chunk.map(async (listing) => {
        // console.log(listing.ListingKey);
        try {
          const existingItem = items.find(
            (item) =>
              item.fieldData?.['listingkey'].toString() ===
              listing.ListingKey.toString()
          );
          if (existingItem) {
            const { slug, ...rest } = shapeCMSFields(listing);

            return await webflow.collections.items.updateItem(
              process.env.WEBFLOW_LISTING_COLLECTION_ID,
              existingItem.id,
              { id: existingItem.id, fieldData: rest as any }
            );
          } else {
            const fields = shapeCMSFields(listing);
            const id = randomBytes(16).toString('hex');
            const newItem = await webflow.collections.items.createItem(
              process.env.WEBFLOW_LISTING_COLLECTION_ID,
              {
                id,
                fieldData: fields as any
              }
            );
            console.log('Creating new entry: ', newItem.id);
            return newItem;
          }
        } catch (error) {
          console.log(
            `Error processing listing ${listing.ListingKey}: ${JSON.stringify(
              listing
            )}`,
            error
          );
          return null;
        }
      });

      const chunkResults = await Promise.all(chunkOperations);
      newItems.push(...chunkResults);

      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
    console.log(
      `Successfully synced Webflow CMS with CREA Database, added/updated ${newItems.length} items `
    );
    return newItems;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};
