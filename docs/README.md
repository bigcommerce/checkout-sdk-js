## API

### Checkout

```ts
interface createCheckoutService {
    (config: CheckoutServiceConfig): CheckoutService;
}

interface createCheckoutClient {
    (config: CheckoutClientConfig): CheckoutClient;
}

interface CheckoutService {
    // Checkout
    loadCheckout(options: RequestOptions): Promise<CheckoutState>;

    // Order
    submitOrder(payload: OrderRequestBody, options: RequestOptions): Promise<CheckoutState>;
    finalizeOrderIfNeeded(orderId: number, options: RequestOptions): Promise<CheckoutState>;
    loadOrder(orderId: number, options: RequestOptions): Promise<CheckoutState>;

    // Shipping
    updateShippingAddress(address: Address, options: RequestOptions): Promise<CheckoutState>;
    selectShippingOption(addressId: string, optionId: string, options: RequestOptions): Promise<CheckoutState>;
    loadShippingOptions(options: RequestOptions): Promise<CheckoutState>;
    loadShippingCountries(options: RequestOptions): Promise<CheckoutState>;
    loadShippingAddressFields(): Promise<CheckoutState>; // TODO: Not implemented

    // Billing
    updateBillingAddress(address: Address, options: RequestOptions): Promise<CheckoutState>;
    loadBillingCountries(options: RequestOptions): Promise<CheckoutState>;
    loadBillingAddressFields(): Promise<CheckoutState>; // TODO: Not implemented

    // Coupon
    applyCoupon(code: string, options: RequestOptions): Promise<CheckoutState>;
    removeCoupon(code: string, options: RequestOptions): Promise<CheckoutState>;
    applyGiftCertificate(code: string, options: RequestOptions): Promise<CheckoutState>;
    removeGiftCertificate(code: string, options: RequestOptions): Promise<CheckoutState>;

    // Cart
    loadCart(options: RequestOptions): Promise<CheckoutState>;
    updateCartItem(itemId: string, quantity: number, options: RequestOptions): Promise<CheckoutState>; // TODO: Not implemented
    removeCartItem(itemId: string, options: RequestOptions): Promise<CheckoutState>; // TODO: Not implemented

    // Payment
    loadPaymentMethods(options: RequestOptions): Promise<CheckoutState>;
    loadPaymentMethod(methodId: string, options: RequestOptions): Promise<CheckoutState>;
    initializePaymentMethod(methodId: string, gatewayId: string, options?: Object): Promise<CheckoutState>;
    deinitializePaymentMethod(methodId: string, gatewayId: string): Promise<CheckoutState>;

    // Shopper
    signInCustomer(credentials: CustomerCredentials, options: RequestOptions): Promise<CheckoutState>;
    signOutCustomer(options: RequestOptions): Promise<CheckoutState>;
    confirmAccount(password: string, passwordConfirmation: string): Promise<CheckoutState>; // TODO: Not implemented

    // State
    getState(): CheckoutState;
    subscribe(subscriber: Subscriber, ...filters: SubscriptionFilter): Unsubscriber;
}

interface CheckoutClient {
    // Checkout
    loadCheckout(options: RequestOptions): Promise<QuoteResponse>;

    // Order
    submitOrder(payment: Payment, options: RequestOptions): Promise<OrderResponse>;
    finalizeOrder(orderId: number, options: RequestOptions): Promise<OrderResponse>;
    loadOrder(orderId: number, options: RequestOptions): Promise<OrderResponse>;

    // Shipping
    updateShippingAddress(address: Address, options: RequestOptions): Promise<ShippingResponse>;
    selectShippingOption(addressId: string, optionId: string, options: RequestOptions): Promise<ShippingOptionResponse>;
    loadShippingOptions(options: RequestOptions): Promise<ShippingResponse>;
    loadShippingCountries(options: RequestOptions): Promise<CountriesResponse>;

    // Billing
    updateBillingAddress(address: Address, options: RequestOptions): Promise<BillingResponse>;
    loadBillingCountries(options: RequestOptions): Promise<CountriesResponse>;

    // Coupon
    applyCoupon(code: string, options: RequestOptions): Promise<CartResponse>;
    removeCoupon(code: string, options: RequestOptions): Promise<CartResponse>;
    applyGiftCertificate(code: string, options: RequestOptions): Promise<CartResponse>;
    removeGiftCertificate(code: string, options: RequestOptions): Promise<CartResponse>;

    // Cart
    updateCartItem(itemId: string, quantity: number, options: RequestOptions): Promise<CartResponse>; // TODO: Not implemented
    removeCartItem(itemId: string, options: RequestOptions): Promise<CartResponse>; // TODO: Not implemented

    // Payment
    loadPaymentMethods(options: RequestOptions): Promise<PaymentMethodsResponse>;
    loadPaymentMethod(methodId: string, options: RequestOptions): Promise<PaymentMethodResponse>;

    // Shopper
    signInCustomer(credentials: CustomerCredentials, options: RequestOptions): Promise<CustomerResponse>;
    signOutCustomer(): Promise<CustomerResponse>;
    confirmAccount(password: string, passwordConfirmation: string): Promise<CustomerResponse>; // TODO: Not implemented
}

interface CheckoutState {
    checkout: CheckoutSelector;
    errors: CheckoutErrorSelector;
    form: CheckoutFormSelector; // TODO: Not implemented
    statuses: CheckoutStatusSelector;
}

interface CheckoutSelector {
    // Checkout
    getCheckout(): Checkout;
    getCheckoutMeta(): CheckoutMeta;

    // Order
    getOrder(): Order;

    // Shipping
    getShippingAddress(): Address;
    getShippingAddresses(): Address[];
    getShippingOptions(): ShippingOption[];
    getSelectedShippingOption(): ShippingOption;
    getShippingCountries(): Country[];
    getConsignments(): Consignment[]; // TODO: Not implemented

    // Billing
    getBillingAddress(): Address;
    getBillingCountries(): Country[];

    // Cart
    getCart(): Cart;

    // Payment
    getPaymentMethods(): PaymentMethod[];
    getPaymentMethod(methodId: string): PaymentMethod;
    getSelectedPaymentMethod(): PaymentMethod;

    // Tax
    getTaxes(): Tax[]; // TODO: Not implemented

    // Promotion
    getCoupons(): Coupon[]; // TODO: Not implemented
    getGiftCertificates(): GiftCertificate[]; // TODO: Not implemented
    getDiscounts(): Discount[]; // TODO: Not implemented

    // Shopper
    getCustomer(): Customer;
}

interface CheckoutStatusSelector {
    isPending(): boolean;

    // Checkout
    isLoadingCheckout(): boolean;

    // Order
    isSubmittingOrder(): boolean;
    isFinalizingOrder(orderId: number): boolean;
    isLoadingOrder(orderId: number): boolean;

    // Shipping
    isLoadingShippingOptions(): boolean;
    isUpdatingShippingAddress(addressId: number): boolean;
    isSelectingShippingOption(): boolean;

    // Billing
    isUpdatingBillingAddress(): boolean;

    // Coupon
    isApplyingCoupon(code: string): boolean;
    isRemovingCoupon(code: string): boolean;
    isApplyingGiftCertificate(code: string): boolean;
    isRemovingGiftCertificate(code: string): boolean;

    // Cart
    isLoadingCart(): boolean;
    isVerifyingCart(): boolean;
    isUpdatingCartItem(itemId: string): boolean; // TODO: Not implemented
    isRemovingCartItem(itemId: string): boolean; // TODO: Not implemented

    // Payment
    isPaymentDataSubmitted(methodId: string, gatewayId?: string): boolean;
    isLoadingPaymentMethods(): boolean;
    isLoadingPaymentMethod(methodId: string): boolean;
    isInitializingPaymentMethod(methodId: string): boolean; // TODO: Not implemented
    isDeinitializingPaymentMethod(methodId: string): boolean; // TODO: Not implemented

    // Shopper
    isSigningIn(): boolean;
    isSigningOut(): boolean;
    isConfirmingAccount(): boolean; // TODO: Not implemented
}

interface CheckoutErrorSelector {
    getError(): ErrorResponse;

    // Checkout
    getLoadCheckoutError(): ErrorResponse;

    // Order
    getSubmitOrderError(): ErrorResponse;
    getFinalizeOrderError(id: number): ErrorResponse;
    getLoadOrderError(id: number): ErrorResponse;

    // Shipping
    getLoadShippingOptionsError(): ErrorResponse;
    getUpdateShippingAddressError(id: number): ErrorResponse;
    getSelectShippingOptionError(): ErrorResponse;

    // Billing
    getUpdateBillingAddressError(): ErrorResponse;

    // Coupon
    getApplyCouponError(code: string): ErrorResponse;
    getRemoveCouponError(code: string): ErrorResponse;
    getApplyGiftCertificateError(code: string): ErrorResponse;
    getRemoveGiftCertificateError(code: string): ErrorResponse;

    // Cart
    getLoadCartError(): ErrorResponse;
    getVerifyCartError(): ErrorResponse;
    getUpdateCartItemError(itemId: string): ErrorResponse; // TODO: Not implemented
    getRemoveCartItemError(itemId: string): ErrorResponse; // TODO: Not implemented

    // Payment
    getLoadPaymentMethodsError(): ErrorResponse;
    getLoadPaymentMethodError(methodId: string): ErrorResponse;
    getInitializePaymentMethodError(methodId: string): ErrorResponse; // TODO: Not implemented
    getDeinitializePaymentMethodError(methodId: string): ErrorResponse; // TODO: Not implemented

    // Shopper
    getSignInError(): ErrorResponse;
    getSignOutError(): ErrorResponse;
    getConfirmAccountError(): ErrorResponse; // TODO: Not implemented
}

// TODO: Not implemented
interface CheckoutFormSelector {
    // Shipping
    getShippingAddressFields(): FormField[];

    // Billing
    getBillingAddressFields(): FormField[];
}

interface CheckoutMeta {
    geoCountryCode: string;
    sessionHash: string;
    deviceSessionId: string;
    deviceFingerprint: string;
}

interface CheckoutServiceConfig {
    config: Config;
    locale?: string;
}

interface CheckoutClientConfig {
    locale?: string;
}
```

### Cart

```ts
interface CartResponse {
    meta: Object;
    data: { cart: Cart };
}

interface Cart {
    id: string;
    items: CartItem[];
    currency: string;
    subtotal: { amount: number, integerAmount: number };
    coupon: { discountedAmount: number };
    discount: { amount: number, integerAmount: number };
    discountNotifications: string[],
    giftCertificate: { totalDiscountedAmount: number, appliedGiftCertificates: string[] };
    shipping: { amount: number, integerAmount: number, amountBeforeDiscount: number, integerAmountBeforeDiscount: number, required: boolean };
    storeCredit: { amount: number };
    taxSubtotal: { amount: number, integerAmount: number };
    taxTotal: { amount: number, integerAmount: number };
    handlingTotal: { amount: number, integerAmount: number };
    grandTotal: { amount: number, integerAmount: number };
}
```

### Quote

```ts
interface QuoteResponse {
    meta: {
        request: {
            geoCountryCode: string;
            deviceSessionId: string;
            sessionHash: string;
        },
    };
    data: {
        cart: Cart,
        customer: Customer,
        shippingOptions: Object<string, ShippingOption>,
        order: Order,
        quote: Quote,
    };
}

interface Quote {
    orderComment?: string;
    shippingOption?: string;
    billingAddress: Address;
    shippingAddress: Address;
}
```

### Order

```ts
interface OrderRequestBody {
    customerMessage?: string;
    useStoreCredit?: boolean;
    payment: Payment;
}

interface OrderResponse {
    meta: Object;
    data: { order: Order };
}

interface Order {
    orderId: string,
    token: string,
    payment: Object
    socialData Object,
    status: string;
    customerCreated: boolean;
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    items: CartItem[];
    currency: string;
    subtotal: { amount: number, integerAmount: number };
    coupon: { discountedAmount: number };
    discount: { amount: number, integerAmount: number };
    discountNotifications: string[],
    giftCertificate: { totalDiscountedAmount: number, appliedGiftCertificates: string[] };
    shipping: { amount: number, integerAmount: number, amountBeforeDiscount: number, integerAmountBeforeDiscount: number, required: boolean };
    storeCredit: { amount: number };
    taxSubtotal: { amount: number, integerAmount: number };
    taxTotal: { amount: number, integerAmount: number };
    handlingTotal: { amount: number, integerAmount: number };
    grandTotal: { amount: number, integerAmount: number };
}
```

### Shipping

```ts
interface ShippingResponse {
    meta: Object;
    data: {
        cart: Cart,
        quote: Quote,
        shippingOptions: Object<string, ShippingOption>,
    };
}

interface ShippingOption {
    description: string;
    formattedPrice: string;
    id: string;
    imageUrl: string;
    method: string;
    module: string;
    price: number;
    selected: boolean;
    transitTime: string;
}
```

### Billing

```ts
interface BillingResponse {
    meta: Object;
    data: { cart: Cart, quote: Quote };
}
```

### Payment

```ts
interface PaymentMethodsResponse {
    meta: Object;
    data: { paymentMethods: PaymentMethod[] };
}

interface PaymentMethodResponse {
    meta: Object;
    data: { paymentMethod: PaymentMethod };
}

interface Payment {
    creditCard: CreditCard;
    methodId: string;
    gatewayId?: string;
}

interface CreditCard {
    cvv: number;
    expiry: {
        month: number,
        year: number,
    };
    name: string;
    number: string;
    type: string;
}

interface PaymentMethod {
    id: string;
    logoUrl: string;
    method: string;
    supportedCards: string[];
    type: string;
    config: {
        displayName: string,
        cardCode: number,
        redirectUrl: string,
        merchantId: string,
    };
    nonce: string;
    clientToken: string;
}
```

### Customer

```ts
interface CustomerResponse {
    meta: Object;
    data: {
        cart: Cart,
        customer: Customer,
        quote: Quote,
        shippingOptions: Object<string, ShippingOption>,
    };
}

interface CustomerCredentials {
    email: string;
    password?: string;
}

interface Customer {
    addresses: Address[];
    customerId: number;
    customerGroupId: number;
    customerGroupName: string;
    isGuest: boolean;
    phoneNumber: string;
    storeCredit: number;
    email?: string;
    firstName?: string;
    name?: string;
}
```

### Address

```ts
interface Address {
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
    customFields: Array<{ fieldId: string, fieldValue: string }>;
}
```

### Country

```ts
interface CountriesResponse {
    meta: Object;
    data: Country[];
}

interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    states: CountryState[];
}

interface CountryState {
    code: string;
    name: string;
}
```

### Config

```ts
interface ServiceConfig {
    bigpayBaseUrl: string;
    clientSidePaymentProviders: string[];
    storeHash: string;
    storeId: string;
    storeLanguage: string;
    storeName: string;
}

interface Config {
    bigpayBaseUrl: string;
    cartLink: string;
    cdnPath: string;
    checkout: {
        enableOrderComments: boolean;
        enableTermsAndConditions: boolean;
        guestCheckoutEnabled: boolean;
        isCardVaultingEnabled: boolean;
        isPaymentRequestEnabled: boolean;
        isPaymentRequestCanMakePaymentEnabled: boolean;
        orderTermsAndConditions: boolean;
        orderTermsAndConditionsLink: boolean;
        orderTermsAndConditionsType: boolean;
        shippingQuoteFailedMessage: boolean;
        realtimeShippingProviders: string[];
        remoteCheckoutProviders: string[];
    };
    checkoutLink: string;
    clientSidePaymentProviders: string[];
    currency: Currency;
    defaultNewsletterSignup: boolean;
    orderConfirmationLink: string;
    orderEmail: string;
    passwordRequirements: {
        alpha: string;
        numeric: string;
        minlength: string;
        error: string;
    };
    shopPath: string;
    shopperCurrency: Currency;
    showNewsletterSignup: string;
    storeCountry: string;
    storeHash: string;
    storeId: string;
    storeLanguage: string;
    storeName: string;
    storePhoneNumber: string;
}
```

### Currency

```ts
interface Currency {
    code: string;
    decimal_places: number;
    decimal_separator: string;
    exchange_rate?: string;
    symbol_location: string;
    symbol: string;
    thousands_separator: string;
}
```

### Common

```ts
interface Subscriber {
    (state: CheckoutState): void;
}

interface SubscriptionFilter {
    (state: CheckoutState): any;
}

interface Unsubscriber {
    (): void;
}

interface RequestOptions {
    timeout: Timeout;
}

interface Timeout {
    onComplete(): void;
    complete(): void;
    start(): void;
}

interface ErrorResponse {
    code?: number;
    detail: string;
    errors: string[];
    status: number;
    title: string;
    type?: string;
}
```

### Public API objects (TBC)

```ts
interface CheckoutResponse {
    meta: Object;
    data: Checkout;
}

interface OrderResponse {
    meta: Object;
    data: Order;
}

interface ShippingResponse {
    meta: Object;
    data: ShippingOption[];
}

interface PaymentMethodsResponse {
    meta: Object;
    data: PaymentMethod[];
}

interface FormFieldsResponse {
    meta: Object;
    data: FormField[];
}

interface Checkout {
    id: string;
    orderId: string;
    cart: Cart;
    shopper: Shopper;
    billingAddress: Address;
    shippingAddresses: Address[];
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    coupons: Coupon[];
    giftCertificates: GiftCertificate[];
    shippingCostTotal: number;
    taxTotal: number;
    grandTotal: number;
    storeCredit: number;
    balanceDue: number;
}

interface Address {
    id: string;
    firstName: string;
    lastName: string;
    street1: string;
    street2: string;
    phone: string;
    email: string;
    region: string;
    country: string;
    postalCode: string;
    customFields: Array<{ fieldId: string, fieldValue: string }>;
}

interface ShippingOption {
    id: string;
    description: string;
    formattedPrice: number;
    imageUrl: string;
    price: number;
    selected: boolean;
    transitTime: string;
}

interface Cart {
    id: string;
    currency: Currency;
    taxIncluded: boolean;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    cartAmount: number;
    coupons: Coupon[];
    giftCertificates: GiftCertificate[];
    lineItems: LineItem[];
    links: Link[];
}

interface Order extends Cart {}

interface LineItem {
    digitalItems: DigitalItem[];
    giftCertificates: GiftCertificate[];
    physicalItems: PhysicalItem[];
}

interface CartItem {
    id: string;
    name: string;
    description: string;
    url: string;
    quantity: number;
    taxable: boolean;
    imageUrl: string;
    baseAmount: number;
    discountAmount: number;
    couponAmount: number;
    coupons: Coupon[];
    discounts: Discount[];
    finalAmount: number;
    itemTaxTotal: number;
    itemTotal: number;
}

interface DigitalItem extends CartItem {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}

interface PhysicalItem extends CartItem {
    variant: ItemVariant;
    modifiers: ItemModifier[];
    requireShipping: boolean;
    giftWrapping: boolean;
}

interface ItemModifier {
    id: number;
    name: number;
    valueId: number;
    valueLabel: string;
    shopperInput: string;
}

interface ItemVariant {
    id: number;
    productId: number;
    price: number;
    salePrice: number;
    retailPrice: number;
    skuId: number;
    sku: string;
    options: ItemVariantOption[];
}

interface ItemVariantOption {
    id: number;
    name: string;
    valueId: number;
    valueLabel: string;
}

interface Shopper {
    customerId: string;
    customerGroupId: string;
    storeCredit: string;
}

interface Consignment {
    id: string;
    shippingAddressId: string;
    shippingMethodId: string;
    shippingCost: number;
    lineItemIds: number[];
}

interface Tax {
    itemId: string;
    name: string;
    amount: number;
    percentage: number;
}

interface Discount {
    name: string;
    discountAmount: number;
}

interface Coupon {
    id: string;
    code: string;
    name: string;
    slug: string;
    couponType: string;
    discountAmount: number;
}

interface GiftCertificate {
    code: string;
    purchaseDate: string;
}

interface Link {
    ref: string;
    href: string;
}

interface FormField {
    id: string;
    custom: boolean;
    label: string;
    required: boolean;
    default: boolean;
    name?: string;
}

interface Currency {
    name: string;
    code: string;
    symbol: string;
}
```
