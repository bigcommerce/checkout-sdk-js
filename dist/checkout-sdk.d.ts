import { createTimeout } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';
import { Timeout } from '@bigcommerce/request-sender';

declare interface AmazonPayCustomerInitializeOptions {
    container: string;
    color?: string;
    size?: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
}

declare interface AmazonPayOrderReference {
    getAmazonBillingAgreementId(): string;
    getAmazonOrderReferenceId(): string;
}

declare interface AmazonPayPaymentInitializeOptions {
    container: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onPaymentSelect?(reference: AmazonPayOrderReference): void;
    onReady?(reference: AmazonPayOrderReference): void;
}

declare interface AmazonPayShippingInitializeOptions {
    container: string;
    onAddressSelect?(reference: AmazonPayOrderReference): void;
    onError?(error: AmazonPayWidgetError | StandardError): void;
    onReady?(): void;
}

declare interface AmazonPayWidgetError extends Error {
    getErrorCode(): string;
}

declare interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
}

declare interface BraintreeThreeDSecureOptions {
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<VerifyPayload> | undefined): void;
    removeFrame(): void;
}

export declare class CheckoutClient {
    private _billingAddressRequestSender;
    private _cartRequestSender;
    private _configRequestSender;
    private _countryRequestSender;
    private _couponRequestSender;
    private _customerRequestSender;
    private _giftCertificateRequestSender;
    private _orderRequestSender;
    private _paymentMethodRequestSender;
    private _quoteRequestSender;
    private _shippingAddressRequestSender;
    private _shippingCountryRequestSender;
    private _shippingOptionRequestSender;
    loadCheckout(options?: RequestOptions): Promise<Response>;
    loadCart(options?: RequestOptions): Promise<Response>;
    loadOrder(orderId: number, options?: RequestOptions): Promise<Response>;
    submitOrder(body: OrderRequestBody, options?: RequestOptions): Promise<Response>;
    finalizeOrder(orderId: number, options?: RequestOptions): Promise<Response>;
    loadPaymentMethods(options?: RequestOptions): Promise<Response>;
    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<Response>;
    loadCountries(options?: RequestOptions): Promise<Response>;
    loadShippingCountries(options?: RequestOptions): Promise<Response>;
    updateBillingAddress(address: InternalAddress, options?: RequestOptions): Promise<Response>;
    updateShippingAddress(address: InternalAddress, options?: RequestOptions): Promise<Response>;
    loadShippingOptions(options?: RequestOptions): Promise<Response>;
    selectShippingOption(addressId: string, shippingOptionId: string, options?: RequestOptions): Promise<Response>;
    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Promise<Response>;
    signOutCustomer(options?: RequestOptions): Promise<Response>;
    applyCoupon(code: string, options?: RequestOptions): Promise<Response>;
    removeCoupon(code: string, options?: RequestOptions): Promise<Response>;
    applyGiftCertificate(code: string, options?: RequestOptions): Promise<Response>;
    removeGiftCertificate(code: string, options?: RequestOptions): Promise<Response>;
    loadConfig(options?: RequestOptions): Promise<Response>;
}

declare class CheckoutErrorSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _coupon;
    private _customerStrategy;
    private _giftCertificate;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _paymentStrategy;
    private _quote;
    private _shippingCountries;
    private _shippingOptions;
    private _shippingStrategy;
    getError(): Error | undefined;
    getLoadCheckoutError(): Error | undefined;
    getSubmitOrderError(): Error | undefined;
    getFinalizeOrderError(): Error | undefined;
    getLoadOrderError(): Error | undefined;
    getLoadCartError(): Error | undefined;
    getVerifyCartError(): Error | undefined;
    getLoadBillingCountriesError(): Error | undefined;
    getLoadShippingCountriesError(): Error | undefined;
    getLoadPaymentMethodsError(): Error | undefined;
    getLoadPaymentMethodError(methodId?: string): Error | undefined;
    getInitializePaymentMethodError(methodId?: string): Error | undefined;
    getSignInError(): Error | undefined;
    getSignOutError(): Error | undefined;
    getInitializeCustomerError(methodId?: string): Error | undefined;
    getLoadShippingOptionsError(): Error | undefined;
    getSelectShippingOptionError(): Error | undefined;
    getUpdateBillingAddressError(): Error | undefined;
    getUpdateShippingAddressError(): Error | undefined;
    getInitializeShippingError(methodId?: string): Error | undefined;
    getApplyCouponError(): Error | undefined;
    getRemoveCouponError(): Error | undefined;
    getApplyGiftCertificateError(): Error | undefined;
    getRemoveGiftCertificateError(): Error | undefined;
    getLoadInstrumentsError(): Error | undefined;
    getVaultInstrumentError(): Error | undefined;
    getDeleteInstrumentError(instrumentId?: string): Error | undefined;
    getLoadConfigError(): Error | undefined;
}

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: CheckoutMeta, Config, Country, Instrument, Field
 */
declare class CheckoutSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _customer;
    private _form;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _quote;
    private _remoteCheckout;
    private _shippingAddress;
    private _shippingCountries;
    private _shippingOptions;
    /**
     * @return {CheckoutMeta}
     */
    getCheckoutMeta(): any;
    getOrder(): InternalOrder | undefined;
    getQuote(): InternalQuote | undefined;
    getConfig(): LegacyConfig | undefined;
    getShippingAddress(): InternalAddress | undefined;
    getShippingOptions(): InternalShippingOptionList | undefined;
    getSelectedShippingOption(): InternalShippingOption | undefined;
    /**
     * @return {Country[]}
     */
    getShippingCountries(): any[];
    getBillingAddress(): InternalAddress | undefined;
    /**
     * @return {Country[]}
     */
    getBillingCountries(): any[];
    getPaymentMethods(): PaymentMethod[] | undefined;
    getPaymentMethod(methodId: string, gatewayId?: string): PaymentMethod | undefined;
    getSelectedPaymentMethod(): PaymentMethod | undefined;
    getCart(): InternalCart | undefined;
    getCustomer(): InternalCustomer | undefined;
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean;
    /**
     * @return {Instrument[]}
     */
    getInstruments(): any[];
    /**
     * @return {Field[]}
     */
    getBillingAddressFields(countryCode: string): any[];
    /**
     * @return {Field[]}
     */
    getShippingAddressFields(countryCode: string): any[];
}

export declare interface CheckoutSelectors {
    checkout: CheckoutSelector;
    errors: CheckoutErrorSelector;
    statuses: CheckoutStatusSelector;
}

/**
 * TODO: Convert this file into TypeScript properly
 * i.e.: Instrument, InitializePaymentOptions etc...
 */
export declare class CheckoutService {
    private _store;
    private _billingAddressActionCreator;
    private _cartActionCreator;
    private _configActionCreator;
    private _countryActionCreator;
    private _couponActionCreator;
    private _customerStrategyActionCreator;
    private _giftCertificateActionCreator;
    private _instrumentActionCreator;
    private _orderActionCreator;
    private _paymentMethodActionCreator;
    private _paymentStrategyActionCreator;
    private _quoteActionCreator;
    private _shippingCountryActionCreator;
    private _shippingOptionActionCreator;
    private _shippingStrategyActionCreator;
    getState(): CheckoutSelectors;
    notifyState(): void;
    subscribe(subscriber: (state: CheckoutSelectors) => void, ...filters: Array<(state: CheckoutSelectors) => any>): () => void;
    loadCheckout(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadConfig(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadCart(options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * @deprecated
     */
    verifyCart(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors>;
    submitOrder(payload: OrderRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    /**
     * @deprecated
     */
    finalizeOrder(orderId: number, options?: RequestOptions): Promise<CheckoutSelectors>;
    finalizeOrderIfNeeded(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadPaymentMethods(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadPaymentMethod(methodId: string, options: RequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    loadBillingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadShippingCountries(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadBillingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
    loadShippingAddressFields(options?: RequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options?: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    deinitializeCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    signInCustomer(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    signOutCustomer(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
    loadShippingOptions(options?: RequestOptions): Promise<CheckoutSelectors>;
    initializeShipping(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    deinitializeShipping(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    selectShippingOption(addressId: string, shippingOptionId: string, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    updateShippingAddress(address: InternalAddress, options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    updateBillingAddress(address: InternalAddress, options?: RequestOptions): Promise<CheckoutSelectors>;
    applyCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    removeCoupon(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    applyGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    removeGiftCertificate(code: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    loadInstruments(): Promise<CheckoutSelectors>;
    vaultInstrument(instrument: any): Promise<CheckoutSelectors>;
    deleteInstrument(instrumentId: string): Promise<CheckoutSelectors>;
    private _getInstrumentState();
}

declare interface CheckoutServiceOptions {
    client?: CheckoutClient;
    locale?: string;
    shouldWarnMutation?: boolean;
}

declare class CheckoutStatusSelector {
    private _billingAddress;
    private _cart;
    private _config;
    private _countries;
    private _coupon;
    private _customerStrategy;
    private _giftCertificate;
    private _instruments;
    private _order;
    private _paymentMethods;
    private _paymentStrategy;
    private _quote;
    private _shippingCountries;
    private _shippingOptions;
    private _shippingStrategy;
    isPending(): boolean;
    isLoadingCheckout(): boolean;
    isSubmittingOrder(): boolean;
    isFinalizingOrder(): boolean;
    isLoadingOrder(): boolean;
    isLoadingCart(): boolean;
    isVerifyingCart(): boolean;
    isLoadingBillingCountries(): boolean;
    isLoadingShippingCountries(): boolean;
    isLoadingPaymentMethods(): boolean;
    isLoadingPaymentMethod(methodId?: string): boolean;
    isInitializingPaymentMethod(methodId?: string): boolean;
    isSigningIn(methodId?: string): boolean;
    isSigningOut(methodId?: string): boolean;
    isInitializingCustomer(methodId?: string): boolean;
    isLoadingShippingOptions(): boolean;
    isSelectingShippingOption(): boolean;
    isUpdatingBillingAddress(): boolean;
    isUpdatingShippingAddress(): boolean;
    isInitializingShipping(methodId?: string): boolean;
    isApplyingCoupon(): boolean;
    isRemovingCoupon(): boolean;
    isApplyingGiftCertificate(): boolean;
    isRemovingGiftCertificate(): boolean;
    isLoadingInstruments(): boolean;
    isVaultingInstrument(): boolean;
    isDeletingInstrument(instrumentId?: string): boolean;
    isLoadingConfig(): boolean;
}

export declare function createCheckoutClient(config?: {
    locale?: string;
}): CheckoutClient;

export declare function createCheckoutService(options?: CheckoutServiceOptions): CheckoutService;

export declare function createLanguageService(config?: Partial<LanguageConfig>): LanguageService;

declare interface CreditCard {
    ccExpiry: {
        month: string;
        year: string;
    };
    ccName: string;
    ccNumber: string;
    ccType: string;
    ccCvv?: string;
    deviceSessionId?: string;
    shouldSaveInstrument?: boolean;
    extraData?: any;
}

declare interface CustomerCredentials {
    email: string;
    password?: string;
}

declare interface CustomerInitializeOptions extends CustomerRequestOptions {
    amazon?: AmazonPayCustomerInitializeOptions;
}

declare interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

declare interface DiscountNotification {
    message: string;
    messageHtml: string;
    type: string;
}

declare interface FormField {
    id: string;
    name: string;
    custom: boolean;
    label: string;
    required: boolean;
    default?: string;
    type?: string;
    fieldType?: string;
    itemtype?: string;
    options?: Options;
}

declare interface FormFields {
    shippingAddressFields: FormField[];
    billingAddressFields: FormField[];
}

declare interface InternalAddress {
    id: string;
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
    type: string;
    customFields: Array<{
        fieldId: string;
        fieldValue: string;
    }>;
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
        appliedGiftCertificates: InternalGiftCertificate[];
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
    name: string;
}

declare interface InternalCustomer {
    addresses: InternalAddress[];
    customerId: number;
    customerGroupId: number;
    customerGroupName: number;
    isGuest: boolean;
    remote: {
        customerMessage: string;
        provider: string;
        useStoreCredit: boolean;
    };
    phoneNumber: string;
    storeCredit: number;
    email: string;
    firstName: string;
    name: string;
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

declare interface InternalIncompleteOrder {
    orderId: number;
    token: string;
    payment: {
        id?: string;
        redirectUrl?: string;
        returnUrl?: string;
        status?: string;
        helpText?: string;
    };
    socialData: {
        [key: string]: {
            name: string;
            description: string;
            image: string;
            url: string;
            shareText: string;
            sharingLink: string;
        };
    };
    status: string;
    customerCreated: boolean;
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    callbackUrl: string;
}

declare interface InternalLineItem {
    amount: number;
    amountAfterDiscount: number;
    attributes: Array<{
        name: string;
        value: string;
    }>;
    discount: number;
    id: string;
    imageUrl: string;
    integerAmount: number;
    integerAmountAfterDiscount: number;
    integerDiscount: number;
    integerTax: number;
    name: string;
    quantity: number;
    tax: number;
    type: string;
    variantId: number;
}

declare interface InternalOrder extends InternalIncompleteOrder {
    id: number;
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
    discountNotifications: Array<{
        message: string;
        messageHtml: string;
        type: string;
    }>;
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: InternalGiftCertificate[];
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

declare interface InternalQuote {
    orderComment: string;
    shippingOption: string;
    billingAddress: InternalAddress;
    shippingAddress: InternalAddress;
}

declare interface InternalShippingOption {
    description: string;
    module: string;
    method: number;
    price: number;
    formattedPrice: string;
    id: string;
    selected: boolean;
    isRecommended: boolean;
    imageUrl: string;
    transitTime: string;
}

declare interface InternalShippingOptionList {
    [key: string]: InternalShippingOption[];
}

declare interface Item {
    value: string;
    label: string;
}

declare interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaPaymentInitializeOptions {
    container: string;
    onLoad?(response: KlarnaLoadResponse): void;
}

declare interface LanguageConfig {
    defaultTranslations: Translations;
    locale: string;
    locales: Locales;
    translations: Translations;
}

export declare class LanguageService {
    private _logger;
    private _locale;
    private _locales;
    private _translations;
    private _formatters;
    mapKeys(maps?: {
        [key: string]: string;
    }): void;
    getLocale(): string;
    translate(rawKey: string, data?: PlaceholderData): string;
    private _transformConfig(config?);
    private _flattenObject(object, result?, parentKey?);
    private _transformData(data);
    private _hasTranslations();
}

declare interface LegacyCheckout {
    enableOrderComments: number;
    enableTermsAndConditions: number;
    guestCheckoutEnabled: number;
    isCardVaultingEnabled: boolean;
    isPaymentRequestEnabled: boolean;
    isPaymentRequestCanMakePaymentEnabled: boolean;
    orderTermsAndConditions: string;
    orderTermsAndConditionsLink: string;
    orderTermsAndConditionsType: string;
    shippingQuoteFailedMessage: string;
    realtimeShippingProviders: string[];
    remoteCheckoutProviders: string[];
}

declare interface LegacyConfig {
    bigpayBaseUrl: string;
    cartLink: string;
    checkoutLink: string;
    cdnPath: string;
    checkout: LegacyCheckout;
    clientSidePaymentProviders: string[];
    currency: LegacyCurrency;
    shopperCurrency: LegacyShopperCurrency;
    storeConfig: LegacyStoreConfig;
    defaultNewsletterSignup: boolean;
    imageDirectory: string;
    isAngularDebuggingEnabled: boolean;
    passwordRequirements: PasswordRequirements;
    orderConfirmationLink: string;
    orderEmail: string;
    shopPath: string;
    showNewsletterSignup: boolean;
    storeCountry: string;
    storeHash: string;
    storeId: string;
    storeName: string;
    storePhoneNumber: string;
    storeLanguage: string;
}

declare interface LegacyCurrency {
    code: string;
    decimal_places: string;
    decimal_separator: string;
    symbol_location: string;
    symbol: string;
    thousands_separator: string;
}

declare interface LegacyShopperCurrency {
    code: string;
    symbol_location: string;
    symbol: string;
    decimal_places: string;
    decimal_separator: string;
    thousands_separator: string;
    exchange_rate: string;
}

declare interface LegacyStoreConfig {
    formFields: FormFields;
}

declare interface Locales {
    [key: string]: string;
}

declare interface Options {
    helperLabel: string;
    items: Item[];
}

declare interface OrderRequestBody {
    payment?: Payment;
    useStoreCredit?: boolean;
    customerMessage?: string;
}

declare interface PasswordRequirements {
    alpha: string;
    numeric: string;
    minlength: number;
    error: string;
}

declare interface Payment {
    name: string;
    paymentData: PaymentInstrument;
    gateway?: string;
    source?: string;
}

declare interface PaymentInitializeOptions extends PaymentRequestOptions {
    amazon?: AmazonPayPaymentInitializeOptions;
    braintree?: BraintreePaymentInitializeOptions;
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}

declare type PaymentInstrument = CreditCard | TokenizedCreditCard | VaultedInstrument;

declare interface PaymentMethod {
    id: string;
    config: PaymentMethodConfig;
    method: string;
    supportedCards: string[];
    type: string;
    clientToken?: string;
    gateway?: string;
    logoUrl?: string;
    nonce?: string;
    initializationData?: any;
    returnUrl?: string;
}

declare interface PaymentMethodConfig {
    cardCode?: boolean;
    displayName?: string;
    is3dsEnabled?: boolean;
    merchantId?: string;
    redirectUrl?: string;
    testMode?: boolean;
}

declare interface PaymentRequestOptions extends RequestOptions {
    methodId: string;
    gatewayId?: string;
}

declare interface PlaceholderData {
    [key: string]: any;
}

declare interface RequestOptions {
    timeout?: Timeout;
}

declare interface ShippingInitializeOptions extends ShippingRequestOptions {
    amazon?: AmazonPayShippingInitializeOptions;
}

declare interface ShippingRequestOptions extends RequestOptions {
    methodId?: string;
}

declare interface SquareFormElement {
    elementId: string;
    placeholder?: string;
}

declare interface SquarePaymentInitializeOptions {
    cardNumber: SquareFormElement;
    cvv: SquareFormElement;
    expirationDate: SquareFormElement;
    postalCode: SquareFormElement;
    inputClass?: string;
    inputStyles?: Array<{
        [key: string]: string;
    }>;
}

declare class StandardError extends Error {
    protected type: string;
    constructor(message?: string);
}

declare interface TokenizedCreditCard {
    nonce: string;
    deviceSessionId?: string;
}

declare interface Translations {
    [key: string]: string | Translations;
}

declare interface VaultedInstrument {
    instrumentId: string;
    cvv?: number;
}

declare interface VerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}
