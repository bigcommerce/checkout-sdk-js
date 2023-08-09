/**
 *
 * Common
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
    authorization?: string;
}

export interface BraintreeError extends Error {
    type: 'CUSTOMER' | 'MERCHANT' | 'NETWORK' | 'INTERNAL' | 'UNKNOWN';
    code: string;
    details?: unknown;
}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

export enum ApplePayGatewayType {
    BRAINTREE = 'braintree',
}

/**
 *
 * Braintree Client
 *
 */
export type BraintreeClientCreator = BraintreeModuleCreator<BraintreeClient>;

export interface BraintreeClient {
    request(payload: BraintreeRequestData): Promise<BraintreeTokenizeResponse>;
    getVersion(): string | void;
}

export interface BraintreeRequestData {
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

export interface BraintreeTokenizeResponse {
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
    kount?: boolean;
    paypal?: boolean;
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

/**
 *
 * Other
 *
 */

export interface BraintreeSDK {
    client?: BraintreeClientCreator;
    dataCollector?: BraintreeDataCollectorCreator;
}

export interface HostWindow extends Window {
    braintree?: BraintreeSDK;
}

export interface BraintreeInitializationData {
    intent?: 'authorize' | 'order' | 'sale';
    isCreditEnabled?: boolean;
    isAcceleratedCheckoutEnabled?: boolean;
}
