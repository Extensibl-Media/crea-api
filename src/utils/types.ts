/**
 * Request Type shape for granting access token to CREA
 */

export type CREAAccessToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

/**
 * Webflow CMS Listing Fields (minus Webflow generated fields)
 */
export interface CMSListingFields {
  idnum: string | null;
  listingid: string | null;
  'agentdetails-name': string | null;
  'agent2details-name': string | null;
  'agentdetails-office-name': string | null;
  'agent2details-office-name': string | null;
  'building-fireplacepresent': string | null;
  'building-utilitywater': string | null;
  'land-sizetotaltext': string | null;
  'land-sewer': string | null;
  'address-streetaddress': string | null;
  'address-city': string | null;
  'address-communityname': string | null;
  ownershiptype: string | null;
  propertytype: string | null;
  zoningtype: string | null;
  'building-bathroomtotal': string | null;
  'building-bedroomstotal': string | null;
  'building-appliances': string | null;
  'building-basementtype': string | null;
  'building-constructeddate': string | null;
  'building-exteriorfinish': string | null;
  'building-flooringtype': string | null;
  'building-foundationtype': string | null;
  'building-heatingtype': string | null;
  'building-roofmaterial': string | null;
  parkingspacetotal: string | null;
  images: Array<{
    url: string;
    alt?: string;
  }> | null;
  images2: Array<{
    url: string;
    alt?: string;
  }> | null;
  images3: Array<{
    url: string;
    alt?: string;
  }> | null;
  'publicremarks-2': string | null;
  'rooms-above-3': string | null;
  'rooms-lowerlevel-3': string | null;
  'rooms-mainlevel-3': string | null;
  video: string | null;
  priceint: number | null;
  'building-sizeinterior-int': number | null;
  'building-constructionmaterial': string | null;
  mainimage: { url: string; alt?: string } | null;
  waterfront: boolean;
  name: string;
  'agent-data-full': string | null;
  'agent2-data-full': string | null;
  _archived: boolean;
  _draft: boolean;
  slug: string;
}

/**
 * CMSListingFields + _id property
 */
export type RawCMSFields = CMSListingFields & {
  _id: string;
};

/**
 * CREA Room type (Property has many/null rooms)
 */
export type CREARoomData = {
  RoomKey: string | null;
  ListingKey: string | null;
  ListingId: string | null;
  ModificationTimestamp: string | null;
  RoomDescription: string | null;
  RoomDimensions: string | null;
  RoomLength: number | null;
  RoomLevel: 'Main level' | 'Above' | 'Lower level';
  RoomWidth: number | null;
  RoomLengthWidthUnits: string | null;
  RoomType: string | null;
};

/**
 * CREA Media type (Property/Member/Office has many/null Media entries)
 */

export type CREAMediaData = {
  MediaKey: string | null;
  ResourceRecordKey: string | null;
  LongDescription: string | null;
  MediaURL: string | null;
  ModificationTimestamp: string | null;
  Order: number | null;
  PreferredPhotoYN: boolean;
  ResourceRecordId: string | null;
  ResourceName: string | null;
  MediaCategory: string | null;
};

/**
 * CREA Office Type (Member has one/null office)
 */

export type CREAOfficeData = {
  '@odata.context': string;
  OfficeKey: string | null;
  OfficeMlsId: string | null;
  OfficeAORKey: string | null;
  OfficeNationalAssociationId: string | null;
  FranchiseNationalAssociationId: string | null;
  OfficeBrokerNationalAssociationId: string | null;
  OfficeAddress1: string | null;
  OfficeAddress2: string | null;
  OfficeCity: string | null;
  OfficeFax: string | null;
  OfficeName: string | null;
  OfficePhone: string | null;
  OfficePhoneExt: string | null;
  OfficePostalCode: string | null;
  ModificationTimestamp: string | null;
  OriginalEntryTimestamp: string | null;
  OfficeType: string | null;
  OfficeStateOrProvince: string | null;
  OfficeAOR: string | null;
  OfficeStatus: string | null;
  OfficeSocialMedia: {
    SocialMediaUrlOrId: string | null;
    SocialMediaKey: string | null;
    ResourceRecordKey: string | null;
    SocialMediaType: string | null;
    ModificationTimestamp: string | null;
    ResourceName: string | null;
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
  MemberMlsId: string | null;
  OfficeKey: string | null;
  OfficeNationalAssociationId: string | null;
  JobTitle: string | null;
  MemberAORKey: string | null;
  MemberAddress1: string | null;
  MemberAddress2: string | null;
  MemberFax: string | null;
  MemberFirstName: string | null;
  MemberLastName: string | null;
  MemberMiddleName: string | null;
  MemberNamePrefix: string | null;
  MemberNameSuffix: string | null;
  MemberNationalAssociationId: string | null;
  MemberNickname: string | null;
  MemberOfficePhone: string | null;
  MemberOfficePhoneExt: string | null;
  MemberPostalCode: string | null;
  MemberPager: string | null;
  MemberTollFreePhone: string | null;
  ModificationTimestamp: string | null;
  OriginalEntryTimestamp: string | null;
  MemberCity: string | null;
  MemberAOR: string | null;
  MemberCountry: string | null;
  MemberStateOrProvince: string | null;
  MemberStatus: string | null;
  MemberType: string | null;
  MemberSocialMedia: {
    SocialMediaUrlOrId: string | null;
    SocialMediaKey: string | null;
    ResourceRecordKey: string | null;
    SocialMediaType: string | null;
    ModificationTimestamp: string | null;
    ResourceName: string | null;
  }[];
  Media: {
    MediaKey: string | null;
    ResourceRecordKey: string | null;
    LongDescription: string | null;
    MediaURL: string | null;
    ModificationTimestamp: string | null;
    Order: number | null;
    PreferredPhotoYN: boolean;
    ResourceRecordId: string | null;
    ResourceName: string | null;
    MediaCategory: string | null;
  }[];
  office: CREAOfficeData;
};

/**
 * CREA Property listing Type
 */

export interface CREALlistingDataRaw {
  ListingKey: string;
  ListOfficeKey: string | null;
  AvailabilityDate: string | null;
  PropertySubType: string;
  DocumentsAvailable: string[];
  LeaseAmount: number | null;
  LeaseAmountFrequency: string | null;
  BusinessType: string[];
  WaterBodyName: string | null;
  View: string[];
  NumberOfBuildings: number | null;
  NumberOfUnitsTotal: number | null;
  LotFeatures: string[];
  LotSizeArea: number | null;
  LotSizeDimensions: string | null;
  LotSizeUnits: string | null;
  PoolFeatures: string[];
  RoadSurfaceType: string[];
  CurrentUse: string[];
  PossibleUse: string[];
  AnchorsCoTenants: string | null;
  WaterfrontFeatures: string[];
  CommunityFeatures: string[];
  Appliances: string[];
  OtherEquipment: string[];
  SecurityFeatures: string[];
  TotalActualRent: number | null;
  ExistingLeaseType: string[];
  AssociationFee: number | null;
  AssociationFeeFrequency: string | null;
  AssociationName: string | null;
  AssociationFeeIncludes: string[];
  OriginalEntryTimestamp: string | null;
  ModificationTimestamp: string | null;
  ListingId: string | null;
  InternetEntireListingDisplayYN: boolean;
  StandardStatus: string | null;
  StatusChangeTimestamp: string | null;
  PublicRemarks: string | null;
  ListPrice: number | null;
  Inclusions: string | null;
  CoListOfficeKey: string | null;
  CoListAgentKey: string | null;
  ListAgentKey: string | null;
  InternetAddressDisplayYN: boolean;
  ListingURL: string | null;
  OriginatingSystemName: string | null;
  PhotosCount: number | null;
  PhotosChangeTimestamp: string | null;
  UnparsedAddress: string | null;
  PostalCode: string | null;
  SubdivisionName: string | null;
  StateOrProvince: string | null;
  StreetDirPrefix: string | null;
  StreetDirSuffix: string | null;
  StreetName: string | null;
  StreetNumber: string | null;
  StreetSuffix: string | null;
  UnitNumber: string | null;
  Country: string | null;
  City: string | null;
  Directions: string | null;
  Latitude: number | null;
  Longitude: number | null;
  CityRegion: string | null;
  ParkingTotal: number | null;
  YearBuilt: number | null;
  BathroomsPartial: number | null;
  BathroomsTotalInteger: number | null;
  BedroomsTotal: number | null;
  BuildingAreaTotal: number | null;
  BuildingAreaUnits: string | null;
  BuildingFeatures: string[];
  AboveGradeFinishedArea: number | null;
  AboveGradeFinishedAreaUnits: string | null;
  LivingArea: number | null;
  LivingAreaUnits: string | null;
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
  Zoning: string | null;
  ZoningDescription: string | null;
  TaxAnnualAmount: number | null;
  TaxBlock: string | null;
  TaxLot: string | null;
  TaxYear: number | null;
  StructureType: string[];
  ParcelNumber: string | null;
  Utilities: string[];
  IrrigationSource: string[];
  WaterSource: string[];
  Sewer: string[];
  Electric: string[];
  CommonInterest: string | null;
  Rooms: CREARoomData[];
  Media: {
    MediaKey: string | null;
    ResourceRecordKey: string | null;
    LongDescription: string | null;
    MediaURL: string | null;
    ModificationTimestamp: string | null;
    Order: number | null;
    PreferredPhotoYN: boolean;
    ResourceRecordId: string | null;
    ResourceName: string | null;
    MediaCategory: string | null;
  }[];
  agent: CREAAgentData;
  agent2: CREAAgentData | null;
}
