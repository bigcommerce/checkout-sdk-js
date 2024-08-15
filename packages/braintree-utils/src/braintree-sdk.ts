import {
    NotInitializedError,
    NotInitializedErrorType,
    StoreConfig,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeScriptLoader from './braintree-script-loader';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig,
    BraintreeErrorCode,
    BraintreeModule,
    BraintreeUsBankAccount,
    BraintreeVenmoCheckout,
    BraintreeVisaCheckout,
} from './types';
import isBraintreeError from './utils/is-braintree-error';
import { VisaCheckoutSDK } from './visacheckout';

export default class BraintreeSdk {
    private client?: BraintreeClient;
    private clientToken?: string;
    private dataCollector?: BraintreeDataCollector;
    private usBankAccount?: BraintreeUsBankAccount;
    private visaCheckout?: Promise<BraintreeVisaCheckout>;
    private visaCheckoutSDK?: VisaCheckoutSDK;
    private braintreeVenmo?: BraintreeVenmoCheckout;

    constructor(private braintreeScriptLoader: BraintreeScriptLoader) {}

    initialize(clientToken: string, storeConfig?: StoreConfig): void {
        this.setBraintreeSdkVersion(storeConfig);
        this.setClientToken(clientToken);
    }

    async deinitialize(): Promise<void> {
        await this.teardownModule(this.dataCollector);

        this.dataCollector = undefined;
    }

    /**
     *
     * Braintree Client
     * braintree doc: https://braintree.github.io/braintree-web/current/module-braintree-web_client.html
     *
     */
    async getClient(): Promise<BraintreeClient> {
        if (!this.client) {
            const clientToken = this.getClientTokenOrThrow();
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.client = await clientCreator.create({ authorization: clientToken });
        }

        return this.client;
    }

    /**
     *
     * Braintree Data collector
     * braintree doc: https://braintree.github.io/braintree-web/current/module-braintree-web_data-collector.html
     *
     */
    async getDataCollectorOrThrow(
        options?: Partial<BraintreeDataCollectorCreatorConfig>,
    ): Promise<BraintreeDataCollector> {
        const emptyDataCollector = {
            deviceData: undefined,
            teardown: () => Promise.resolve(),
        };

        if (!this.dataCollector) {
            try {
                const client = await this.getClient();
                const dataCollector = await this.braintreeScriptLoader.loadDataCollector();

                const dataCollectorConfig: BraintreeDataCollectorCreatorConfig = {
                    client,
                    kount: true,
                    ...options,
                };

                this.dataCollector = await dataCollector.create(dataCollectorConfig);
            } catch (error) {
                if (isBraintreeError(error) && error.code === BraintreeErrorCode.KountNotEnabled) {
                    return emptyDataCollector;
                }

                throw error;
            }
        }

        return this.dataCollector;
    }

    /**
     *
     * Braintree UsBankAccount
     * braintree doc: https://braintree.github.io/braintree-web/current/module-braintree-web_us-bank-account.html
     *
     */
    async getUsBankAccount() {
        if (!this.usBankAccount) {
            const client = await this.getClient();
            const usBankAccount = await this.braintreeScriptLoader.loadUsBankAccount();

            this.usBankAccount = await usBankAccount.create({ client });
        }

        return this.usBankAccount;
    }

    /**
     *
     * Braintree Visa Checkout
     * braintree doc: https://braintree.github.io/braintree-web/current/module-braintree-web_visa-checkout.html
     *
     */
    getBraintreeVisaCheckout() {
        if (!this.visaCheckout) {
            this.visaCheckout = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.loadVisaCheckout(),
            ]).then(([client, paypal]) => paypal.create({ client }));
        }

        return this.visaCheckout;
    }

    /**
     *
     * Visa Checkout SDK
     * visa checkout doc: https://developer.visa.com/capabilities/visa_checkout/docs-how-to
     *
     */
    async getVisaCheckoutSdk(testMode?: boolean) {
        if (!this.visaCheckoutSDK) {
            this.visaCheckoutSDK = await this.braintreeScriptLoader.loadVisaCheckoutSdk(testMode);
        }

        return this.visaCheckoutSDK;
    }

    /**
     *
     * Braintree Venmo Checkout
     * braintree venmo checkout doc: https://braintree.github.io/braintree-web/current/module-braintree-web_venmo.html
     *
     */
    async getVenmoCheckoutOrThrow() {
        if (!this.braintreeVenmo) {
            const client = await this.getClient();
            const venmoCheckout = await this.braintreeScriptLoader.loadVenmoCheckout();

            const venmoCheckoutConfig = {
                client,
                allowDesktop: true,
                paymentMethodUsage: 'multi_use',
            };

            const braintreeVenmoCheckout = await venmoCheckout.create(venmoCheckoutConfig);

            if (braintreeVenmoCheckout.isBrowserSupported()) {
                this.braintreeVenmo = braintreeVenmoCheckout;
            } else {
                throw new UnsupportedBrowserError();
            }
        }

        return this.braintreeVenmo;
    }

    /**
     *
     * Private methods
     *
     */
    // TODO: update this method with code from this.braintreeScriptLoader.initialize and remove this.braintreeScriptLoader.initialize at all,
    // therefore we can provide braintreeSdkVersion to different braintree script loader method to keep script loader without any side effect
    private setBraintreeSdkVersion(storeConfig?: StoreConfig): void {
        this.braintreeScriptLoader.initialize(storeConfig);
    }

    private setClientToken(clientToken: string): void {
        this.clientToken = clientToken;
    }

    private getClientTokenOrThrow(): string {
        if (!this.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.clientToken;
    }

    private teardownModule(module?: BraintreeModule): Promise<void> {
        return module ? module.teardown() : Promise.resolve();
    }
}
