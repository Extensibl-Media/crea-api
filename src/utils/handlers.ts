import Webflow from 'webflow-api';
import {
  chunkArray,
  formatAgentData,
  getFilteredRoomData,
  slugify
} from './helpers';
import {
  CMSListingFields,
  CREAAccessToken,
  CREALlistingDataRaw,
  RawCMSFields
} from './types';
import axios from 'axios';
import { IItemDelete, Item } from 'webflow-api/dist/api';
import { DOMAINS } from './constants';

const webflow = new Webflow({ token: process.env.WEBFLOW_API_KEY });

/**
 * Fetch Webflow data for Luke Mori site
 * @returns {object} Object containing APi config, Site data, and Collection data (fields/items)
 */
export const getWebflowData = async () => {
  const config = webflow.config;
  const site = await webflow.site({ siteId: process.env.WEBFLOW_SITE_ID });
  const domains = await webflow.domains({ siteId: site._id });
  const collection = await webflow.collection({
    collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID
  });
  const itemsPerPage = 100; // Adjust the number of items per page as needed
  let offset = 0;
  let allItems = [];

  try {
    while (true) {
      const items = await collection.items({ limit: itemsPerPage, offset });

      if (items.length === 0) {
        // No more items to fetch, break the loop
        break;
      }

      allItems = allItems.concat(items);
      offset += itemsPerPage;
    }

    // Process allItems array
  } catch (error) {
    // Handle error
    console.error(error);
  }
  return {
    config,
    site: { ...site, domains },
    collection: { ...collection, items: allItems }
  };
};

/**
 * Publishes New/Updated items in Webflow CMS
 * @param {string[]} itemIds Array of Webflow CMS Item ids
 */
export const publishCMSData = async (itemIds: string[]) => {
  try {
    console.log('Publishing CMS Items');
    await webflow
      .publishItems({
        itemIds,
        collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID
      })
      .then(() => {
        console.log('Items published successfully');
      })
      .catch(() => {
        console.log('Problem publishing new CMS Items');
      });
  } catch (error) {
    console.log('Error publishing items', error);
  }
};

/**
 * Publishes Webflow Site
 */
export const publishSite = async () => {
  console.log('Publishing site');
  try {
    await webflow
      .publishSite({
        siteId: process.env.WEBFLOW_SITE_ID,
        domains: DOMAINS
      })
      .then(() => {
        console.log('Site successfully published');
      })
      .catch(() => {
        console.log('Problem publishing site');
      });
  } catch (error) {
    console.log('Error publishing site', error);
  }
};

/**
 *
 * @param {CREALlistingDataRaw[]} listings
 * @param {RawCMSFields[]} items
 * @returns Array of deleted Webflow CMS items
 */
export const removeObsoleteCMSItems = async (
  listings: CREALlistingDataRaw[],
  items: RawCMSFields[]
) => {
  console.log(
    'Checking CREA data for any removed listings for Webflow CMS cleanup...'
  );
  try {
    const listingKeys = listings.map((listing) => listing.ListingKey);

    const itemsToDelete = items.filter(
      (item) => !listingKeys.includes(item['idnum'])
    );

    const deletedItems: IItemDelete[] = [];

    const chunks = chunkArray(itemsToDelete, 100);

    for (const chunk of chunks) {
      const chunkOperations = chunk.map(async (item) => {
        try {
          await webflow.removeItem({
            collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID,
            itemId: item._id
          });
          return item._id;
        } catch (error) {
          console.log(`Error removing item: ${item._id}`, error);
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
    throw new Error('Something went wrong cleanung up CMS');
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

/**
 * Fetch al CREA listings in National Pool
 * @returns Detailed array of CREA Listings
 */
export const getCREAListingsData: (
  token: CREAAccessToken
) => Promise<CREALlistingDataRaw[]> = async (token) => {
  // const pageSize = 100; // Number of results per page
  const baseUrl = 'https://ddfapi.realtor.ca/odata/v1/Property'; // Replace with your API endpoint

  let allData = [];

  let nextLink = baseUrl;
  let totalCount = 0; // Set the initial totalCount value to a known value or fetch it separately if available
  let fetchedCount = 0;

  try {
    const response = await axios.get(`${baseUrl}?$count=true`, {
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
      agent: await getCREAMember(listing.ListAgentKey, token),
      agent2: listing.CoListAgentKey
        ? await getCREAMember(listing.CoListAgentKey, token)
        : null
    })))
  );

  return finalData;
};

/**
 * Shapes data from CREA listing to be compatible with Webflow CMS collection entry for Listings
 * @param listing
 * @returns Webflow CMS Listing object
 */
const shapeCMSFields: (listing: CREALlistingDataRaw) => CMSListingFields = (
  listing: CREALlistingDataRaw
) => {
  const waterfrontTerms = [
    'waterfront',
    'beachfront',
    'water front',
    'beach front'
  ];
  const fields: CMSListingFields = {
    idnum: listing.ListingKey,
    listingid: listing.ListingId,
    'agentdetails-name': `${listing?.agent?.MemberFirstName} ${listing?.agent?.MemberLastName}`,
    'agentdetails-office-name': listing?.agent?.office?.OfficeName,
    'agent2details-name': `${listing?.agent2?.MemberFirstName} ${listing?.agent2?.MemberLastName}`,
    'agent2details-office-name': listing?.agent2?.office?.OfficeName,
    'building-fireplacepresent': listing.FireplaceYN ? 'Yes' : 'No',
    'building-utilitywater': listing.WaterSource.join(', '),
    'land-sizetotaltext':
      listing?.LotSizeArea && listing?.LotSizeUnits === 'square feet'
        ? `${listing?.LotSizeArea?.toLocaleString()} sqft.`
        : null,
    'land-sewer': listing?.Sewer.join(', '),
    'address-streetaddress': listing.UnparsedAddress,
    'address-city': listing.City,
    'address-communityname': listing.SubdivisionName,
    ownershiptype: listing.CommonInterest,
    propertytype: listing.PropertySubType,
    zoningtype: listing.Zoning,
    'building-bathroomtotal': listing?.BathroomsTotalInteger?.toString(),
    'building-bedroomstotal': listing?.BedroomsTotal?.toString(),
    'building-appliances': listing?.Appliances.join(', '),
    'building-basementtype': listing?.Basement.join(', '),
    'building-constructeddate': listing?.YearBuilt?.toString(),
    'building-exteriorfinish': listing?.ExteriorFeatures.join(', '),
    'building-flooringtype': listing?.Flooring.join(', '),
    'building-foundationtype': listing?.FoundationDetails.join(', '),
    'building-heatingtype': listing?.Heating.join(', '),
    'building-roofmaterial': listing?.Roof.join(', '),
    parkingspacetotal: listing?.ParkingTotal?.toString(),
    images:
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
    images2:
      listing?.Media?.length > 25
        ? listing.Media.slice(25, 50)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : null,
    images3:
      listing?.Media?.length > 50
        ? listing.Media.slice(50, listing.Media.length - 1)
            .filter((media) => media.MediaCategory === 'Property Photo')
            .map((img) => ({
              url: img.MediaURL,
              alt: img.LongDescription
            }))
        : null,
    'publicremarks-2': listing.PublicRemarks,
    'rooms-above-3': getFilteredRoomData(
      listing?.Rooms.filter((room) => room.RoomLevel === 'Above')
    ),
    'rooms-lowerlevel-3': getFilteredRoomData(
      listing?.Rooms.filter((room) => room.RoomLevel === 'Lower level')
    ),
    'rooms-mainlevel-3': getFilteredRoomData(
      listing?.Rooms.filter((room) => room.RoomLevel === 'Main level')
    ),
    video:
      listing?.Media?.filter(
        (media) => media.MediaCategory === 'Video Tour Website'
      )[0]?.MediaURL || null,
    priceint: listing.ListPrice,
    'building-sizeinterior-int': listing.LivingArea,
    'building-constructionmaterial': listing?.ConstructionMaterials.join(', '),
    mainimage:
      listing?.Media?.filter(
        (media) => media.MediaCategory === 'Property Photo'
      ).map((media) => ({
        url: media?.MediaURL,
        alt: media?.LongDescription
      }))[0] || null,
    waterfront: waterfrontTerms.some((str) =>
      listing?.PublicRemarks?.toLowerCase().includes(str)
    ),
    name: listing.UnparsedAddress || '',
    'agent-data-full': formatAgentData(listing.agent),
    'agent2-data-full': formatAgentData(listing.agent2),
    _archived: false,
    _draft: false,
    slug: listing.UnparsedAddress ? slugify(listing.UnparsedAddress) : ''
  };

  return fields;
};

/**
 * Syncs Webflow CMS with CREA data
 * @param listings list of CREA listings
 * @param items list of current Webflow CMS Listing entries
 * @returns New array of synced listings in Webflow CMS
 */
export const syncDataWithCMS = async (
  listings: CREALlistingDataRaw[],
  items: RawCMSFields[]
) => {
  console.log('Syncing webflow CMS with CREA data...');
  try {
    const chunks: CREALlistingDataRaw[][] = chunkArray(listings, 100);
    let newItems: Item[] = [];

    for (const chunk of chunks) {
      const chunkOperations = chunk.map(async (listing) => {
        try {
          const existingItem = items.find(
            (item) => item['idnum'] === listing.ListingKey
          );
          if (existingItem) {
            const updatedListing = await webflow.patchItem({
              collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID,
              itemId: existingItem._id,
              ...{
                ...shapeCMSFields(listing),
                name: existingItem.name,
                slug: existingItem.slug
              }
            });
            return updatedListing;
          } else {
            const newListing = await webflow.createItem({
              collectionId: process.env.WEBFLOW_LISTING_COLLECTION_ID,
              fields: shapeCMSFields(listing)
            });
            return newListing;
          }
        } catch (error) {
          console.log(`Error processing listing ${listing.ListingKey}`, error);
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
