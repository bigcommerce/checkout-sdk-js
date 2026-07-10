/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `BigDecimal` scalar type represents signed fractional values with arbitrary precision. */
  BigDecimal: { input: any; output: any; }
  /** ISO-8601 formatted date in UTC. (e.g. 2024-01-01T00:00:00Z) */
  DateTime: { input: any; output: any; }
  /** IP4 or IP6 compatible ip address */
  IpAddress: { input: any; output: any; }
  /** The `Long` scalar type represents non-fractional signed whole numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: { input: any; output: any; }
  /** Scalar type representing a valid URL. */
  URL: { input: any; output: any; }
  /** Scalar type representing a universally unique identifier (UUID). */
  UUID: { input: any; output: any; }
};

/** Add cart line items data object */
export type AddCartLineItemsDataInput = {
  /** List of gift certificates */
  giftCertificates?: InputMaybe<Array<CartGiftCertificateInput>>;
  /** List of cart line items */
  lineItems?: InputMaybe<Array<CartLineItemInput>>;
};

/** Add cart line items input object */
export type AddCartLineItemsInput = {
  /** The cart id */
  cartEntityId: Scalars['String']['input'];
  /** Add cart line items data object */
  data: AddCartLineItemsDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Add checkout billing address data object */
export type AddCheckoutBillingAddressDataInput = {
  /** The checkout billing address */
  address: CheckoutAddressInput;
};

/** Add checkout billing address input object */
export type AddCheckoutBillingAddressInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Add checkout billing address data object */
  data: AddCheckoutBillingAddressDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Add checkout shipping consignments data object */
export type AddCheckoutShippingConsignmentsDataInput = {
  /** The list of shipping consignments */
  consignments: Array<CheckoutShippingConsignmentInput>;
};

/** Add checkout shipping consignments input object */
export type AddCheckoutShippingConsignmentsInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Add checkout shipping consignments data object */
  data: AddCheckoutShippingConsignmentsDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Input for adding a company address. */
export type AddCompanyAddressInput = {
  /** First line for the street address. */
  address1: Scalars['String']['input'];
  /** Second line for the street address. */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** City. */
  city: Scalars['String']['input'];
  /** ISO 3166-1 alpha-2 country code. */
  countryCode: Scalars['String']['input'];
  /** Extra fields defined by merchant. */
  extraFields?: InputMaybe<CompanyExtraFieldsInput>;
  /** First name of the address owner. */
  firstName: Scalars['String']['input'];
  /** Last name of the address owner. */
  lastName: Scalars['String']['input'];
  /** Phone number. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code. */
  postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Name of State or Province. */
  stateOrProvince?: InputMaybe<Scalars['String']['input']>;
};

/** Add company file input object. */
export type AddCompanyFileInput = {
  /** The uploaded file ID. */
  fileId: Scalars['String']['input'];
};

/** Add company users data object. */
export type AddCompanyUsersInput = {
  /** The company user extra fields defined by merchant. */
  extraFields?: InputMaybe<CompanyExtraFieldsInput>;
};

/** Input for adding a customer address. */
export type AddCustomerAddressInput = {
  /** First line for the street address. */
  address1: Scalars['String']['input'];
  /** Second line for the street address. */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** City. */
  city: Scalars['String']['input'];
  /** Company name associated with the address. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** 2-letter country code. */
  countryCode: Scalars['String']['input'];
  /** First name of the address owner. */
  firstName: Scalars['String']['input'];
  /** Additional form fields defined by merchant. */
  formFields?: InputMaybe<CustomerFormFieldsInput>;
  /** Last name of the address owner. */
  lastName: Scalars['String']['input'];
  /** Phone number. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code for the address. This is only required for certain countries. */
  postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Name of State or Province. */
  stateOrProvince?: InputMaybe<Scalars['String']['input']>;
};

/** Input for the addProductReview mutation. */
export type AddProductReviewInput = {
  /** ID of the product to submit reviews for. */
  productEntityId: Scalars['Long']['input'];
  /** The review to submit. */
  review: ProductReviewInput;
};

/** Add wishlist items input object */
export type AddWishlistItemsInput = {
  /** The wishlist id */
  entityId: Scalars['Int']['input'];
  /** The new wishlist items */
  items: Array<WishlistItemInput>;
};

/** A common input object for analytics events containing shared fields. */
export type AnalyticsCommonEventInput = {
  /** Consent-related details for the analytics event. */
  consent?: InputMaybe<AnalyticsEventConsentInput>;
  /** Details about the initiator of the analytics event. */
  initiator?: InputMaybe<AnalyticsEventInitiatorInput>;
  /** Request-related details for the analytics event. */
  request: AnalyticsEventRequestInput;
};

/** Input object for capturing user consent details in analytics events. */
export type AnalyticsEventConsentInput = {
  /** User consent related to analytics tracking. */
  analytics: Scalars['Boolean']['input'];
  /** User consent related to functional cookies or settings. */
  functional: Scalars['Boolean']['input'];
  /** User consent related to targeted advertising. */
  targeting: Scalars['Boolean']['input'];
};

/** Input object representing the initiator of an analytics event. */
export type AnalyticsEventInitiatorInput = {
  /** Unique identifier for the visit initiating the event. */
  visitId: Scalars['String']['input'];
  /** Unique identifier for the visitor initiating the event. */
  visitorId: Scalars['String']['input'];
};

/** Input object containing request-related details for analytics events. */
export type AnalyticsEventRequestInput = {
  /** Accepted language preference from the request header. */
  acceptLanguage?: InputMaybe<Scalars['String']['input']>;
  /** IP address associated with the request. */
  ip?: InputMaybe<Scalars['IpAddress']['input']>;
  /** Referrer URL for the analytics event request. */
  refererUrl?: InputMaybe<Scalars['URL']['input']>;
  /** URL associated with the analytics event request. */
  url: Scalars['URL']['input'];
  /** User agent string from the request header. */
  userAgent: Scalars['String']['input'];
};

/** Apply checkout coupon data object */
export type ApplyCheckoutCouponDataInput = {
  /** The checkout coupon code */
  couponCode: Scalars['String']['input'];
};

/** Apply checkout coupon input object */
export type ApplyCheckoutCouponInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Apply checkout coupon data object */
  data: ApplyCheckoutCouponDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Apply checkout gift certificate data object */
export type ApplyCheckoutGiftCertificateDataInput = {
  /** The checkout gift certificate code */
  giftCertificateCode: Scalars['String']['input'];
};

/** Apply checkout gift certificate input object */
export type ApplyCheckoutGiftCertificateInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Apply checkout gift certificate data object */
  data: ApplyCheckoutGiftCertificateDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Apply checkout spam protection data object */
export type ApplyCheckoutSpamProtectionDataInput = {
  /** The checkout spam protection token */
  token: Scalars['String']['input'];
};

/** Apply checkout spam protection input object */
export type ApplyCheckoutSpamProtectionInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Apply checkout spam protection data object */
  data: ApplyCheckoutSpamProtectionDataInput;
};

/** Input for the applySessionSyncCode mutation. */
export type ApplyMcpSessionSyncCodeInput = {
  /** One-time UUID sync code issued by MCP after a session-rotating action. */
  code: Scalars['String']['input'];
};

/** Assign cart to the customer input object. */
export type AssignCartToCustomerInput = {
  /** The cart id. */
  cartEntityId: Scalars['String']['input'];
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Banner location */
export type BannerLocation =
  | 'BOTTOM'
  | 'TOP';

/** Object containing the filters for querying blog posts */
export type BlogPostsFiltersInput = {
  /** Ids of the expected blog posts. */
  entityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Tags of the expected blog posts. */
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Identifier for built-in form fields. */
export type BuiltInFormFieldId =
  | 'AddressLine1'
  | 'AddressLine2'
  | 'City'
  | 'CompanyName'
  | 'ConfirmPassword'
  | 'Country'
  | 'CurrentPassword'
  | 'EmailAddress'
  | 'FirstName'
  | 'LastName'
  | 'Password'
  | 'Phone'
  | 'ReceiveMarketingEmails'
  | 'State'
  | 'Zip';

/** Scope which describes how to cache the query */
export type CacheControlScope =
  /** Public means that query result is available for all users. */
  | 'PUBLIC';

/** Input for cancelling an order return. */
export type CancelOrderReturnInput = {
  /** The entity ID of the return to cancel. */
  returnId: Scalars['String']['input'];
};

/** Specific causes for cart-related checkout failures (used by CartError and CartLineItemError). */
export type CartErrorCode =
  /** The supplied attributes are not applicable to the referenced product. */
  | 'ATTRIBUTES_NOT_APPLICABLE'
  /** A cart already exists for this session, preventing checkout creation. */
  | 'CART_ALREADY_EXISTS'
  /** The cart state conflicted with the operation, preventing it from completing. */
  | 'CART_CONFLICT'
  /** The cart is in an inconsistent state and cannot be processed. */
  | 'CART_CONSISTENCY_ERROR'
  /** Cart item modification is not allowed in the current checkout state. */
  | 'CART_ITEM_MODIFICATION_NOT_ALLOWED'
  /** The cart referenced in the request could not be found. */
  | 'CART_NOT_FOUND'
  /** The selected currency is not transactional for this storefront. */
  | 'CURRENCY_NOT_TRANSACTIONAL'
  /** A checkout cannot be created from an empty cart. */
  | 'EMPTY_CART_CREATION'
  /** There is insufficient stock for one or more items in the request. */
  | 'INSUFFICIENT_STOCK'
  /** The channel specified in the request is invalid. */
  | 'INVALID_CHANNEL'
  /** The currency specified in the request is invalid. */
  | 'INVALID_CURRENCY'
  /** The gift certificate amount specified in the request is invalid. */
  | 'INVALID_GIFT_CERTIFICATE_AMOUNT'
  /** The gift certificate theme specified in the request is invalid. */
  | 'INVALID_GIFT_CERTIFICATE_THEME'
  /** An item quantity in the request is invalid. */
  | 'INVALID_ITEM_QUANTITY'
  /** A product referenced in the request is invalid. */
  | 'INVALID_PRODUCT'
  /** The maximum number of cart items has been reached. */
  | 'ITEM_LIMIT_REACHED'
  /** An item referenced in the request could not be found. */
  | 'ITEM_NOT_FOUND'
  /** A maximum purchase quantity has been exceeded for one or more items. */
  | 'MAXIMUM_QUANTITY_EXCEEDED'
  /** A minimum purchase quantity has not been met for one or more items. */
  | 'MINIMUM_QUANTITY_NOT_MET'
  /** Required variant attributes are missing for one or more line items. */
  | 'MISSING_VARIANT_ATTRIBUTES'
  /** Required product modifier options are missing for one or more line items. */
  | 'MODIFIER_OPTIONS_REQUIRED'
  /** Validation of product options failed for one or more items. */
  | 'OPTION_VALIDATION_FAILED'
  /** A product in the request is not purchasable. */
  | 'PRODUCT_NOT_PURCHASABLE'
  /** A product in the request is currently unavailable. */
  | 'PRODUCT_UNAVAILABLE'
  /** The SKU referenced in the request could not be found. */
  | 'SKU_NOT_FOUND'
  /** Stock could not be verified for one or more items. */
  | 'STOCK_CHECK'
  /** A variant ID is required for one or more products in the request. */
  | 'VARIANT_ID_REQUIRED'
  /** A selected variant is not purchasable. */
  | 'VARIANT_NOT_PURCHASABLE';

/** Cart gift certificate input object */
export type CartGiftCertificateInput = {
  /** Value must be between 1.00 and 1,000.00 in the store's default currency. */
  amount: Scalars['BigDecimal']['input'];
  /** Message that will be sent to the gift certificate's recipient. Limited to 200 characters. */
  message?: InputMaybe<Scalars['String']['input']>;
  /** GiftCertificate-provided name that will appear in the control panel. */
  name: Scalars['String']['input'];
  /** The total number of certificates */
  quantity: Scalars['Int']['input'];
  /** Recipient of the gift certificate. */
  recipient: CartGiftCertificateRecipientInput;
  /** Sender of the gift certificate. */
  sender: CartGiftCertificateSenderInput;
  /** Currently supports Birthday, Boy, Celebration, Christmas, General, and Girl. */
  theme: CartGiftCertificateTheme;
};

/** Cart gift certificate recipient input object */
export type CartGiftCertificateRecipientInput = {
  /** Contact's email address. */
  email: Scalars['String']['input'];
  /** Contact's name. */
  name: Scalars['String']['input'];
};

/** Cart gift certificate sender input object */
export type CartGiftCertificateSenderInput = {
  /** Contact's email address. */
  email: Scalars['String']['input'];
  /** Contact's name. */
  name: Scalars['String']['input'];
};

/** Cart gift certificate theme */
export type CartGiftCertificateTheme =
  | 'BIRTHDAY'
  | 'BOY'
  | 'CELEBRATION'
  | 'CHRISTMAS'
  | 'GENERAL'
  | 'GIRL'
  | 'NONE';

/** Cart line item input object */
export type CartLineItemInput = {
  /** The product id (either `SKU` or `productEntityId` must be provided). */
  productEntityId?: InputMaybe<Scalars['Int']['input']>;
  /** Total number of line items. */
  quantity: Scalars['Int']['input'];
  /** The list of selected options for this item. */
  selectedOptions?: InputMaybe<CartSelectedOptionsInput>;
  /** The product SKU (either `SKU` or `productEntityId` must be provided). */
  sku?: InputMaybe<Scalars['String']['input']>;
  /** The variant id */
  variantEntityId?: InputMaybe<Scalars['Int']['input']>;
};

/** Cart line item update checkout input object */
export type CartLineItemUpdateCheckoutInput = {
  /** The line item id. If omitted, a new line item will be created. Otherwise, the existing line item will be updated. */
  entityId?: InputMaybe<Scalars['String']['input']>;
  /** The product id */
  productEntityId?: InputMaybe<Scalars['Int']['input']>;
  /** Total number of line items */
  quantity: Scalars['Int']['input'];
  /** The list of selected options for this item */
  selectedOptions?: InputMaybe<CartSelectedOptionsInput>;
  /** The product SKU */
  sku?: InputMaybe<Scalars['String']['input']>;
  /** The variant id */
  variantEntityId?: InputMaybe<Scalars['Int']['input']>;
};

/** Cart selected checkbox option input object */
export type CartSelectedCheckboxOptionInput = {
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
  /** The product option value ID. */
  optionValueEntityId: Scalars['Int']['input'];
};

/** Cart selected date field option input object */
export type CartSelectedDateFieldOptionInput = {
  /** Date value. */
  date: Scalars['DateTime']['input'];
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
};

/** Cart selected file upload option input object */
export type CartSelectedFileUploadOptionInput = {
  /** URL to download the uploaded file. */
  downloadUrl: Scalars['String']['input'];
  /** Uploaded file name. */
  fileName: Scalars['String']['input'];
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
};

/** Cart selected multiple line text field option input object */
export type CartSelectedMultiLineTextFieldOptionInput = {
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
  /** Text value. */
  text: Scalars['String']['input'];
};

/** Cart selected multiple choice option input object */
export type CartSelectedMultipleChoiceOptionInput = {
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
  /** The product option value ID. */
  optionValueEntityId: Scalars['Int']['input'];
};

/** Cart selected number field option input object */
export type CartSelectedNumberFieldOptionInput = {
  /** Number value. */
  number: Scalars['Float']['input'];
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
};

/** Selected product options. */
export type CartSelectedOptionsInput = {
  /** List of selected checkbox options. */
  checkboxes?: InputMaybe<Array<CartSelectedCheckboxOptionInput>>;
  /** List of selected date field options. */
  dateFields?: InputMaybe<Array<CartSelectedDateFieldOptionInput>>;
  /** List of selected file upload options. */
  fileFields?: InputMaybe<Array<CartSelectedFileUploadOptionInput>>;
  /** List of selected multi-line text field options. */
  multiLineTextFields?: InputMaybe<Array<CartSelectedMultiLineTextFieldOptionInput>>;
  /** List of selected multiple choice options. */
  multipleChoices?: InputMaybe<Array<CartSelectedMultipleChoiceOptionInput>>;
  /** List of selected number field options. */
  numberFields?: InputMaybe<Array<CartSelectedNumberFieldOptionInput>>;
  /** List of selected text field options. */
  textFields?: InputMaybe<Array<CartSelectedTextFieldOptionInput>>;
};

/** Cart selected multiple line text field option input object */
export type CartSelectedTextFieldOptionInput = {
  /** The product option ID. */
  optionEntityId: Scalars['Int']['input'];
  /** TODO */
  text: Scalars['String']['input'];
};

/** The source that created the cart. */
export type CartSource =
  /** Cart created from a B2B (business-to-business) transaction. */
  | 'B2B'
  /** Cart created from a B2B invoice. */
  | 'B2B_INVOICE'
  /** Cart created from a B2B quote. */
  | 'B2B_QUOTE'
  /** Cart created via the Buy Now flow. */
  | 'BUY_NOW';

/** Filter input for a list of integer IDs, that supports various matching behaviors. */
export type CategoryEntityIdsFilterInput = {
  /** List of integer IDs. */
  entityIds: Array<Scalars['Int']['input']>;
  /** Match behavior for the list of IDs. OR - match any of the IDs in the list. AND - match all the IDs in the list. */
  matchBehavior?: ListMatchBehavior;
};

/** Product sorting by categories. */
export type CategoryProductSort =
  | 'A_TO_Z'
  | 'BEST_REVIEWED'
  | 'BEST_SELLING'
  | 'DEFAULT'
  | 'FEATURED'
  | 'HIGHEST_PRICE'
  | 'LOWEST_PRICE'
  | 'NEWEST'
  | 'Z_TO_A';

/** Price range filter for category products. */
export type CategoryProductsPriceFilterInput = {
  /** Maximum price. Only products with a calculated price less than or equal to this value will be returned. */
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum price. Only products with a calculated price greater than or equal to this value will be returned. */
  minPrice?: InputMaybe<Scalars['Int']['input']>;
};

/** The input for changing a customer password. */
export type ChangePasswordInput = {
  /** The current password. Do not pass this directly in the query, use GraphQL variables. */
  currentPassword: Scalars['String']['input'];
  /** The new password. Do not pass this directly in the query, use GraphQL variables. */
  newPassword: Scalars['String']['input'];
};

/** The user input for checkbox form fields. */
export type CheckboxesFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** The choice indexes of the form field values. */
  fieldValueEntityIds: Array<Scalars['Int']['input']>;
};

/** Checkout address checkboxes custom field input object */
export type CheckoutAddressCheckboxesCustomFieldInput = {
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** The choice indexes of the form field values. */
  fieldValueEntityIds: Array<Scalars['Int']['input']>;
};

/** Checkout address custom field input object */
export type CheckoutAddressCustomFieldInput = {
  /** List of checkboxes custom fields. */
  checkboxes?: InputMaybe<Array<CheckoutAddressCheckboxesCustomFieldInput>>;
  /** List of date custom fields. */
  dates?: InputMaybe<Array<CheckoutAddressDateCustomFieldInput>>;
  /** List of multiple choice custom fields. */
  multipleChoices?: InputMaybe<Array<CheckoutAddressMultipleChoiceCustomFieldInput>>;
  /** List of number custom fields. */
  numbers?: InputMaybe<Array<CheckoutAddressNumberCustomFieldInput>>;
  /** List of password custom fields. */
  passwords?: InputMaybe<Array<CheckoutAddressPasswordCustomFieldInput>>;
  /** List of text custom fields. */
  texts?: InputMaybe<Array<CheckoutAddressTextCustomFieldInput>>;
};

/** Checkout address date custom field input object */
export type CheckoutAddressDateCustomFieldInput = {
  /** Date value. */
  date: Scalars['DateTime']['input'];
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
};

/** Checkout address input object */
export type CheckoutAddressInput = {
  /** Address line 1 */
  address1?: InputMaybe<Scalars['String']['input']>;
  /** Address line 2 */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** Name of the city */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Company name */
  company?: InputMaybe<Scalars['String']['input']>;
  /** Country code */
  countryCode: Scalars['String']['input'];
  /** List of custom fields */
  customFields?: InputMaybe<CheckoutAddressCustomFieldInput>;
  /** Email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The first name */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** The last name */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code */
  postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Should we save this address? */
  shouldSaveAddress: Scalars['Boolean']['input'];
  /** State or province */
  stateOrProvince?: InputMaybe<Scalars['String']['input']>;
  /** Code of the state or province */
  stateOrProvinceCode?: InputMaybe<Scalars['String']['input']>;
};

/** Checkout address multiple choice custom field input object */
export type CheckoutAddressMultipleChoiceCustomFieldInput = {
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** The choice index of the form field value. */
  fieldValueEntityId: Scalars['Int']['input'];
};

/** Checkout address number custom field input object */
export type CheckoutAddressNumberCustomFieldInput = {
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Number value. */
  number: Scalars['Float']['input'];
};

/** Checkout address password custom field input object */
export type CheckoutAddressPasswordCustomFieldInput = {
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Password value. */
  password: Scalars['String']['input'];
};

/** Checkout address text custom field input object */
export type CheckoutAddressTextCustomFieldInput = {
  /** The custom field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Text value. */
  text: Scalars['String']['input'];
};

/** Checkout consignment line item input object */
export type CheckoutConsignmentLineItemInput = {
  /** The line item id */
  lineItemEntityId: Scalars['String']['input'];
  /** The total number of consignment line items */
  quantity: Scalars['Int']['input'];
};

/** Specific causes for checkout-flow failures (used by CheckoutShippingConsignmentError, CheckoutBillingAddressError and CheckoutCouponError). */
export type CheckoutErrorCode =
  /** Billing address modification is not allowed in the current checkout state. */
  | 'BILLING_ADDRESS_MODIFICATION_NOT_ALLOWED'
  /** The maximum number of shipping consignments has been exceeded. */
  | 'CONSIGNMENT_LIMIT_EXCEEDED'
  /** The consignment referenced in the request could not be found. */
  | 'CONSIGNMENT_NOT_FOUND'
  /** The coupon has expired and can no longer be applied. */
  | 'COUPON_EXPIRED'
  /** The cart is not eligible for the supplied coupon. */
  | 'COUPON_INELIGIBLE'
  /** The supplied coupon code is invalid. */
  | 'COUPON_INVALID'
  /** The coupon cannot be applied from the current location. */
  | 'COUPON_INVALID_LOCATION'
  /** The cart does not meet the coupon's minimum purchase requirement. */
  | 'COUPON_MIN_PURCHASE'
  /** Coupon modification is not allowed in the current checkout state. */
  | 'COUPON_MODIFICATION_NOT_ALLOWED'
  /** The coupon is not applicable to the items in the cart. */
  | 'COUPON_NOT_APPLICABLE'
  /** The billing address is missing one or more required fields. */
  | 'INCOMPLETE_BILLING_ADDRESS'
  /** The shipping address is missing one or more required fields. */
  | 'INCOMPLETE_SHIPPING_ADDRESS'
  /** The selected shipping option is invalid. */
  | 'INVALID_SHIPPING_OPTION'
  /** One or more line items in the consignment are missing a shipping address. */
  | 'ITEM_MISSING_SHIPPING_ADDRESS'
  /** A shipping address is required for the operation. */
  | 'MISSING_SHIPPING_ADDRESS'
  /** A shipping consignment in the request is missing one or more required items. */
  | 'SHIPPING_CONSIGNMENT_MISSING_ITEM';

/** Checkout promotion banner location. */
export type CheckoutPromotionBannerLocation =
  | 'CART_PAGE'
  | 'CHECKOUT_PAGE'
  | 'HOME_PAGE'
  | 'PRODUCT_PAGE';

/** Checkout promotion banner type. */
export type CheckoutPromotionBannerType =
  | 'APPLIED'
  | 'ELIGIBLE'
  | 'PROMOTION'
  | 'UPSELL';

/** Checkout shipping consignments input object */
export type CheckoutShippingConsignmentInput = {
  /** Shipping consignment address. */
  address: CheckoutAddressInput;
  /** List of line items for the consignment. */
  lineItems: Array<CheckoutConsignmentLineItemInput>;
};

/** Specific causes for tax-related checkout failures (used by CheckoutTaxError). */
export type CheckoutTaxErrorCode =
  /** A tax quote could not be obtained for the current checkout state. */
  | 'TAX_QUOTE_UNAVAILABLE';

/** Filters to apply when querying company addresses. */
export type CompanyAddressFiltersInput = {
  /** Filter to addresses enabled for billing. */
  isBilling?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to addresses marked as the default billing address. */
  isDefaultBilling?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to addresses marked as the default shipping address. */
  isDefaultShipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to addresses enabled for shipping. */
  isShipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** Text search applied to address fields. */
  searchQuery?: InputMaybe<Scalars['String']['input']>;
};

/** Sort direction for company address results. */
export type CompanyAddressSortDirection =
  | 'ASC'
  | 'DESC';

/** Field to sort company addresses by. */
export type CompanyAddressSortField =
  | 'CREATED_AT';

/** Specifies a field and direction for sorting company addresses. */
export type CompanyAddressSortInput = {
  /** The sort direction. */
  direction: CompanyAddressSortDirection;
  /** The field to sort by. */
  field: CompanyAddressSortField;
};

/** The input for the filled out company extra fields. */
export type CompanyExtraFieldsInput = {
  /** List of multiline text extra fields input. */
  multilineTexts?: InputMaybe<Array<MultilineTextExtraFieldInput>>;
  /** List of multiple choice extra fields input for pick lists fields. */
  multipleChoices?: InputMaybe<Array<MultipleChoiceExtraFieldInput>>;
  /** List of number extra fields input. */
  numbers?: InputMaybe<Array<NumberExtraFieldInput>>;
  /** List of text extra fields input. */
  texts?: InputMaybe<Array<TextExtraFieldInput>>;
};

/** The status of a company. */
export type CompanyStatus =
  /** Company registration has been approved. */
  | 'APPROVED'
  /** Company has been deleted. */
  | 'DELETED'
  /** Company is inactive. */
  | 'INACTIVE'
  /** Company registration is pending approval. */
  | 'PENDING'
  /** Company registration has been rejected. */
  | 'REJECTED';

/** The company user form fields to set, grouped by value type. */
export type CompanyUserFormFieldsInput = {
  /** Multiple choice form field values to set. */
  multipleChoices?: InputMaybe<Array<MultipleChoiceCompanyUserFormFieldInput>>;
  /** Number form field values to set. */
  numbers?: InputMaybe<Array<NumberCompanyUserFormFieldInput>>;
  /** Text form field values to set. */
  texts?: InputMaybe<Array<TextCompanyUserFormFieldInput>>;
};

/** Complete checkout input object */
export type CompleteCheckoutInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
};

/** An input parameter to narrow down the countries you receive based on country name and code. */
export type CountryFiltersInput =
  /** The 2-letter ISO Alpha-2 code for a country that you can use to filter results. */
  { code: Scalars['String']['input']; name?: never; }
  |  /** The name of a country that you can use to filter results. */
  { code?: never; name: Scalars['String']['input']; };

/** The coupon status. */
export type CouponStatus =
  /** The coupon has been applied to the checkout and is actively contributing to discounts. */
  | 'APPLIED'
  /** The coupon has been staged for the checkout but is not yet actively contributing to discounts. */
  | 'STAGED';

/** The coupon type. */
export type CouponType =
  | 'FREE_SHIPPING'
  | 'PERCENTAGE_DISCOUNT'
  | 'PER_ITEM_DISCOUNT'
  | 'PER_TOTAL_DISCOUNT'
  | 'PROMOTION'
  | 'SHIPPING_DISCOUNT';

/** Create cart input object */
export type CreateCartInput = {
  /** ISO-4217 currency code */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** List of gift certificates */
  giftCertificates?: InputMaybe<Array<CartGiftCertificateInput>>;
  /** List of cart line items */
  lineItems?: InputMaybe<Array<CartLineItemInput>>;
  /** Locale of the cart */
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Create cart's metafield data. */
export type CreateCartMetafieldDataInput = {
  /** Key for cart metafield. */
  key: Scalars['String']['input'];
  /** Value for cart metafield. */
  value: Scalars['String']['input'];
};

/** Input for create cart's metafield. */
export type CreateCartMetafieldInput = {
  /** Cart id for which to create metafield. */
  cartEntityId: Scalars['String']['input'];
  /** Create cart's metafield data. */
  data: CreateCartMetafieldDataInput;
};

/** Create cart redirect URLs input object. */
export type CreateCartRedirectUrlsInput = {
  /** Synchronize analytics data on session synchronization. */
  analytics?: InputMaybe<AnalyticsCommonEventInput>;
  /** The cart id to create the redirect URLs for. */
  cartEntityId?: InputMaybe<Scalars['String']['input']>;
  /** IP4 or IP6 compatible address to include in the session redirect url */
  ipAddress?: InputMaybe<Scalars['IpAddress']['input']>;
  /** Payment wallet data on session synchronization. */
  paymentWalletData?: InputMaybe<PaymentWalletDataInput>;
  /** The query parameters to pass when redirecting to the URLs. */
  queryParams?: InputMaybe<Array<CreateCartRedirectUrlsQueryParamsInput>>;
  /** Visit id to synchronise analytics data on session synchronization. */
  visitId?: InputMaybe<Scalars['UUID']['input']>;
  /** Visitor id to synchronise analytics data on session synchronization. */
  visitorId?: InputMaybe<Scalars['UUID']['input']>;
};

/** Create cart redirect URLs query params input object. */
export type CreateCartRedirectUrlsQueryParamsInput = {
  /** The key of the query parameter to pass. */
  key: Scalars['String']['input'];
  /** The value of the query parameter to pass. */
  value: Scalars['String']['input'];
};

/** Create checkout input object */
export type CreateCheckoutInput = {
  /** The checkout billing address */
  billingAddress?: InputMaybe<CheckoutAddressInput>;
  /** List of coupon codes to apply to the checkout */
  coupons?: InputMaybe<Array<Scalars['String']['input']>>;
  /** ISO-4217 currency code */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  /** List of gift certificates */
  giftCertificates?: InputMaybe<Array<CartGiftCertificateInput>>;
  /** List of cart line items */
  lineItems?: InputMaybe<Array<CartLineItemInput>>;
  /** Locale of the cart */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** The list of shipping consignments */
  shippingConsignments?: InputMaybe<Array<CreateCheckoutShippingConsignmentInput>>;
};

/** Create checkout shipping consignment input object */
export type CreateCheckoutShippingConsignmentInput = {
  /** The shipping address */
  address: CheckoutAddressInput;
  /** Whether to select the recommended shipping option */
  selectRecommendedOption?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input for creating an order return. */
export type CreateOrderReturnInput = {
  /** The items to return. */
  items: Array<CreateOrderReturnItemInput>;
  /** An optional free-text note to include with the return. */
  note?: InputMaybe<Scalars['String']['input']>;
  /** The entity ID of the order to return items from. */
  orderEntityId: Scalars['Int']['input'];
};

/** Input for a specific item in a return. */
export type CreateOrderReturnItemInput = {
  /** The entity ID of the line item being returned. */
  lineItemEntityId: Scalars['Int']['input'];
  /** The quantity of items to return. */
  quantity: Scalars['Int']['input'];
  /** The entity ID of the return reason. */
  reasonEntityId: Scalars['String']['input'];
  /** The resolution requested by the customer. */
  requestedResolution?: InputMaybe<RequestedResolutionInput>;
};

/** Create payment wallet intent input object. */
export type CreatePaymentWalletIntentInput = {
  /** The cart id. */
  cartEntityId: Scalars['String']['input'];
  /** The payment wallet id. */
  paymentWalletEntityId: Scalars['String']['input'];
};

/** Create subscriber input object. */
export type CreateSubscriberInput = {
  /** The email address of the subscriber. */
  email: Scalars['String']['input'];
  /** The first name of the subscriber. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** The last name of the subscriber. */
  lastName?: InputMaybe<Scalars['String']['input']>;
};

/** Create wishlist input object */
export type CreateWishlistInput = {
  /** A wishlist visibility mode */
  isPublic: Scalars['Boolean']['input'];
  /** A wishlist items */
  items?: InputMaybe<Array<WishlistItemInput>>;
  /** A wishlist name */
  name: Scalars['String']['input'];
};

/** Currency symbol position */
export type CurrencySymbolPosition =
  | 'LEFT'
  | 'RIGHT';

/** The input for the filled out customer form fields. */
export type CustomerFormFieldsInput = {
  /** List of checkboxes custom form fields input. */
  checkboxes?: InputMaybe<Array<CheckboxesFormFieldInput>>;
  /** List of date custom form fields input. */
  dates?: InputMaybe<Array<DateFormFieldInput>>;
  /** List of multiline text custom form fields input. */
  multilineTexts?: InputMaybe<Array<MultilineTextFormFieldInput>>;
  /** List of multiple choice custom form fields input. This includes pick lists. */
  multipleChoices?: InputMaybe<Array<MultipleChoiceFormFieldInput>>;
  /** List of number custom form fields input. */
  numbers?: InputMaybe<Array<NumberFormFieldInput>>;
  /** List of password custom form fields input. */
  passwords?: InputMaybe<Array<PasswordFormFieldInput>>;
  /** List of text custom form fields input. */
  texts?: InputMaybe<Array<TextFormFieldInput>>;
};

/** The user input for date form fields. */
export type DateFormFieldInput = {
  /** The user date input for the form field in ISO-8601 format. */
  date: Scalars['DateTime']['input'];
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
};

/** Delete cart input object */
export type DeleteCartInput = {
  /** The cart id */
  cartEntityId: Scalars['String']['input'];
};

/** Delete cart line item input object */
export type DeleteCartLineItemInput = {
  /** The cart id */
  cartEntityId: Scalars['String']['input'];
  /** The line item id */
  lineItemEntityId: Scalars['String']['input'];
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Input for delete cart's metafield mutation. */
export type DeleteCartMetafieldInput = {
  /** Id of the cart for which to delete metafield. */
  cartEntityId: Scalars['String']['input'];
  /** Id of metafield to delete. */
  metafieldEntityId: Scalars['Int']['input'];
};

/** Delete checkout consignment input object */
export type DeleteCheckoutConsignmentInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** The consignment id */
  consignmentEntityId: Scalars['String']['input'];
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Input for deleting a customer address. */
export type DeleteCustomerAddressInput = {
  /** Address entity ID for the customer address to delete. */
  addressEntityId: Scalars['Int']['input'];
};

/** Delete wishlist items input object */
export type DeleteWishlistItemsInput = {
  /** The wishlist id */
  entityId: Scalars['Int']['input'];
  /** The wishlist item ids */
  itemEntityIds: Array<Scalars['Int']['input']>;
};

/** Delete wishlists input object */
export type DeleteWishlistsInput = {
  /** The wishlist ids */
  entityIds: Array<Scalars['Int']['input']>;
};

/** Destination address type (Residential or Commercial). */
export type DestinationAddressType =
  | 'COMMERCIAL'
  | 'RESIDENTIAL';

/** Filter locations by the distance */
export type DistanceFilter = {
  /** Signed decimal degrees without compass direction */
  latitude: Scalars['Float']['input'];
  /** Length unit */
  lengthUnit: LengthUnit;
  /** Signed decimal degrees without compass direction */
  longitude: Scalars['Float']['input'];
  /** Radius of search in length units specified in lengthUnit argument */
  radius: Scalars['Float']['input'];
};

/** Entity page type */
export type EntityPageType =
  | 'BLOG_POST'
  | 'BRAND'
  | 'CATEGORY'
  | 'CONTACT_US'
  | 'PAGE'
  | 'PRODUCT';

/** Category of promotions. */
export type FeaturedPromotionCategory =
  /** Cart level featured promotion. */
  | 'CART'
  /** Shipping level featured promotion. */
  | 'SHIPPING';

/** The fee type. */
export type FeeType =
  | 'CUSTOM_FEE';

/** Object containing filters for querying form fields. */
export type FormFieldFiltersInput = {
  /** Filter by form field entity IDs. */
  entityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter by built-in form fields. */
  isBuiltIn?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by required form fields. */
  isRequired?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The sorting to use on form field results. */
export type FormFieldSortInput =
  | 'FIELD_ID'
  | 'SORT_ORDER';

/** The time unit that a gift certificate expiry value is measured in. */
export type GiftCertificateExpiryTimeUnit =
  /** The gift certificate expiry time unit is days. */
  | 'DAYS'
  /** The gift certificate expiry time unit is months. */
  | 'MONTHS'
  /** The gift certificate expiry time unit is weeks. */
  | 'WEEKS'
  /** The gift certificate expiry time unit is years. */
  | 'YEARS';

/** Input for the sender or recipient of a gift certificate. */
export type GiftCertificatePreviewCustomerInput = {
  /** The name of the sender or recipient. */
  name: Scalars['String']['input'];
};

/** Input for generating a gift certificate preview. */
export type GiftCertificatePreviewInput = {
  /** The amount to be displayed on the gift certificate preview. */
  amount: Scalars['Float']['input'];
  /** The ISO-4217 currency code for the gift certificate preview. */
  currencyCode: CurrencyCode;
  /** The message to be included on the gift certificate preview. */
  message?: InputMaybe<Scalars['String']['input']>;
  /** The recipient information for the gift certificate preview. */
  recipient: GiftCertificatePreviewCustomerInput;
  /** The sender information for the gift certificate preview. */
  sender: GiftCertificatePreviewCustomerInput;
  /** The theme to be used for the gift certificate preview. */
  theme: GiftCertificateTheme;
};

/** The status of a gift certificate. */
export type GiftCertificateStatus =
  /** The gift certificate is active and can be used. */
  | 'ACTIVE'
  /** The gift certificate is disabled and cannot be used. */
  | 'DISABLED'
  /** The gift certificate has expired and can no longer be used. */
  | 'EXPIRED'
  /** The gift certificate is pending. */
  | 'PENDING';

/** A theme for a gift certificate. */
export type GiftCertificateTheme =
  | 'BIRTHDAY'
  | 'BOY'
  | 'CELEBRATION'
  | 'CHRISTMAS'
  | 'GENERAL'
  | 'GIRL';

/** Enum with error type. */
export type InvalidSessionSyncJwtErrorType =
  /** Unknown issue with the token. */
  | 'OTHER'
  /** Shopper IP of JWT token mismatch. */
  | 'SHOPPER_IP_MISMATCH'
  /** Store ID of JWT token mismatch. */
  | 'STORE_ID_MISMATCH';

/** length unit */
export type LengthUnit =
  | 'Kilometres'
  | 'Miles';

/** Limit date by */
export type LimitDateOption =
  | 'EARLIEST_DATE'
  | 'LATEST_DATE'
  | 'NO_LIMIT'
  | 'RANGE';

/** Limit numbers by several options. */
export type LimitInputBy =
  | 'HIGHEST_VALUE'
  | 'LOWEST_VALUE'
  | 'NO_LIMIT'
  | 'RANGE';

/** Match behavior for search filters, where a list of values is provided. OR - match any of the values in the list. AND - match all the values in the list. */
export type ListMatchBehavior =
  | 'AND'
  | 'OR';

/** Filters applied on listing order returns. */
export type ListOrderReturnsFiltersInput = {
  /** Apply filter by the order ID. */
  orderId?: InputMaybe<Scalars['String']['input']>;
  /** Apply filter by the order return IDs. */
  orderReturnIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Apply filter by the returns statuses. */
  statuses?: InputMaybe<Array<OrderReturnStatusFiltersInput>>;
};

/** The user input for multiline text extra fields. */
export type MultilineTextExtraFieldInput = {
  /** Multiline text value. */
  multilineText: Scalars['String']['input'];
  /** The label/name of the extra field. */
  name: Scalars['String']['input'];
};

/** The user input for multiline text form fields. */
export type MultilineTextFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Multiline text value. */
  multilineText: Scalars['String']['input'];
};

/** A multiple choice company user form field value to set. */
export type MultipleChoiceCompanyUserFormFieldInput = {
  /** The label/name of the form field. */
  name: Scalars['String']['input'];
  /** The selected choice values. */
  values: Array<Scalars['String']['input']>;
};

/** The user input for multiple choice extra fields. */
export type MultipleChoiceExtraFieldInput = {
  /** The choice value of the extra field. */
  fieldValue: Scalars['String']['input'];
  /** The label/name of the extra field. */
  name: Scalars['String']['input'];
};

/** The user input for multiple choice form fields. */
export type MultipleChoiceFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** The choice index of the form field value. */
  fieldValueEntityId: Scalars['Int']['input'];
};

/** A number company user form field value to set. */
export type NumberCompanyUserFormFieldInput = {
  /** The label/name of the form field. */
  name: Scalars['String']['input'];
  /** The value. */
  value: Scalars['BigDecimal']['input'];
};

/** The user input for number extra fields. */
export type NumberExtraFieldInput = {
  /** The label/name of the extra field. */
  name: Scalars['String']['input'];
  /** The number input of the number field. */
  number: Scalars['BigDecimal']['input'];
};

/** The user input for number form fields. */
export type NumberFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** The number input of the number field. */
  number: Scalars['Float']['input'];
};

/** Behavior of the variant when stock is equal to 0 */
export type OptionOutOfStockBehavior =
  | 'DO_NOTHING'
  | 'HIDE_OPTION'
  | 'LABEL_OPTION';

/** A variant option value id input object */
export type OptionValueId = {
  /** A variant option id filter */
  optionEntityId: Scalars['Int']['input'];
  /** A variant value id filter. */
  valueEntityId: Scalars['Int']['input'];
};

/** A date range filter input object */
export type OrderDateRangeFilterInput = {
  /** The start date of the date range filter. */
  from: Scalars['DateTime']['input'];
  /** The end date of the date range filter. */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Filter for order query. */
export type OrderFilterInput = {
  /** Cart id. Only guest orders can be fetched by cart id. Customer orders will not be returned. */
  cartEntityId?: InputMaybe<Scalars['String']['input']>;
  /** Order id. */
  entityId: Scalars['Int']['input'];
};

/** Who the message is from. */
export type OrderMessageFrom =
  | 'ADMIN'
  | 'CUSTOMER';

/** The status of a customer message. */
export type OrderMessageStatus =
  | 'READ'
  | 'UNREAD';

/** Sort input for order messages. */
export type OrderMessagesSortInput =
  | 'UNREAD';

/** Current status of the Return Item */
export type OrderReturnItemStatus =
  /** Return item AUTHORIZED status */
  | 'AUTHORIZED'
  /** Return item OPEN status */
  | 'OPEN'
  /** Return item RECEIVED status */
  | 'RECEIVED'
  /** Return item RESOLVED status */
  | 'RESOLVED';

/** The outcome type of resolution. */
export type OrderReturnResolutionOutcome =
  /** A custom resolution was applied. */
  | 'CUSTOM'
  /** The return was declined. */
  | 'DECLINE'
  /** The return was exchanged. */
  | 'EXCHANGE'
  /** The return was refunded. */
  | 'REFUND'
  /** The return item has not been resolved yet. */
  | 'UNRESOLVED';

/** Current status of a Return. */
export type OrderReturnStatus =
  /** Return CANCELLED status */
  | 'CANCELLED'
  /** Return CLOSED status */
  | 'CLOSED'
  /** Return IN_PROGRESS status */
  | 'IN_PROGRESS'
  /** Return OPEN status */
  | 'OPEN';

/** Return status filter applied on listing order returns. */
export type OrderReturnStatusFiltersInput =
  /** Return CANCELLED status */
  | 'CANCELLED'
  /** Return CLOSED status */
  | 'CLOSED'
  /** Return IN_PROGRESS status */
  | 'IN_PROGRESS'
  /** Return OPEN status */
  | 'OPEN';

/** The current status of an order. */
export type OrderStatusValue =
  | 'AWAITING_FULFILLMENT'
  | 'AWAITING_PAYMENT'
  | 'AWAITING_PICKUP'
  | 'AWAITING_SHIPMENT'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'DISPUTED'
  | 'INCOMPLETE'
  | 'MANUAL_VERIFICATION_REQUIRED'
  | 'PARTIALLY_REFUNDED'
  | 'PARTIALLY_SHIPPED'
  | 'PENDING'
  | 'REFUNDED'
  | 'SHIPPED';

/** Filter input for orders. */
export type OrdersFiltersInput = {
  /** Filter by date range. */
  dateRange?: InputMaybe<OrderDateRangeFilterInput>;
  /** Filter by order status. */
  status?: InputMaybe<OrderStatusValue>;
};

/** Page type */
export type PageType =
  | 'ACCOUNT_ADDRESS'
  | 'ACCOUNT_ADD_ADDRESS'
  | 'ACCOUNT_ADD_PAYMENT_METHOD'
  | 'ACCOUNT_ADD_RETURN'
  | 'ACCOUNT_ADD_WISHLIST'
  | 'ACCOUNT_DOWNLOAD_ITEM'
  | 'ACCOUNT_EDIT'
  | 'ACCOUNT_INBOX'
  | 'ACCOUNT_ORDERS_ALL'
  | 'ACCOUNT_ORDERS_COMPLETED'
  | 'ACCOUNT_ORDERS_DETAILS'
  | 'ACCOUNT_ORDERS_INVOICE'
  | 'ACCOUNT_RECENT_ITEMS'
  | 'ACCOUNT_RETURNS'
  | 'ACCOUNT_RETURN_SAVED'
  | 'ACCOUNT_WISHLISTS'
  | 'ACCOUNT_WISHLIST_DETAILS'
  | 'AUTH_ACCOUNT_CREATED'
  | 'AUTH_CREATE_ACC'
  | 'AUTH_FORGOT_PASS'
  | 'AUTH_LOGIN'
  | 'AUTH_NEW_PASS'
  | 'BLOG'
  | 'BRANDS'
  | 'CART'
  | 'COMPARE'
  | 'GIFT_CERT_BALANCE'
  | 'GIFT_CERT_PURCHASE'
  | 'GIFT_CERT_REDEEM'
  | 'HOME'
  | 'ORDER_INFO'
  | 'SEARCH'
  | 'SITEMAP'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBE';

/** Input object for fields related to a page-viewed event. */
export type PageViewedEventInput = {
  /** Common input fields for the page-viewed event. */
  commonInput: AnalyticsCommonEventInput;
};

/** The user input for password form fields. */
export type PasswordFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Password value. */
  password: Scalars['String']['input'];
};

/** The status of a payment. */
export type PaymentResultStatus =
  | 'ERROR'
  | 'FAILURE'
  | 'PENDING'
  | 'SUCCESS';

/** The payment wallet data input. */
export type PaymentWalletDataInput = {
  /** Initialization id. */
  initializationId?: InputMaybe<Scalars['String']['input']>;
  /** Provider id. */
  providerId?: InputMaybe<Scalars['String']['input']>;
  /** Provider order id. */
  providerOrderId?: InputMaybe<Scalars['String']['input']>;
};

/** Filter for payment wallet with initialization query. */
export type PaymentWalletWithInitializationDataFilterInput = {
  /** Cart Id. */
  cartEntityId?: InputMaybe<Scalars['String']['input']>;
  /** Payment wallet Id. */
  paymentWalletEntityId: Scalars['String']['input'];
};

/** Filter for payment wallets query. */
export type PaymentWalletsFilterInput = {
  /** 2-letter billing country code. */
  billingCountryCode?: InputMaybe<Scalars['String']['input']>;
  /** Cart Id. */
  cartEntityId?: InputMaybe<Scalars['String']['input']>;
  /** Currency Code. */
  currencyCode?: InputMaybe<Scalars['String']['input']>;
};

/** Filter input for payments. */
export type PaymentsFiltersInput = {
  /** The status we want to fetch orders by. */
  status?: InputMaybe<PaymentResultStatus>;
};

/** Search by price range. At least a minPrice or maxPrice must be supplied. */
export type PriceSearchFilterInput = {
  /** Maximum price of the product. */
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  /** Minimum price of the product. */
  minPrice?: InputMaybe<Scalars['Float']['input']>;
};

/** Filter by the attributes of products such as Product Options and Product Custom Fields. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
export type ProductAttributeSearchFilterInput = {
  /** Product attributes */
  attribute: Scalars['String']['input'];
  /** Product attribute values */
  values: Array<Scalars['String']['input']>;
};

/** Product availability status */
export type ProductAvailabilityStatus =
  | 'Available'
  | 'Preorder'
  | 'Unavailable';

/** Categories sorting. */
export type ProductCategorySort =
  | 'PRODUCT_ASSIGNED_DATE';

/** Product condition */
export type ProductConditionType =
  | 'NEW'
  | 'REFURBISHED'
  | 'USED';

/** Product details input */
export type ProductDetailsInput = {
  /** Product count */
  count: Scalars['Int']['input'];
  /** Product id */
  entityId: Scalars['Int']['input'];
};

/** Behavior of the product when stock is equal to 0 */
export type ProductOutOfStockBehavior =
  | 'DO_NOTHING'
  | 'HIDE_PRODUCT'
  | 'HIDE_PRODUCT_AND_ACCESSIBLE'
  | 'HIDE_PRODUCT_AND_REDIRECT';

/** Content of the review to be added */
export type ProductReviewInput = {
  /** Product review author. */
  author: Scalars['String']['input'];
  /** Email of review author. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Product review rating. */
  rating: Scalars['Int']['input'];
  /** Product review text. */
  text: Scalars['String']['input'];
  /** Product review title. */
  title: Scalars['String']['input'];
};

/** Product reviews filters. */
export type ProductReviewsFiltersInput = {
  /** Product reviews filter by rating. */
  rating?: InputMaybe<ProductReviewsRatingFilterInput>;
};

/** Product reviews filter by rating. */
export type ProductReviewsRatingFilterInput = {
  /** Maximum rating of the product. */
  maxRating?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum rating of the product. */
  minRating?: InputMaybe<Scalars['Int']['input']>;
};

/** Product reviews sorting. */
export type ProductReviewsSortInput =
  | 'HIGHEST_RATING'
  | 'LOWEST_RATING'
  | 'NEWEST'
  | 'OLDEST';

/** Input object for defining product-related details in analytics events. */
export type ProductViewed = {
  /** Unique identifier for the product entity. */
  productEntityId: Scalars['Int']['input'];
  /** Search keyword related to the product type. */
  searchKeyword?: InputMaybe<Scalars['String']['input']>;
};

/** Input object for fields related to a product-viewed event. */
export type ProductViewedEventInput = {
  /** Common input fields for the product-viewed event. */
  commonInput: AnalyticsCommonEventInput;
  /** Product-specific input fields for the event. */
  productInput: ProductViewed;
};

/** Promotion Banner Location */
export type PromotionBannerLocation =
  | 'CART_PAGE'
  | 'CHECKOUT_PAGE'
  | 'HOME_PAGE'
  | 'PRODUCT_PAGE';

/** An input object containing filters for querying promotion banners. */
export type PromotionBannersFiltersInput = {
  /** Filter by a list of locations where a promotion banner will display. */
  locations: Array<PromotionBannerLocation>;
};

/** Purchase Transaction details input */
export type PurchaseTransactionInput = {
  /** Currency Code */
  currencyCode: Scalars['String']['input'];
  /** Revenue */
  revenue: Scalars['Float']['input'];
};

/** Filter by rating. At least a minRating or maxRating must be supplied. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
export type RatingSearchFilterInput = {
  /** Maximum rating of the product. */
  maxRating?: InputMaybe<Scalars['Float']['input']>;
  /** Minimum rating of the product. */
  minRating?: InputMaybe<Scalars['Float']['input']>;
};

/** Recaptcha input (in case Recaptcha is enabled on a store) */
export type ReCaptchaV2Input = {
  /** Recaptcha token */
  token: Scalars['String']['input'];
};

/** The values to use for company registration. */
export type RegisterCompanyInput = {
  /** The address of the company. */
  address: AddCompanyAddressInput;
  /** Admin user extra fields. */
  companyUser?: InputMaybe<AddCompanyUsersInput>;
  /** The email of the company. */
  email: Scalars['String']['input'];
  /** The company extra fields defined by merchant. */
  extraFields?: InputMaybe<CompanyExtraFieldsInput>;
  /** List of uploaded file ids. */
  fileList?: InputMaybe<Array<AddCompanyFileInput>>;
  /** The name of the company. */
  name: Scalars['String']['input'];
  /** The phone number of the company. */
  phone: Scalars['String']['input'];
};

/** The values to use for customer registration. */
export type RegisterCustomerInput = {
  /** The address of the customer. */
  address?: InputMaybe<AddCustomerAddressInput>;
  /** The company of the customer. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** The email of the customer. */
  email: Scalars['String']['input'];
  /** The first name of the customer. */
  firstName: Scalars['String']['input'];
  /** The custom form fields that the customer filled out. */
  formFields?: InputMaybe<CustomerFormFieldsInput>;
  /** The last name of the customer. */
  lastName: Scalars['String']['input'];
  /** The password supplied by the customer. */
  password: Scalars['String']['input'];
  /** The phone number of the customer. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Remove subscriber input object. */
export type RemoveSubscriberInput = {
  /** The email address of the subscriber to be removed. */
  email: Scalars['String']['input'];
};

/** Input for requesting a reset password email. */
export type RequestResetPasswordInput = {
  /** The email address of the customer requesting a reset password email. */
  email: Scalars['String']['input'];
  /** A path to direct the customer to from the email. */
  path?: InputMaybe<Scalars['String']['input']>;
};

/** Input for specifying the resolution requested by the customer. */
export type RequestedResolutionInput = {
  /** The entity ID of the custom resolution, required if type is CUSTOM. */
  customResolutionEntityId?: InputMaybe<Scalars['String']['input']>;
  /** The type of resolution requested. */
  type: RequestedResolutionType;
};

/** Type of resolution requested for a return. */
export type RequestedResolutionType =
  /** A custom resolution defined by the merchant. */
  | 'CUSTOM'
  /** An exchange for another item. */
  | 'EXCHANGE'
  /** A refund to the original payment method. */
  | 'REFUND'
  /** Store credit issued to the customer's account. */
  | 'STORE_CREDIT';

/** Input for resetting a password. */
export type ResetPasswordInput = {
  /** The customer ID of the customer resetting their password. */
  customerEntityId: Scalars['Int']['input'];
  /** The new password for the customer. */
  newPassword: Scalars['String']['input'];
  /** The token sent to the customer in the reset password email. */
  token: Scalars['String']['input'];
};

/** Retail AI input. */
export type RetailAiInput = {
  /** If set to be non-empty, then it needs to be one of {'no-diversity', 'low-diversity', 'medium-diversity', 'high-diversity', 'auto-diversity'}. This gives request-level control and adjusts prediction results based on product category. */
  diversityLevel?: InputMaybe<Scalars['String']['input']>;
  /** If set to true, the filter field is interpreteted according to the new, attribute-based syntax. */
  filterSyntaxV2?: InputMaybe<Scalars['Boolean']['input']>;
  /** If set to be non-empty, then it needs to be one of {'no-price-reranking', 'low-price-reranking', 'medium-price-reranking', 'high-price-reranking'}. This gives request-level control and adjusts prediction results based on product price. */
  priceRerankLevel?: InputMaybe<Scalars['String']['input']>;
  /** If set to false, the service will return generic (unfiltered) popular products instead of empty if your filter blocks all prediction results. */
  strictFiltering?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Type of system-defined resolution. */
export type ReturnSystemResolutionType =
  /** Exchange resolution type. */
  | 'EXCHANGE'
  /** Refund resolution type. */
  | 'REFUND'
  /** Store credit resolution type. */
  | 'STORE_CREDIT';

/** Enum value to specify the desired behavior when encountering a redirect for the requested route. */
export type RouteRedirectBehavior =
  /** If there is a dynamic/association redirect configured, the `node` node will return a resulting entity (category, product, etc.) that a redirect points to. If there is a static/manual redirect configured, the `node` node will return null, as there is no entity associated with it, the `redirect node` however will return the redirect details. */
  | 'FOLLOW'
  /** No redirects are taken into account, relying on custom URLs only. If there is the same path for both redirect and entity URL configured, both `redirect` node and `node` node return respective non-null values. */
  | 'IGNORE';

/** Categorizes scripts according to privacy and consent requirements */
export type ScriptConsentCategory =
  /** Scripts used for analytics */
  | 'ANALYTICS'
  /** Scripts that are essential for core website functionality */
  | 'ESSENTIAL'
  /** Scripts that enhance website functionality */
  | 'FUNCTIONAL'
  /** Scripts used for advertising and marketing purposes */
  | 'TARGETING'
  /** Scripts with an unspecified or unknown consent category */
  | 'UNKNOWN';

/** Defines where in the HTML document a script should be placed */
export type ScriptLocation =
  /** Script will be placed in the footer section of the page */
  | 'FOOTER'
  /** Script will be placed in the head section of the page */
  | 'HEAD';

/** Defines which pages a script should be visible on */
export type ScriptVisibility =
  /** Script appears on all store pages */
  | 'ALL_PAGES'
  /** Script appears only on checkout pages */
  | 'CHECKOUT'
  /** Script appears only on order confirmation pages */
  | 'ORDER_CONFIRMATION'
  /** Script appears only on storefront pages */
  | 'STOREFRONT';

/** Filters for querying scripts */
export type ScriptsFilters = {
  /** Filter scripts by their consent categories */
  consentCategories?: InputMaybe<Array<ScriptConsentCategory>>;
  /** Filter scripts by their location on the page */
  location?: InputMaybe<ScriptLocation>;
  /** Filter scripts by their visibility settings */
  visibilities?: InputMaybe<Array<ScriptVisibility>>;
};

/** Input object for fields related to a search product event. */
export type SearchProductEventInput = {
  /** Common input fields for the search product event. */
  commonInput: AnalyticsCommonEventInput;
  /** List of product IDs returned in search results. */
  productIds: Array<Scalars['Int']['input']>;
  /** Search term used by the shopper. */
  searchTerm: Scalars['String']['input'];
};

/** Object containing available search filters for use when querying Products. */
export type SearchProductsFiltersInput = {
  /** Filter by products belonging to any of the specified Brands. */
  brandEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter by products belonging to a single Category. This is intended for use when presenting a Category page in a PLP experience. This argument must be used in order for custom product sorts and custom product filtering settings targeted at a particular category to take effect. */
  categoryEntityId?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by products belonging to any of the specified Categories. Intended for Advanced Search and Faceted Search/Product Filtering use cases, not for a page for a specific Category. */
  categoryEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter by products belonging to any or all of the specified Categories. Intended for Advanced Search and Faceted Search/Product Filtering use cases, not for a page for a specific Category. */
  categoryIdsFilter?: InputMaybe<CategoryEntityIdsFilterInput>;
  /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
  hideOutOfStock?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filters by Products which have explicitly been marked as Featured within the catalog. If not supplied, the Featured status of products will not be considered when returning the list of products. */
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filters by Products which have explicit Free Shipping configured within the catalog. If not supplied, the Free Shipping status of products will not be considered when returning the list of products. */
  isFreeShipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** Search by price range. At least a minPrice or maxPrice must be supplied. */
  price?: InputMaybe<PriceSearchFilterInput>;
  /** Filter by the attributes of products such as Product Options and Product Custom Fields. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
  productAttributes?: InputMaybe<Array<ProductAttributeSearchFilterInput>>;
  /** Filter by rating. At least a minRating or maxRating must be supplied. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
  rating?: InputMaybe<RatingSearchFilterInput>;
  /** Boolean argument to determine whether products within sub-Categories will be returned when filtering products by Category. Defaults to False if not supplied. */
  searchSubCategories?: InputMaybe<Scalars['Boolean']['input']>;
  /** Textual search term. Used to search for products based on text entered by a shopper, typically in a search box. Searches against several fields on the product including Name, SKU, and Description. */
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  /** When set to True, the category filter returns only the visible top-level categories; categories reachable only through a hidden or disabled parent are omitted. Defaults to False. */
  topLevelOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Sort to use for the product results. Relevance is the default for textual search terms, and “Featured” is the default for category page contexts without a search term. */
export type SearchProductsSortInput =
  | 'A_TO_Z'
  | 'BEST_REVIEWED'
  | 'BEST_SELLING'
  | 'FEATURED'
  | 'HIGHEST_PRICE'
  | 'LOWEST_PRICE'
  | 'NEWEST'
  | 'RELEVANCE'
  | 'Z_TO_A';

/** Select checkout shipping option input data object */
export type SelectCheckoutShippingOptionDataInput = {
  /** The shipping option id */
  shippingOptionEntityId: Scalars['String']['input'];
};

/** Select checkout shipping option input object */
export type SelectCheckoutShippingOptionInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** The consignment id */
  consignmentEntityId: Scalars['String']['input'];
  /** Select checkout shipping option data object */
  data: SelectCheckoutShippingOptionDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Shipping consignment update checkout input object */
export type ShippingConsignmentUpdateCheckoutInput = {
  /** The shipping address */
  address?: InputMaybe<CheckoutAddressInput>;
  /** The shipping consignment id. If omitted, a new consignment will be created. Otherwise, the existing consignment will be updated. */
  entityId?: InputMaybe<Scalars['String']['input']>;
  /** List of line items for the consignment */
  lineItems?: InputMaybe<Array<CheckoutConsignmentLineItemInput>>;
  /** Whether to select the recommended shipping option */
  selectRecommendedOption?: InputMaybe<Scalars['Boolean']['input']>;
  /** The shipping option id */
  shippingOptionEntityId?: InputMaybe<Scalars['String']['input']>;
};

/** Input for starting a guest return session. */
export type StartReturnGuestSessionInput = {
  /** The billing address email associated with the order. */
  email: Scalars['String']['input'];
  /** The entity ID of the order to scope the guest session to. */
  orderEntityId: Scalars['Int']['input'];
};

/** Stock level display setting */
export type StockLevelDisplay =
  | 'DONT_SHOW'
  | 'SHOW'
  | 'SHOW_WHEN_LOW';

/** Object containing the filters for querying stored payment instruments. */
export type StoredPaymentInstrumentsFiltersInput = {
  /** Restrict to instruments whose payment method identifier matches any value in this list (e.g. ["braintree.credit_card", "braintree.paypal"]). An empty or omitted list returns all instruments. */
  paymentMethodIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Storefront Mode */
export type StorefrontStatusType =
  | 'HIBERNATION'
  | 'LAUNCHED'
  | 'MAINTENANCE'
  | 'PRE_LAUNCH';

/** Input for contact us form */
export type SubmitContactUsDataInput = {
  /** Comments */
  comments: Scalars['String']['input'];
  /** Company name */
  companyName?: InputMaybe<Scalars['String']['input']>;
  /** Customer email */
  email: Scalars['String']['input'];
  /** Customer full name */
  fullName?: InputMaybe<Scalars['String']['input']>;
  /** Order number */
  orderNumber?: InputMaybe<Scalars['String']['input']>;
  /** Customer phone number */
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  /** RMA number */
  rmaNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Input for contact us form */
export type SubmitContactUsInput = {
  /** The form data we are submitting */
  data: SubmitContactUsDataInput;
  /** The contact page we're sending on behalf of */
  pageEntityId: Scalars['Int']['input'];
};

/** Input for submitting an order message. */
export type SubmitOrderMessageInput = {
  /** The content of the message. */
  content: Scalars['String']['input'];
  /** The order ID of the order the message is being submitted for. */
  orderEntityId: Scalars['Int']['input'];
  /** The subject of the message. */
  subject: Scalars['String']['input'];
};

/** Tax setting can be set included or excluded (Tax setting can also be set to both on PDP/PLP). */
export type TaxPriceDisplay =
  | 'BOTH'
  | 'EX'
  | 'INC';

/** A text company user form field value to set. */
export type TextCompanyUserFormFieldInput = {
  /** The label/name of the form field. */
  name: Scalars['String']['input'];
  /** The value. */
  value: Scalars['String']['input'];
};

/** The user input for text extra fields. */
export type TextExtraFieldInput = {
  /** The label/name of the extra field. */
  name: Scalars['String']['input'];
  /** Text value. */
  text: Scalars['String']['input'];
};

/** The user input for text form fields. */
export type TextFormFieldInput = {
  /** The custom form field ID. */
  fieldEntityId: Scalars['Int']['input'];
  /** Text value. */
  text: Scalars['String']['input'];
};

/** Access scope required for a field or type (B2B, customer, or unauthenticated). */
export type TokenScope =
  | 'TOKEN_SCOPE_B2B'
  | 'TOKEN_SCOPE_CUSTOMER'
  | 'TOKEN_SCOPE_UNAUTHENTICATED';

/** Unapply checkout coupon data object */
export type UnapplyCheckoutCouponDataInput = {
  /** The checkout coupon code */
  couponCode: Scalars['String']['input'];
};

/** Unapply checkout coupon input object */
export type UnapplyCheckoutCouponInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Unapply checkout coupon data object */
  data: UnapplyCheckoutCouponDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Unapply checkout gift certificate data object */
export type UnapplyCheckoutGiftCertificateDataInput = {
  /** The checkout gift certificate code */
  giftCertificateCode: Scalars['String']['input'];
};

/** Unapply checkout gift certificate input object */
export type UnapplyCheckoutGiftCertificateInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Unapply checkout gift certificate data object */
  data: UnapplyCheckoutGiftCertificateDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Unassign cart from the customer input object. */
export type UnassignCartFromCustomerInput = {
  /** The cart id. */
  cartEntityId: Scalars['String']['input'];
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Update cart currency data object */
export type UpdateCartCurrencyDataInput = {
  /** ISO-4217 currency code */
  currencyCode: Scalars['String']['input'];
};

/** Update cart currency input object */
export type UpdateCartCurrencyInput = {
  /** The cart id */
  cartEntityId: Scalars['String']['input'];
  /** Update cart currency data object */
  data: UpdateCartCurrencyDataInput;
};

/** Update cart line item data object */
export type UpdateCartLineItemDataInput = {
  /** The gift certificate */
  giftCertificate?: InputMaybe<CartGiftCertificateInput>;
  /** The cart line item */
  lineItem?: InputMaybe<CartLineItemInput>;
};

/** Update cart line item input object */
export type UpdateCartLineItemInput = {
  /** The cart id */
  cartEntityId: Scalars['String']['input'];
  /** Update cart line item data object */
  data: UpdateCartLineItemDataInput;
  /** The line item id */
  lineItemEntityId: Scalars['String']['input'];
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Update cart's metafield data. */
export type UpdateCartMetafieldDataInput = {
  /** New key for cart metafield. */
  key?: InputMaybe<Scalars['String']['input']>;
  /** New value for cart metafield. */
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Input for update cart's metafield mutation. */
export type UpdateCartMetafieldInput = {
  /** Id of the cart for which to update metafield. */
  cartEntityId: Scalars['String']['input'];
  /** Data to update metafield. */
  data: UpdateCartMetafieldDataInput;
  /** Id of metafield to update. */
  metafieldEntityId: Scalars['Int']['input'];
};

/** Update checkout billing address data object */
export type UpdateCheckoutBillingAddressDataInput = {
  /** The checkout billing address */
  address: CheckoutAddressInput;
};

/** Update checkout billing address input object */
export type UpdateCheckoutBillingAddressInput = {
  /** The address id */
  addressEntityId: Scalars['String']['input'];
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Update checkout billing address data object */
  data: UpdateCheckoutBillingAddressDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Update checkout customer message data object */
export type UpdateCheckoutCustomerMessageDataInput = {
  /** The checkout customer message */
  message: Scalars['String']['input'];
};

/** Update checkout customer message input object */
export type UpdateCheckoutCustomerMessageInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Update checkout customer message data object */
  data: UpdateCheckoutCustomerMessageDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Update checkout data input object */
export type UpdateCheckoutDataInput = {
  /** The checkout billing address */
  billingAddress?: InputMaybe<CheckoutAddressInput>;
  /** List of coupon codes to apply to the checkout */
  coupons?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The checkout customer message */
  customerMessage?: InputMaybe<Scalars['String']['input']>;
  /** List of cart line items. Any existing line items not included in this list will be removed. */
  lineItems?: InputMaybe<Array<CartLineItemUpdateCheckoutInput>>;
  /** The list of shipping consignments. Any existing consignments not included in this list will be removed. */
  shippingConsignments?: InputMaybe<Array<ShippingConsignmentUpdateCheckoutInput>>;
};

/** Update checkout input object */
export type UpdateCheckoutInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** Update checkout data object */
  data: UpdateCheckoutDataInput;
  /** Version number */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** Update checkout shipping consignment data object */
export type UpdateCheckoutShippingConsignmentDataInput = {
  /** Checkout shipping consignment input object */
  consignment: CheckoutShippingConsignmentInput;
};

/** Update checkout shipping consignment input object */
export type UpdateCheckoutShippingConsignmentInput = {
  /** The checkout id */
  checkoutEntityId: Scalars['String']['input'];
  /** The consignment id */
  consignmentEntityId: Scalars['String']['input'];
  /** Update checkout shipping consignment data object */
  data: UpdateCheckoutShippingConsignmentDataInput;
  /** Version number. When provided, will reject the request if the version number is not the latest version of the cart, in order to prevent race conditions. */
  version?: InputMaybe<Scalars['Int']['input']>;
};

/** The values to update on the authenticated B2B company user's account settings. */
export type UpdateCompanyUserInput = {
  /** Current password. Required when changing email or password. */
  currentPassword?: InputMaybe<Scalars['String']['input']>;
  /** Email address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** B2B extra fields to set. */
  extraFields?: InputMaybe<CompanyExtraFieldsInput>;
  /** First name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Account form fields to set. */
  formFields?: InputMaybe<CompanyUserFormFieldsInput>;
  /** Last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** New password. */
  newPassword?: InputMaybe<Scalars['String']['input']>;
  /** Phone number. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Data fields to update on address. */
export type UpdateCustomerAddressDataInput = {
  /** First line for the street address. */
  address1?: InputMaybe<Scalars['String']['input']>;
  /** Second line for the street address. */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** City. */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Company name associated with the address. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** 2-letter country code. */
  countryCode?: InputMaybe<Scalars['String']['input']>;
  /** First name of address owner. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Additional form fields defined by merchant. */
  formFields?: InputMaybe<CustomerFormFieldsInput>;
  /** Last name of the address owner. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal code for the address. This is only required for certain countries. */
  postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Name of State or Province. */
  stateOrProvince?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a customer address. */
export type UpdateCustomerAddressInput = {
  /** ID of the address to update. */
  addressEntityId: Scalars['Int']['input'];
  /** Data fields to update on address. */
  data: UpdateCustomerAddressDataInput;
};

/** The values to use for customer update operation. */
export type UpdateCustomerInput = {
  /** The company of the customer. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** The email of the customer. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The first name of the customer. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** The custom form fields that the customer filled out. */
  formFields?: InputMaybe<CustomerFormFieldsInput>;
  /** The last name of the customer. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** The phone number of the customer. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** The behavior type for updating stock levels. */
export type UpdateStockBehavior =
  | 'ORDER_COMPLETED_OR_SHIPPED'
  | 'ORDER_PLACED';

/** Update wishlist input object */
export type UpdateWishlistInput = {
  /** Wishlist data to update */
  data: WishlistUpdateDataInput;
  /** The wishlist id */
  entityId: Scalars['Int']['input'];
};

/** User event input. */
export type UserEventInput = {
  /** The type of the event. */
  eventType: Scalars['String']['input'];
  /** Page Categories of a product. */
  pageCategories?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The product details. */
  productDetails?: InputMaybe<Array<ProductDetailsInput>>;
  /** The purchase Transaction details. */
  purchaseTransaction?: InputMaybe<PurchaseTransactionInput>;
};

/** Input object for fields related to a visit-started event. */
export type VisitStartedEventInput = {
  /** Common input fields for the visit-started event. */
  commonInput: AnalyticsCommonEventInput;
};

/** Object containing filters for querying web pages */
export type WebPageChildrenFiltersInput = {
  /** Ids of the expected pages. */
  entityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Whether the expected pages are visible in the navigation bar. */
  isVisibleInNavigation?: InputMaybe<Scalars['Boolean']['input']>;
  /** Type of the expected pages. */
  pageType?: InputMaybe<WebPageType>;
};

/** Web page type */
export type WebPageType =
  | 'BLOG'
  | 'CONTACT'
  | 'LINK'
  | 'NORMAL'
  | 'RAW';

/** Object containing filters for querying web pages */
export type WebPagesFiltersInput = {
  /** Ids of the expected pages. */
  entityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Whether the expected pages are visible in the navigation bar. */
  isVisibleInNavigation?: InputMaybe<Scalars['Boolean']['input']>;
  /** Type of the expected pages. */
  pageType?: InputMaybe<WebPageType>;
  /** Parent IDs of the expected pages. */
  parentEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Wishlist filters input object */
export type WishlistFiltersInput = {
  /** A wishlist ids filter. */
  entityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter for wishlists containing certain product ids. */
  productEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter for wishlists containing certain variant ids. */
  variantEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Wishlist item input object */
export type WishlistItemInput = {
  /** An id of the product from the wishlist. */
  productEntityId: Scalars['Int']['input'];
  /** An id of the specific product variant from the wishlist. */
  variantEntityId?: InputMaybe<Scalars['Int']['input']>;
};

/** Wishlist items filters input object. */
export type WishlistItemsFiltersInput = {
  /** Filter wishlist items by product ids. */
  productEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Filter wishlist items by variant ids. */
  variantEntityIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Wishlist data to update */
export type WishlistUpdateDataInput = {
  /** A new wishlist visibility mode */
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  /** A new wishlist name */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Country Code */
export type CountryCode =
  | 'AD'
  | 'AE'
  | 'AF'
  | 'AG'
  | 'AI'
  | 'AL'
  | 'AM'
  | 'AO'
  | 'AQ'
  | 'AR'
  | 'AS'
  | 'AT'
  | 'AU'
  | 'AW'
  | 'AX'
  | 'AZ'
  | 'BA'
  | 'BB'
  | 'BD'
  | 'BE'
  | 'BF'
  | 'BG'
  | 'BH'
  | 'BI'
  | 'BJ'
  | 'BL'
  | 'BM'
  | 'BN'
  | 'BO'
  | 'BQ'
  | 'BR'
  | 'BS'
  | 'BT'
  | 'BV'
  | 'BW'
  | 'BY'
  | 'BZ'
  | 'CA'
  | 'CC'
  | 'CD'
  | 'CF'
  | 'CG'
  | 'CH'
  | 'CI'
  | 'CK'
  | 'CL'
  | 'CM'
  | 'CN'
  | 'CO'
  | 'CR'
  | 'CU'
  | 'CV'
  | 'CW'
  | 'CX'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DJ'
  | 'DK'
  | 'DM'
  | 'DO'
  | 'DZ'
  | 'EC'
  | 'EE'
  | 'EG'
  | 'EH'
  | 'ER'
  | 'ES'
  | 'ET'
  | 'FI'
  | 'FJ'
  | 'FK'
  | 'FM'
  | 'FO'
  | 'FR'
  | 'GA'
  | 'GB'
  | 'GD'
  | 'GE'
  | 'GF'
  | 'GG'
  | 'GH'
  | 'GI'
  | 'GL'
  | 'GM'
  | 'GN'
  | 'GP'
  | 'GQ'
  | 'GR'
  | 'GS'
  | 'GT'
  | 'GU'
  | 'GW'
  | 'GY'
  | 'HK'
  | 'HM'
  | 'HN'
  | 'HR'
  | 'HT'
  | 'HU'
  | 'ID'
  | 'IE'
  | 'IL'
  | 'IM'
  | 'IN'
  | 'IO'
  | 'IQ'
  | 'IR'
  | 'IS'
  | 'IT'
  | 'JE'
  | 'JM'
  | 'JO'
  | 'JP'
  | 'KE'
  | 'KG'
  | 'KH'
  | 'KI'
  | 'KM'
  | 'KN'
  | 'KP'
  | 'KR'
  | 'KW'
  | 'KY'
  | 'KZ'
  | 'LA'
  | 'LB'
  | 'LC'
  | 'LI'
  | 'LK'
  | 'LR'
  | 'LS'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'LY'
  | 'MA'
  | 'MC'
  | 'MD'
  | 'ME'
  | 'MF'
  | 'MG'
  | 'MH'
  | 'MK'
  | 'ML'
  | 'MM'
  | 'MN'
  | 'MO'
  | 'MP'
  | 'MQ'
  | 'MR'
  | 'MS'
  | 'MT'
  | 'MU'
  | 'MV'
  | 'MW'
  | 'MX'
  | 'MY'
  | 'MZ'
  | 'NA'
  | 'NC'
  | 'NE'
  | 'NF'
  | 'NG'
  | 'NI'
  | 'NL'
  | 'NO'
  | 'NP'
  | 'NR'
  | 'NU'
  | 'NZ'
  | 'OM'
  | 'PA'
  | 'PE'
  | 'PF'
  | 'PG'
  | 'PH'
  | 'PK'
  | 'PL'
  | 'PM'
  | 'PN'
  | 'PR'
  | 'PS'
  | 'PT'
  | 'PW'
  | 'PY'
  | 'QA'
  | 'RE'
  | 'RO'
  | 'RS'
  | 'RU'
  | 'RW'
  | 'SA'
  | 'SB'
  | 'SC'
  | 'SD'
  | 'SE'
  | 'SG'
  | 'SH'
  | 'SI'
  | 'SJ'
  | 'SK'
  | 'SL'
  | 'SM'
  | 'SN'
  | 'SO'
  | 'SR'
  | 'SS'
  | 'ST'
  | 'SV'
  | 'SX'
  | 'SY'
  | 'SZ'
  | 'TC'
  | 'TD'
  | 'TF'
  | 'TG'
  | 'TH'
  | 'TJ'
  | 'TK'
  | 'TL'
  | 'TM'
  | 'TN'
  | 'TO'
  | 'TR'
  | 'TT'
  | 'TV'
  | 'TW'
  | 'TZ'
  | 'UA'
  | 'UG'
  | 'UM'
  | 'US'
  | 'UY'
  | 'UZ'
  | 'VA'
  | 'VC'
  | 'VE'
  | 'VG'
  | 'VI'
  | 'VN'
  | 'VU'
  | 'WF'
  | 'WS'
  | 'YE'
  | 'YT'
  | 'ZA'
  | 'ZM'
  | 'ZW';

/** Currency Code */
export type CurrencyCode =
  | 'ADP'
  | 'AED'
  | 'AFA'
  | 'AFN'
  | 'ALK'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'AOK'
  | 'AON'
  | 'AOR'
  | 'ARA'
  | 'ARL'
  | 'ARM'
  | 'ARP'
  | 'ARS'
  | 'ATS'
  | 'AUD'
  | 'AWG'
  | 'AZM'
  | 'AZN'
  | 'BAD'
  | 'BAM'
  | 'BAN'
  | 'BBD'
  | 'BDT'
  | 'BEC'
  | 'BEF'
  | 'BEL'
  | 'BGL'
  | 'BGM'
  | 'BGN'
  | 'BGO'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BOL'
  | 'BOP'
  | 'BOV'
  | 'BRB'
  | 'BRC'
  | 'BRE'
  | 'BRL'
  | 'BRN'
  | 'BRR'
  | 'BRZ'
  | 'BSD'
  | 'BTN'
  | 'BUK'
  | 'BWP'
  | 'BYB'
  | 'BYN'
  | 'BYR'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHE'
  | 'CHF'
  | 'CHW'
  | 'CLE'
  | 'CLF'
  | 'CLP'
  | 'CNX'
  | 'CNY'
  | 'COP'
  | 'COU'
  | 'CRC'
  | 'CSD'
  | 'CSK'
  | 'CUC'
  | 'CUP'
  | 'CVE'
  | 'CYP'
  | 'CZK'
  | 'DDM'
  | 'DEM'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'ECS'
  | 'ECV'
  | 'EEK'
  | 'EGP'
  | 'ERN'
  | 'ESA'
  | 'ESB'
  | 'ESP'
  | 'ETB'
  | 'EUR'
  | 'FIM'
  | 'FJD'
  | 'FKP'
  | 'FRF'
  | 'GBP'
  | 'GEK'
  | 'GEL'
  | 'GHC'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GNS'
  | 'GQE'
  | 'GRD'
  | 'GTQ'
  | 'GWE'
  | 'GWP'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRD'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'IEP'
  | 'ILP'
  | 'ILR'
  | 'ILS'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISJ'
  | 'ISK'
  | 'ITL'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRH'
  | 'KRO'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LTL'
  | 'LTT'
  | 'LUC'
  | 'LUF'
  | 'LUL'
  | 'LVL'
  | 'LVR'
  | 'LYD'
  | 'MAD'
  | 'MAF'
  | 'MCF'
  | 'MDC'
  | 'MDL'
  | 'MGA'
  | 'MGF'
  | 'MKD'
  | 'MKN'
  | 'MLF'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRO'
  | 'MTL'
  | 'MTP'
  | 'MUR'
  | 'MVP'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MXP'
  | 'MXV'
  | 'MYR'
  | 'MZE'
  | 'MZM'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIC'
  | 'NIO'
  | 'NLG'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEI'
  | 'PEN'
  | 'PES'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PLZ'
  | 'PTE'
  | 'PYG'
  | 'QAR'
  | 'RHD'
  | 'ROL'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RUR'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDD'
  | 'SDG'
  | 'SDP'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SIT'
  | 'SKK'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'SRG'
  | 'SSP'
  | 'STD'
  | 'SUR'
  | 'SVC'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJR'
  | 'TJS'
  | 'TMM'
  | 'TMT'
  | 'TND'
  | 'TOP'
  | 'TPE'
  | 'TRL'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UAK'
  | 'UGS'
  | 'UGX'
  | 'USD'
  | 'USN'
  | 'USS'
  | 'UYI'
  | 'UYP'
  | 'UYU'
  | 'UZS'
  | 'VEB'
  | 'VEF'
  | 'VND'
  | 'VNN'
  | 'VUV'
  | 'WST'
  | 'XAF'
  | 'XCD'
  | 'XEU'
  | 'XFO'
  | 'XFU'
  | 'XOF'
  | 'XPF'
  | 'XRE'
  | 'YDD'
  | 'YER'
  | 'YUD'
  | 'YUM'
  | 'YUN'
  | 'YUR'
  | 'ZAL'
  | 'ZAR'
  | 'ZMK'
  | 'ZMW'
  | 'ZRN'
  | 'ZRZ'
  | 'ZWD'
  | 'ZWL'
  | 'ZWR';

/** Blog post sort */
export type SortBy =
  | 'NEWEST'
  | 'OLDEST';

export type SearchCompanyAddressesQueryVariables = Exact<{
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchCompanyAddressesQuery = { company?: { addresses: { edges?: Array<{ node: { entityId: number, firstName: string, lastName: string, address1: string, address2?: string | null, city: string, stateOrProvince?: string | null, stateOrProvinceCode?: string | null, postalCode?: string | null, country: string, countryCode: string, phone?: string | null, label?: string | null, isDefaultShipping?: boolean | null, isDefaultBilling?: boolean | null, isShipping?: boolean | null, isBilling?: boolean | null } }> | null, pageInfo: { hasNextPage: boolean, endCursor?: string | null } } } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const SearchCompanyAddressesDocument = new TypedDocumentString(`
    query SearchCompanyAddresses($searchQuery: String, $first: Int = 10) {
  company {
    addresses(
      first: $first
      filters: {searchQuery: $searchQuery}
      sort: [{field: CREATED_AT, direction: DESC}]
    ) {
      edges {
        node {
          entityId
          firstName
          lastName
          address1
          address2
          city
          stateOrProvince
          stateOrProvinceCode
          postalCode
          country
          countryCode
          phone
          label
          isDefaultShipping
          isDefaultBilling
          isShipping
          isBilling
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SearchCompanyAddressesQuery, SearchCompanyAddressesQueryVariables>;