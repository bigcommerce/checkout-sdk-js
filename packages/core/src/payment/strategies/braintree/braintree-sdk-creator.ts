import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeError,
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig,
    BraintreeModule,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeScriptLoader,
    BraintreeThreeDSecure,
    BraintreeVenmoCheckout,
    BraintreeVisaCheckout,
    PAYPAL_COMPONENTS,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    NotInitializedError,
    NotInitializedErrorType,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { PaypalHostWindow } from '../paypal';

import { BraintreeVenmoCreatorConfig } from './braintree';

export default class BraintreeSDKCreator {
    private _client?: Promise<BraintreeClient>;
    private _3ds?: Promise<BraintreeThreeDSecure>;
    private _paypalCheckout?: Promise<BraintreePaypalCheckout>;
    private _clientToken?: string;
    private _visaCheckout?: Promise<BraintreeVisaCheckout>;
    private _venmoCheckout?: Promise<BraintreeVenmoCheckout>;
    private _dataCollectors: {
        default?: Promise<BraintreeDataCollector>;
        paypal?: Promise<BraintreeDataCollector>;
    } = {};
    private _window: PaypalHostWindow;

    constructor(private _braintreeScriptLoader: BraintreeScriptLoader) {
        this._window = window;
    }

    initialize(clientToken: string) {
        this._clientToken = clientToken;
    }

    getClient(): Promise<BraintreeClient> {
        if (!this._clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this._client) {
            this._client = this._braintreeScriptLoader
                .loadClient()
                .then((client) => client.create({ authorization: this._clientToken }));
        }

        return this._client;
    }

    async getPaypalCheckout(
        config: Partial<BraintreePaypalSdkCreatorConfig>,
        onSuccess: (instance: BraintreePaypalCheckout) => void,
        onError: (error: BraintreeError) => void,
    ): Promise<BraintreePaypalCheckout> {
        const client = await this.getClient();
        const paypalCheckout = await this._braintreeScriptLoader.loadPaypalCheckout();

        const paypalCheckoutConfig = { client };
        const paypalCheckoutCallback = (
            error: BraintreeError,
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            if (error) {
                return onError(error);
            }

            const paypalSdkLoadCallback = () => onSuccess(braintreePaypalCheckout);

            if (!this._window.paypal) {
                braintreePaypalCheckout.loadPayPalSDK(
                    this._getPayPalSDKConfig(config),
                    paypalSdkLoadCallback,
                );
            } else {
                onSuccess(braintreePaypalCheckout);
            }
        };

        this._paypalCheckout = paypalCheckout.create(paypalCheckoutConfig, paypalCheckoutCallback);

        return this._paypalCheckout;
    }

    async getVenmoCheckout(
        onSuccess: (braintreeVenmoCheckout: BraintreeVenmoCheckout) => void,
        onError: (error: BraintreeError | UnsupportedBrowserError) => void,
        venmoConfig?: BraintreeVenmoCreatorConfig,
    ): Promise<BraintreeVenmoCheckout> {
        if (!this._venmoCheckout) {
            const client = await this.getClient();

            const venmoCheckout = await this._braintreeScriptLoader.loadVenmoCheckout();

            const venmoCheckoutConfig = {
                client,
                allowDesktop: true,
                paymentMethodUsage: 'multi_use',
                ...(venmoConfig || {}),
            };

            const venmoCheckoutCallback = (
                error: BraintreeError,
                braintreeVenmoCheckout: BraintreeVenmoCheckout,
            ): void => {
                if (error) {
                    return onError(error);
                }

                if (!braintreeVenmoCheckout.isBrowserSupported()) {
                    return onError(new UnsupportedBrowserError());
                }

                onSuccess(braintreeVenmoCheckout);
            };

            this._venmoCheckout = venmoCheckout.create(venmoCheckoutConfig, venmoCheckoutCallback);
        }

        return this._venmoCheckout;
    }

    get3DS(): Promise<BraintreeThreeDSecure> {
        if (!this._3ds) {
            this._3ds = Promise.all([this.getClient(), this._braintreeScriptLoader.load3DS()]).then(
                ([client, threeDSecure]) => threeDSecure.create({ client, version: 2 }),
            );
        }

        return this._3ds;
    }

    getDataCollector(options?: { paypal: boolean }): Promise<BraintreeDataCollector> {
        const cacheKey = options && options.paypal ? 'paypal' : 'default';
        let cached = this._dataCollectors[cacheKey];

        if (!cached) {
            cached = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadDataCollector(),
            ])
                .then(([client, dataCollector]) =>
                    dataCollector.create({ client, kount: true, ...options }),
                )
                .catch((error) => {
                    if (error && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                        return { deviceData: undefined, teardown: () => Promise.resolve() };
                    }

                    throw error;
                });

            this._dataCollectors[cacheKey] = cached;
        }

        return cached;
    }

    getVisaCheckout(): Promise<BraintreeVisaCheckout> {
        if (!this._visaCheckout) {
            this._visaCheckout = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadVisaCheckout(),
            ]).then(([client, visaCheckout]) => visaCheckout.create({ client }));
        }

        return this._visaCheckout;
    }

    async createHostedFields(
        options: Pick<BraintreeHostedFieldsCreatorConfig, 'fields' | 'styles'>,
    ): Promise<BraintreeHostedFields> {
        const [client, hostedFields] = await Promise.all([
            this.getClient(),
            this._braintreeScriptLoader.loadHostedFields(),
        ]);

        return hostedFields.create({ ...options, client });
    }

    teardown(): Promise<void> {
        return Promise.all([
            this._teardown(this._3ds),
            this._teardown(this._dataCollectors.default),
            this._teardown(this._dataCollectors.paypal),
            this._teardown(this._paypalCheckout),
            this._teardown(this._venmoCheckout),
            this._teardown(this._visaCheckout),
        ]).then(() => {
            this._3ds = undefined;
            this._dataCollectors = {};
            this._paypalCheckout = undefined;
            this._venmoCheckout = undefined;
            this._visaCheckout = undefined;
        });
    }

    private _teardown(module?: Promise<BraintreeModule>) {
        return module
            ? module
                  .then((mod) => mod.teardown())
                  .catch((error) => {
                      if (error.code !== 'METHOD_CALLED_AFTER_TEARDOWN') {
                          throw error;
                      }
                  })
            : Promise.resolve();
    }

    private _getPayPalSDKConfig(config: Partial<BraintreePaypalSdkCreatorConfig>) {
        return {
            currency: config.currency,
            ...(config.isCreditEnabled && { 'enable-funding': 'paylater' }),
            components: PAYPAL_COMPONENTS.toString(),
            intent: config.intent,
            commit: false,
        };
    }
}
