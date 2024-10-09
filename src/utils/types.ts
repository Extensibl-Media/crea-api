/**
 * Request Type shape for granting access token to CREA
 */

export type CREAAccessToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type StringOrNull = string | null;
type NumOrNull = number | null;

/**
 * CMS Property Listing for Track Record
 */

export type TrackRecordListing = {
  listingkey: StringOrNull;
  name: string;
  slug: string;
  'feature-image': { url: string; alt?: string };
  community: StringOrNull;
  city: StringOrNull;
};

/**
 * Webflow CMS Listing Fields (minus Webflow generated fields)
 */
export interface CMSListingFields {
  name: string;
  listingkey: StringOrNull;
  propertysubtype: StringOrNull;
  lotsizearea: NumOrNull;
  lotsizedimensions: StringOrNull;
  lotsizeunits: StringOrNull;
  listingid: StringOrNull;
  publicremarks: StringOrNull;
  listprice: NumOrNull;
  commoninterest: StringOrNull;
  city: StringOrNull;
  yearbuilt: NumOrNull;
  livingarea: NumOrNull;
  livingareaunits: StringOrNull;
  zoning: StringOrNull;
  agentname: StringOrNull;
  officename: StringOrNull;
  'exteriorfeatures-0': StringOrNull;
  'flooring-0': StringOrNull;
  'watersource-0': StringOrNull;
  'sewer-0': StringOrNull;
  'heating-0': StringOrNull;
  'lotfeatures-0': StringOrNull;
  'communityfeatures-0': StringOrNull;
  'electric-0': StringOrNull;
  'buildingfeatures-0': StringOrNull;
  'featured-image': { url: string; alt?: string };
  photos1?: Array<{
    url: string;
    alt?: string;
  }> | null;
  photos2?: Array<{
    url: string;
    alt?: string;
  }> | null;
  photos3?: Array<{
    url: string;
    alt?: string;
  }> | null;
  photos4?: Array<{
    url: string;
    alt?: string;
  }> | null;
  slug: string;
}

/**
 * CMSListingFields + _id property
 */
export type RawCMSFields = {
  id: string;
  fieldData: CMSListingFields;
};

/**
 * CREA Room type (Property has many/null rooms)
 */
export type CREARoomData = {
  RoomKey: StringOrNull;
  ListingKey: StringOrNull;
  ListingId: StringOrNull;
  ModificationTimestamp: StringOrNull;
  RoomDescription: StringOrNull;
  RoomDimensions: StringOrNull;
  RoomLength: number | null;
  RoomLevel: 'Main level' | 'Above' | 'Lower level';
  RoomWidth: number | null;
  RoomLengthWidthUnits: StringOrNull;
  RoomType: StringOrNull;
};

/**
 * CREA Media type (Property/Member/Office has many/null Media entries)
 */

export type CREAMediaData = {
  MediaKey: StringOrNull;
  ResourceRecordKey: StringOrNull;
  LongDescription: StringOrNull;
  MediaURL: StringOrNull;
  ModificationTimestamp: StringOrNull;
  Order: number | null;
  PreferredPhotoYN: boolean;
  ResourceRecordId: StringOrNull;
  ResourceName: StringOrNull;
  MediaCategory: StringOrNull;
};

/**
 * CREA Office Type (Member has one/null office)
 */

export type CREAOfficeData = {
  '@odata.context': string;
  OfficeKey: StringOrNull;
  OfficeMlsId: StringOrNull;
  OfficeAORKey: StringOrNull;
  OfficeNationalAssociationId: StringOrNull;
  FranchiseNationalAssociationId: StringOrNull;
  OfficeBrokerNationalAssociationId: StringOrNull;
  OfficeAddress1: StringOrNull;
  OfficeAddress2: StringOrNull;
  OfficeCity: StringOrNull;
  OfficeFax: StringOrNull;
  OfficeName: StringOrNull;
  OfficePhone: StringOrNull;
  OfficePhoneExt: StringOrNull;
  OfficePostalCode: StringOrNull;
  ModificationTimestamp: StringOrNull;
  OriginalEntryTimestamp: StringOrNull;
  OfficeType: StringOrNull;
  OfficeStateOrProvince: StringOrNull;
  OfficeAOR: StringOrNull;
  OfficeStatus: StringOrNull;
  OfficeSocialMedia: {
    SocialMediaUrlOrId: StringOrNull;
    SocialMediaKey: StringOrNull;
    ResourceRecordKey: StringOrNull;
    SocialMediaType: StringOrNull;
    ModificationTimestamp: StringOrNull;
    ResourceName: StringOrNull;
  }[];
  Media: CREAMediaData[];
};

/**
 * CREA Agent/Member Type (Property has ListAgentKey and CoListAgentKey reference)
 */

export type CREAAgentData = {
  MemberKey: string;
  MemberLanguages: string[];
  MemberDesignation: string[];
  MemberMlsId: StringOrNull;
  OfficeKey: StringOrNull;
  OfficeNationalAssociationId: StringOrNull;
  JobTitle: StringOrNull;
  MemberAORKey: StringOrNull;
  MemberAddress1: StringOrNull;
  MemberAddress2: StringOrNull;
  MemberFax: StringOrNull;
  MemberFirstName: StringOrNull;
  MemberLastName: StringOrNull;
  MemberMiddleName: StringOrNull;
  MemberNamePrefix: StringOrNull;
  MemberNameSuffix: StringOrNull;
  MemberNationalAssociationId: StringOrNull;
  MemberNickname: StringOrNull;
  MemberOfficePhone: StringOrNull;
  MemberOfficePhoneExt: StringOrNull;
  MemberPostalCode: StringOrNull;
  MemberPager: StringOrNull;
  MemberTollFreePhone: StringOrNull;
  ModificationTimestamp: StringOrNull;
  OriginalEntryTimestamp: StringOrNull;
  MemberCity: StringOrNull;
  MemberAOR: StringOrNull;
  MemberCountry: StringOrNull;
  MemberStateOrProvince: StringOrNull;
  MemberStatus: StringOrNull;
  MemberType: StringOrNull;
  MemberSocialMedia: {
    SocialMediaUrlOrId: StringOrNull;
    SocialMediaKey: StringOrNull;
    ResourceRecordKey: StringOrNull;
    SocialMediaType: StringOrNull;
    ModificationTimestamp: StringOrNull;
    ResourceName: StringOrNull;
  }[];
  Media: {
    MediaKey: StringOrNull;
    ResourceRecordKey: StringOrNull;
    LongDescription: StringOrNull;
    MediaURL: StringOrNull;
    ModificationTimestamp: StringOrNull;
    Order: number | null;
    PreferredPhotoYN: boolean;
    ResourceRecordId: StringOrNull;
    ResourceName: StringOrNull;
    MediaCategory: StringOrNull;
  }[];
  office: CREAOfficeData;
};

/**
 * CREA Property listing Type
 */

export interface CREAListingDataRaw {
  ListingKey: string;
  ListOfficeKey: StringOrNull;
  AvailabilityDate: StringOrNull;
  PropertySubType: string;
  DocumentsAvailable: string[];
  LeaseAmount: number | null;
  LeaseAmountFrequency: StringOrNull;
  BusinessType: string[];
  WaterBodyName: StringOrNull;
  View: string[];
  NumberOfBuildings: number | null;
  NumberOfUnitsTotal: number | null;
  LotFeatures: string[];
  LotSizeArea: number | null;
  LotSizeDimensions: StringOrNull;
  LotSizeUnits: StringOrNull;
  PoolFeatures: string[];
  RoadSurfaceType: string[];
  CurrentUse: string[];
  PossibleUse: string[];
  AnchorsCoTenants: StringOrNull;
  WaterfrontFeatures: string[];
  CommunityFeatures: string[];
  Appliances: string[];
  OtherEquipment: string[];
  SecurityFeatures: string[];
  TotalActualRent: number | null;
  ExistingLeaseType: string[];
  AssociationFee: number | null;
  AssociationFeeFrequency: StringOrNull;
  AssociationName: StringOrNull;
  AssociationFeeIncludes: string[];
  OriginalEntryTimestamp: StringOrNull;
  ModificationTimestamp: StringOrNull;
  ListingId: StringOrNull;
  InternetEntireListingDisplayYN: boolean;
  StandardStatus: StringOrNull;
  StatusChangeTimestamp: StringOrNull;
  PublicRemarks: StringOrNull;
  ListPrice: number | null;
  Inclusions: StringOrNull;
  CoListOfficeKey: StringOrNull;
  CoListAgentKey: StringOrNull;
  ListAgentKey: StringOrNull;
  InternetAddressDisplayYN: boolean;
  ListingURL: StringOrNull;
  OriginatingSystemName: StringOrNull;
  PhotosCount: number | null;
  PhotosChangeTimestamp: StringOrNull;
  UnparsedAddress: StringOrNull;
  PostalCode: StringOrNull;
  SubdivisionName: StringOrNull;
  StateOrProvince: StringOrNull;
  StreetDirPrefix: StringOrNull;
  StreetDirSuffix: StringOrNull;
  StreetName: StringOrNull;
  StreetNumber: StringOrNull;
  StreetSuffix: StringOrNull;
  UnitNumber: StringOrNull;
  Country: StringOrNull;
  City: StringOrNull;
  Directions: StringOrNull;
  Latitude: number | null;
  Longitude: number | null;
  CityRegion: StringOrNull;
  ParkingTotal: number | null;
  YearBuilt: number | null;
  BathroomsPartial: number | null;
  BathroomsTotalInteger: number | null;
  BedroomsTotal: number | null;
  BuildingAreaTotal: number | null;
  BuildingAreaUnits: StringOrNull;
  BuildingFeatures: string[];
  AboveGradeFinishedArea: number | null;
  AboveGradeFinishedAreaUnits: StringOrNull;
  LivingArea: number | null;
  LivingAreaUnits: StringOrNull;
  FireplacesTotal: number | null;
  FireplaceYN: boolean;
  FireplaceFeatures: string[];
  ArchitecturalStyle: string[];
  Heating: string[];
  FoundationDetails: string[];
  Basement: string[];
  ExteriorFeatures: string[];
  Flooring: string[];
  ParkingFeatures: string[];
  Cooling: string[];
  PropertyCondition: string[];
  Roof: string[];
  ConstructionMaterials: string[];
  Stories: number | null;
  PropertyAttachedYN: boolean;
  Zoning: StringOrNull;
  ZoningDescription: StringOrNull;
  TaxAnnualAmount: number | null;
  TaxBlock: StringOrNull;
  TaxLot: StringOrNull;
  TaxYear: number | null;
  StructureType: string[];
  ParcelNumber: StringOrNull;
  Utilities: string[];
  IrrigationSource: string[];
  WaterSource: string[];
  Sewer: string[];
  Electric: string[];
  CommonInterest: StringOrNull;
  Rooms: CREARoomData[];
  Media: {
    MediaKey: StringOrNull;
    ResourceRecordKey: StringOrNull;
    LongDescription: StringOrNull;
    MediaURL: StringOrNull;
    ModificationTimestamp: StringOrNull;
    Order: number | null;
    PreferredPhotoYN: boolean;
    ResourceRecordId: StringOrNull;
    ResourceName: StringOrNull;
    MediaCategory: StringOrNull;
  }[];
  agent: CREAAgentData;
  agent2: CREAAgentData | null;
}
