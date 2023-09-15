import { StoreConfig } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeScriptLoader from './braintree-script-loader';
import { isBraintreeError } from './guards';
import {
    BraintreeCachedDataCollectors,
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig,
    BraintreeError,
    BraintreePaypalCheckout,
    BraintreePaypalSdkOptions,
    PaypalSDK,
} from './types';

export default class BraintreeSdk {
    private braintreeCachedDataCollectors: BraintreeCachedDataCollectors = {};
    private braintreeClient?: BraintreeClient;
    private braintreePaypalCheckout?: BraintreePaypalCheckout;
    private braintreePaypalSdk?: PaypalSDK;

    constructor(private braintreeScriptLoader: BraintreeScriptLoader) {}

    /**
     *
     * This method is needed to set braintree sdk version based on
     * enabled experiments
     *
     */
    initialize(storeConfig: StoreConfig) {
        this.braintreeScriptLoader.initialize(storeConfig);
    }

    /**
     *
     * BraintreeClient is required by many other Braintree components.
     * It serves as the base API layer that communicates with PayPal servers.
     * Recently used as an option in configuration for other methods.
     *
     */
    async getBraintreeClient(clientToken: string): Promise<BraintreeClient> {
        if (!this.braintreeClient) {
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.braintreeClient = await clientCreator.create({ authorization: clientToken });
        }

        return this.braintreeClient;
    }

    /**
     *
     * The method is used to get access to an instance that contains:
     * - "loadPayPalSdk" method used to load PayPal sdk
     * - "createOrder" method used to create order on PayPal side
     * - "tokenize" method that used to tokenize transaction on PayPal side
     *
     */
    async getBraintreePaypalCheckout(
        braintreeClient: BraintreeClient,
    ): Promise<BraintreePaypalCheckout> {
        if (!this.braintreePaypalCheckout) {
            const paypalCheckout = await this.braintreeScriptLoader.loadPaypalCheckout();

            // Info: we should use new Promise here to get BraintreePaypalCheckout instance
            // from the callback that we pass to paypalCheckout.create method.
            // There is no other way how to get the instance and avoid callback hell.
            this.braintreePaypalCheckout = await new Promise(
                (
                    resolve: (instance: BraintreePaypalCheckout) => void,
                    reject: (error: BraintreeError | undefined) => void,
                ) => {
                    const paypalCheckoutConfig = { client: braintreeClient };
                    const paypalCheckoutCallback = (
                        error: BraintreeError | undefined,
                        instance: BraintreePaypalCheckout,
                    ) => (error ? reject(error) : resolve(instance));

                    void paypalCheckout.create(paypalCheckoutConfig, paypalCheckoutCallback);
                },
            );
        }

        return this.braintreePaypalCheckout;
    }

    /**
     *
     * This method used to get paypal sdk object or/and load it if it's not available
     * PayPal SDK is responsible to render buttons and messages(banners)
     *
     */
    async getBraintreePayPalSdk(
        braintreePayPalCheckout: BraintreePaypalCheckout,
        config: BraintreePaypalSdkOptions,
    ): Promise<PaypalSDK> {
        if (!this.braintreePaypalSdk) {
            const paypalSdkConfig = {
                components: 'buttons, messages',
                currency: config.currency,
                intent: config.intent,
                ...(config.isCreditEnabled && { 'enable-funding': 'paylater' }),
            };

            this.braintreePaypalSdk = await braintreePayPalCheckout.loadPayPalSDK(paypalSdkConfig);
        }

        return this.braintreePaypalSdk;
    }

    /**
     *
     * This method is used for fraud integration with PayPal and Kount.
     * Created DataCollector instances have deviceData which is
     * used to correlate user sessions with server transactions.
     *
     */
    async getDataCollector(
        braintreeClient: BraintreeClient,
        options?: Partial<BraintreeDataCollectorCreatorConfig>,
    ): Promise<BraintreeDataCollector> {
        const cacheKey: keyof BraintreeCachedDataCollectors = options?.paypal
            ? 'paypal'
            : 'default';

        let cached = this.braintreeCachedDataCollectors[cacheKey];

        if (!cached) {
            try {
                const dataCollector = await this.braintreeScriptLoader.loadDataCollector();

                const dataCollectorConfig: BraintreeDataCollectorCreatorConfig = {
                    client: braintreeClient,
                    kount: true,
                    ...options,
                };

                cached = await dataCollector.create(dataCollectorConfig);
            } catch (error) {
                if (isBraintreeError(error) && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                    cached = {
                        deviceData: undefined,
                        teardown: () => Promise.resolve(),
                    };
                } else {
                    throw error;
                }
            }

            this.braintreeCachedDataCollectors[cacheKey] = cached;
        }

        return cached;
    }
}
