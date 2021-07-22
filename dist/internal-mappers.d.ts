
declare interface Address extends AddressRequestBody {
    country: string;
    shouldSaveAddress?: boolean;
}

declare interface AddressRequestBody {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    stateOrProvinceCode: string;
    countryCode: string;
    postalCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
}

declare interface Banner {
    type: string;
    text: string;
}

declare interface BillingAddress extends Address {
    id: string;
    email?: string;
}

export declare class CacheKeyResolver {
    private _lastId;
    private _map;
    private _usedMaps;
    private _options;
    constructor(options?: CacheKeyResolverOptions);
    getKey(...args: any[]): string;
    getUsedCount(...args: any[]): number;
    private _resolveMap;
    private _generateMap;
    private _removeLeastUsedMap;
    private _removeMap;
}

declare interface CacheKeyResolverOptions {
    maxSize?: number;
    onExpire?(key: string): void;
    isEqual?(valueA: any, valueB: any): boolean;
}

declare interface Cart {
    id: string;
    customerId: number;
    currency: Currency;
    email: string;
    isTaxIncluded: boolean;
    baseAmount: number;
    discountAmount: number;
    cartAmount: number;
    coupons: Coupon[];
    discounts: Discount[];
    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
}

declare interface Checkout {
    id: string;
    billingAddress?: BillingAddress;
    cart: Cart;
    customer: Customer;
    customerMessage: string;
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    isStoreCreditApplied: boolean;
    coupons: Coupon[];
    orderId?: number;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    /**
     * Whether the current checkout must execute spam protection
     * before placing the order.
     *
     * Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.
     */
    shouldExecuteSpamCheck: boolean;
    handlingCostTotal: number;
    taxTotal: number;
    subtotal: number;
    grandTotal: number;
    outstandingBalance: number;
    giftCertificates: GiftCertificate[];
    promotions?: Promotion[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    payments?: CheckoutPayment[];
}

declare interface CheckoutPayment {
    detail: {
        step: string;
    };
    providerId: string;
    providerType: string;
    gatewayId?: string;
}

declare interface Consignment {
    id: string;
    shippingAddress: Address;
    handlingCost: number;
    shippingCost: number;
    availableShippingOptions?: ShippingOption[];
    selectedShippingOption?: ShippingOption;
    lineItemIds: string[];
}

declare interface Coupon {
    id: string;
    displayName: string;
    code: string;
    couponType: string;
    discountedAmount: number;
}

declare interface Currency {
    name: string;
    code: string;
    symbol: string;
    decimalPlaces: number;
}

declare interface CustomItem {
    id: string;
    listPrice: number;
    extendedListPrice: number;
    name: string;
    quantity: number;
    sku: string;
}

declare interface Customer {
    id: number;
    addresses: CustomerAddress[];
    storeCredit: number;
    /**
     * The email address of the signed in customer.
     */
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
    /**
     * Indicates whether the customer should be prompted to sign-in.
     *
     * Note: You need to enable "Prompt existing accounts to sign in" in your Checkout Settings.
     */
    shouldEncourageSignIn: boolean;
    customerGroup?: CustomerGroup;
}

declare interface CustomerAddress extends Address {
    id: number;
    type: string;
}

declare interface CustomerGroup {
    id: number;
    name: string;
}

declare interface DigitalItem extends LineItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

declare interface Discount {
    id: string;
    discountedAmount: number;
}

declare interface DiscountNotification {
    message: string;
    messageHtml: string;
    discountType: string | null;
    placeholders: string[];
}

declare interface GatewayOrderPayment extends OrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
}

declare interface GiftCertificate {
    balance: number;
    remaining: number;
    used: number;
    code: string;
    purchaseDate: string;
}

declare interface GiftCertificateItem {
    id: string | number;
    name: string;
    theme: string;
    amount: number;
    taxable: boolean;
    sender: {
        name: string;
        email: string;
    };
    recipient: {
        name: string;
        email: string;
    };
    message: string;
}

declare interface GiftCertificateOrderPayment extends OrderPayment {
    detail: {
        code: string;
        remaining: number;
    };
}

declare interface InternalAddress<T = string> {
    id?: T;
    firstName: string;
    lastName: string;
    company: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    provinceCode: string;
    postCode: string;
    country: string;
    countryCode: string;
    phone: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string | number | string[];
    }>;
    type?: string;
}

declare interface InternalCart {
    id: string;
    items: InternalLineItem[];
    currency: string;
    subtotal: {
        amount: number;
        integerAmount: number;
    };
    coupon: {
        discountedAmount: number;
        coupons: InternalCoupon[];
    };
    discount: {
        amount: number;
        integerAmount: number;
    };
    discountNotifications: DiscountNotification[];
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: {
            [code: string]: InternalGiftCertificate;
        };
    };
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
        required: boolean;
    };
    storeCredit: {
        amount: number;
    };
    taxSubtotal: {
        amount: number;
        integerAmount: number;
    };
    taxes: Array<{
        name: string;
        amount: number;
    }>;
    taxTotal: {
        amount: number;
        integerAmount: number;
    };
    handling: {
        amount: number;
        integerAmount: number;
    };
    grandTotal: {
        amount: number;
        integerAmount: number;
    };
}

declare interface InternalCoupon {
    code: string;
    discount: string;
    discountType: number;
}

declare interface InternalCustomer {
    addresses: Array<InternalAddress<number>>;
    customerId: number;
    isGuest: boolean;
    storeCredit: number;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    remote?: {
        provider: string;
        billing?: string;
        billingMessage?: string;
        customer?: string;
        payment?: string;
        shipping?: string;
        customerMessage?: string;
        useStoreCredit?: boolean;
    };
    customerGroupId?: number;
    customerGroupName?: string;
    phoneNumber?: string;
}

declare interface InternalGiftCertificate {
    code: string;
    discountedAmount: number;
    remainingBalance: number;
    giftCertificate?: {
        balance: number;
        code: string;
        purchaseDate: string;
    };
}

declare interface InternalGiftCertificateList {
    totalDiscountedAmount: number;
    appliedGiftCertificates: {
        [code: string]: InternalGiftCertificate;
    };
}

declare interface InternalLineItem {
    amount: number;
    amountAfterDiscount: number;
    attributes: Array<{
        name: string;
        value: string;
    }>;
    discount: number;
    integerAmount: number;
    downloadsPageUrl?: string;
    integerAmountAfterDiscount: number;
    integerDiscount: number;
    integerUnitPrice: number;
    integerUnitPriceAfterDiscount: number;
    id: string | number;
    imageUrl: string;
    name?: string;
    quantity: number;
    brand?: string;
    sku?: string;
    categoryNames?: string[];
    type: string;
    variantId: number | null;
    productId?: number;
    addedByPromotion?: boolean;
    sender?: {
        name: string;
        email: string;
    };
    recipient?: {
        name: string;
        email: string;
    };
}

declare interface InternalOrder {
    id: number;
    orderId: number;
    items: InternalLineItem[];
    currency: string;
    customerCanBeCreated: boolean;
    subtotal: {
        amount: number;
        integerAmount: number;
    };
    coupon: {
        discountedAmount: number;
        coupons: InternalCoupon[];
    };
    discount: {
        amount: number;
        integerAmount: number;
    };
    discountNotifications: DiscountNotification[];
    giftCertificate: InternalGiftCertificateList;
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
    };
    status: string;
    storeCredit: {
        amount: number;
    };
    taxes: Array<{
        name: string;
        amount: number;
    }>;
    taxTotal: {
        amount: number;
        integerAmount: number;
    };
    handling: {
        amount: number;
        integerAmount: number;
    };
    grandTotal: {
        amount: number;
        integerAmount: number;
    };
    token?: string;
    payment: InternalOrderPayment;
    socialData?: {
        [itemId: string]: InternalSocialDataList;
    };
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    callbackUrl?: string;
}

declare interface InternalOrderMeta {
    deviceFingerprint?: string;
}

declare interface InternalOrderPayment {
    id?: string;
    gateway?: string;
    redirectUrl?: string;
    returnUrl?: string;
    status?: string;
    helpText?: string;
}

declare interface InternalQuote {
    orderComment: string;
    shippingOption?: string;
    billingAddress: InternalAddress;
    shippingAddress?: InternalAddress;
}

declare interface InternalShippingOption {
    description: string;
    module: string;
    price: number;
    id: string;
    selected: boolean;
    isRecommended: boolean;
    imageUrl: string;
    transitTime: string;
}

declare interface InternalShippingOptionList {
    [key: string]: InternalShippingOption[];
}

declare interface InternalSocialDataItem {
    name: string;
    description: string;
    image: string;
    url: string;
    shareText: string;
    sharingLink: string;
    channelName: string;
    channelCode: string;
}

declare interface InternalSocialDataList {
    [key: string]: InternalSocialDataItem;
}

declare interface LineItem {
    id: string | number;
    variantId: number;
    productId: number;
    sku: string;
    name: string;
    url: string;
    quantity: number;
    brand: string;
    categoryNames?: string[];
    categories?: LineItemCategory[][];
    isTaxable: boolean;
    imageUrl: string;
    discounts: Array<{
        name: string;
        discountedAmount: number;
    }>;
    discountAmount: number;
    couponAmount: number;
    listPrice: number;
    salePrice: number;
    comparisonPrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
    extendedComparisonPrice: number;
    socialMedia?: LineItemSocialData[];
    options?: LineItemOption[];
    addedByPromotion: boolean;
    parentId?: string | null;
}

declare interface LineItemCategory {
    name: string;
}

declare interface LineItemMap {
    physicalItems: PhysicalItem[];
    digitalItems: DigitalItem[];
    customItems?: CustomItem[];
    giftCertificates: GiftCertificateItem[];
}

declare interface LineItemOption {
    name: string;
    nameId: number;
    value: string;
    valueId: number | null;
}

declare interface LineItemSocialData {
    channel: string;
    code: string;
    text: string;
    link: string;
}

declare interface Order {
    baseAmount: number;
    billingAddress: BillingAddress;
    cartId: string;
    coupons: Coupon[];
    currency: Currency;
    customerCanBeCreated: boolean;
    customerId: number;
    customerMessage: string;
    discountAmount: number;
    handlingCostTotal: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: LineItemMap;
    orderAmount: number;
    orderAmountAsInteger: number;
    orderId: number;
    payments?: OrderPayments;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
    mandateUrl?: string;
}

declare interface OrderMetaState extends InternalOrderMeta {
    token?: string;
    orderToken?: string;
    callbackUrl?: string;
    payment?: InternalOrderPayment;
}

declare interface OrderPayment {
    providerId: string;
    gatewayId?: string;
    paymentId?: string;
    description: string;
    amount: number;
}

declare type OrderPayments = Array<GatewayOrderPayment | GiftCertificateOrderPayment>;

declare interface PhysicalItem extends LineItem {
    isShippingRequired: boolean;
    giftWrapping?: {
        name: string;
        message: string;
        amount: number;
    };
}

declare interface Promotion {
    banners: Banner[];
}

declare interface ShippingOption {
    additionalDescription: string;
    description: string;
    id: string;
    isRecommended: boolean;
    imageUrl: string;
    cost: number;
    transitTime: string;
    type: string;
}

declare interface Tax {
    name: string;
    amount: number;
}

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalAddress(address: Address | BillingAddress, consignments?: Consignment[]): InternalAddress<any>;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalCart(checkout: Checkout): InternalCart;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalCoupon(coupon: Coupon): InternalCoupon;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalCustomer(customer: Customer, billingAddress: BillingAddress): InternalCustomer;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalGiftCertificate(giftCertificate: GiftCertificate): InternalGiftCertificate;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalLineItem(item: LineItem, type: string, decimalPlaces: number, idKey?: keyof LineItem): InternalLineItem;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalLineItems(itemMap: LineItemMap, decimalPlaces: number, idKey?: keyof LineItem): InternalLineItem[];

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalOrder(order: Order, orderMeta?: OrderMetaState): InternalOrder;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalQuote(checkout: Checkout, shippingAddress?: Address): InternalQuote;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalShippingOption(option: ShippingOption, isSelected: boolean): InternalShippingOption;

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export declare function mapToInternalShippingOptions(consignments: Consignment[]): InternalShippingOptionList;
