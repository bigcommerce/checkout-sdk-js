export * from './braintree';
export * from './paypal';
export * from './visacheckout';

/**
 *
 * Braintree Module
 *
 */
export interface BraintreeModuleCreator<
    TInstance,
    TOptions = BraintreeModuleCreatorConfig,
    TError = BraintreeError,
> {
    create(
        config: TOptions,
        callback?: (error: TError, instance: TInstance) => void,
    ): Promise<TInstance>;
}

export interface BraintreeModuleCreatorConfig {
    client?: BraintreeClient;
    authorization?: string; // Info: authorization uses clientToken as a value
}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

/**
 *
 * Braintree Window
 *
 */
export interface BraintreeWindow extends Window {
    client?: BraintreeClientCreator;
}

/**
 *
 * Braintree Client
 *
 */
export type BraintreeClientCreator = BraintreeModuleCreator<BraintreeClient>;

export interface BraintreeClient {
    request(payload: BraintreeClientRequestPayload): Promise<BraintreeClientRequestResponse>;
}

export interface BraintreeClientRequestPayload {
    data: {
        creditCard: {
            billingAddress?: {
                countryCodeAlpha2: string;
                locality: string;
                countryName: string;
                postalCode: string;
                streetAddress: string;
            };
            cardholderName: string;
            cvv?: string;
            expirationDate: string;
            number: string;
            options: {
                validate: boolean;
            };
        };
    };
    endpoint: string;
    method: string;
}

export interface BraintreeHostedFieldsTokenizePayload {
    nonce: string;
    details: {
        bin: string;
        cardType: string;
        expirationMonth: string;
        expirationYear: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    type: string;
    binData: {
        commercial: string;
        countryOfIssuance: string;
        debit: string;
        durbinRegulated: string;
        healthcare: string;
        issuingBank: string;
        payroll: string;
        prepaid: string;
        productId: string;
    };
}

export interface BraintreeClientRequestResponse {
    creditCards: BraintreeHostedFieldsTokenizePayload[];
}

/**
 *
 * Braintree Data Collector
 *
 */
export type BraintreeDataCollectorCreator = BraintreeModuleCreator<
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig
>;

export interface BraintreeDataCollectorCreatorConfig extends BraintreeModuleCreatorConfig {
    kount?: boolean; // Info: this param is needed for fraud detection (should always be 'true')
    paypal?: boolean; // TODO: based on braintree documentation, this param is deprecated, so we dont need it anymore
    riskCorrelationId?: string; // Info: the option is needed for PayPal Analytics
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

// TODO: remove this interface when BraintreeIntegrationService will be removed
export interface BraintreeDataCollectors {
    default?: BraintreeDataCollector;
    paypal?: BraintreeDataCollector;
}

/**
 *
 * Braintree Local Payment
 *
 */
export type BraintreeLocalPaymentCreator = BraintreeModuleCreator<
    BraintreeLocalPayment,
    BraintreeLocalPaymentCreateConfig
>;

export interface BraintreeLocalPaymentCreateConfig extends BraintreeModuleCreatorConfig {
    merchantAccountId: string;
}

export interface BraintreeLocalPayment extends BraintreeModule {
    startPayment(
        config: BraintreeLocalPaymentConfig,
        callback: (error: BraintreeError, payload: BraintreeLocalPaymentPayload) => void,
    ): Promise<void>;
}

export interface BraintreeLocalPaymentConfig {
    address: {
        countryCode: string;
        // TODO: this interface can be updated with extra shipping address
        // to prefill users data in the paypal popup
    };
    amount: number;
    currencyCode: string;
    email: string;
    fallback: { // TODO: do we need this fallback?
        url: string;
        buttonText: string;
    };
    givenName: string; // firstname
    surname: string; // lastname
    paymentType: string;
    shippingAddressRequired: boolean;
    onPaymentStart(
        data: { paymentId: string },
        start: () => Promise<void>,
    ): void;
}

export interface BraintreeLocalPaymentPayload {
    nonce: string;
}

/**
 *
 * Braintree US Bank Account
 *
 */
export type BraintreeUsBankAccountCreator = BraintreeModuleCreator<BraintreeUsBankAccount>;

export interface BraintreeUsBankAccount {
    tokenize(
        options: BraintreeUsBankAccountTokenizationOptions,
    ): Promise<BraintreeUsBankAccountTokenizationResponse>;
}

export interface BraintreeUsBankAccountTokenizationOptions {
    bankDetails: BraintreeUsBankAccountDetails;
    mandateText: string;
}

export interface BraintreeUsBankAccountTokenizationResponse {
    nonce: string;
    details: BraintreeTokenizationDetails;
}

export interface BraintreeUsBankAccountDetails {
    accountNumber: string;
    routingNumber: string;
    ownershipType: string;
    accountType: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    billingAddress: {
        streetAddress: string;
        extendedAddress: string;
        locality: string;
        region: string;
        postalCode: string;
    };
}

// TODO: move this interface in separate types group if it will be used in another (not ACH) strategies
// This seems to be an interface which will be used in different places
export interface BraintreeTokenizationDetails {
    username?: string;
    email?: string;
    payerId?: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    phone?: string;
    shippingAddress?: BraintreeShippingAddress;
    billingAddress?: BraintreeAddress;
}

export interface BraintreeAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
}

export interface BraintreeShippingAddress extends BraintreeAddress {
    recipientName: string;
}

/**
 *
 * Braintree Errors
 *
 */
export enum BraintreeErrorType {
    Customer = 'CUSTOMER',
    Merchant = 'MERCHANT',
    Network = 'NETWORK',
    Internal = 'INTERNAL',
    Unknown = 'UNKNOWN',
}

export enum BraintreeErrorCode {
    KountNotEnabled = 'DATA_COLLECTOR_KOUNT_NOT_ENABLED',
}

export interface BraintreeError extends Error {
    type: BraintreeErrorType;
    code: string | BraintreeErrorCode.KountNotEnabled;
    details?: unknown;
}
