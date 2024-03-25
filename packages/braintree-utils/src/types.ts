export * from './braintree';
export * from './paypal';

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

export interface BraintreeClientRequestResponse {
    creditCards: Array<{ nonce: string }>;
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
