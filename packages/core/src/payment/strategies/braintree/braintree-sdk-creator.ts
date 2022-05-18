import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { PaypalHostWindow } from '../paypal';

import { BraintreeClient,
    BraintreeDataCollector,
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig,
    BraintreeModule,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreeThreeDSecure,
    BraintreeVisaCheckout,
    GetPaypalConfig,
    GetVenmoConfig,
    GooglePayBraintreeSDK,
    PaypalClientInstance,
    PAYPAL_COMPONENTS,
    RenderButtons,
    RenderVenmoButtons,
    VenmoCheckout,
    VenmoInstance } from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';

export default class BraintreeSDKCreator {
    private _client?: Promise<BraintreeClient>;
    private _3ds?: Promise<BraintreeThreeDSecure>;
    private _paypal?: Promise<BraintreePaypal>;
    private _paypalCheckout?: Promise<BraintreePaypalCheckout>;
    private _clientToken?: string;
    private _visaCheckout?: Promise<BraintreeVisaCheckout>;
    private _dataCollectors: {
        default?: Promise<BraintreeDataCollector>;
        paypal?: Promise<BraintreeDataCollector>;
    } = {};
    private _googlePay?: Promise<GooglePayBraintreeSDK>;
    private _paypalcheckoutInstance?: PaypalClientInstance;
    private _venmoCheckoutInstance?: VenmoInstance;
    private _venmoCheckout?: VenmoCheckout;
    private _window: PaypalHostWindow = window;

    constructor(
        private _braintreeScriptLoader: BraintreeScriptLoader
    ) {}

    initialize(clientToken: string) {
        this._clientToken = clientToken;
    }

    getClient(): Promise<BraintreeClient> {
        if (!this._clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this._client) {
            this._client = this._braintreeScriptLoader.loadClient()
                .then(client => client.create({ authorization: this._clientToken }));
        }

        return this._client;
    }

   async getFraudnetDataCollector() {
        const client = await this.getClient();

        return  this._window.braintree.dataCollector.create({client});
    }

    getPaypal(): Promise<BraintreePaypal> {
        if (!this._paypal) {
            this._paypal = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadPaypal(),
            ])
                .then(([client, paypal]) => paypal.create({ client }));
        }

        return this._paypal;
    }

    getPaypalCheckout(config: GetPaypalConfig, renderButtonCallback: RenderButtons): Promise<BraintreePaypalCheckout> {
        if (!this._paypalCheckout) {
            this._paypalCheckout = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadPaypalCheckout(),
            ])
                .then(([client, paypalCheckout]) => paypalCheckout.create({ client }, (_error: string, instance: PaypalClientInstance) =>  {
                    this._paypalcheckoutInstance = instance;
                    instance.loadPayPalSDK({
                        currency: config.currency,
                        components: PAYPAL_COMPONENTS.toString(),
                    }, () => {
                        renderButtonCallback(instance);
                    });
                }));
        } else if (this._paypalcheckoutInstance) {
            renderButtonCallback(this._paypalcheckoutInstance);
        }

        return this._paypalCheckout;
    }

    getVenmoCheckout(config: GetVenmoConfig, getVenmoInstance: RenderVenmoButtons): Promise<void> {
        if (!config.isBraintreeVenmoEnabled) {
            return Promise.resolve();
        }
        this._venmoCheckout = Promise.all([
            this.getClient(),
            this._braintreeScriptLoader.loadVenmoCheckout(),
        ])
            .then(([client, venmoCheckout]) => venmoCheckout.create({
                    client, allowDesktop: true,
                    paymentMethodUsage: 'multi_use',
                },
                (venmoErr: string, venmoInstance: VenmoInstance) =>  {
                    this._venmoCheckoutInstance = venmoInstance;
                    getVenmoInstance(this._venmoCheckoutInstance);
                    if (venmoErr) {
                        return;
                    }

                    if (!venmoInstance.isBrowserSupported()) {

                        return;
                    }
                }));

        return this._venmoCheckout;
    }

    get3DS(): Promise<BraintreeThreeDSecure> {
        if (!this._3ds) {
            this._3ds = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.load3DS(),
            ])
                .then(([client, threeDSecure]) => threeDSecure.create({ client, version: 2}));
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
                .then(([client, dataCollector]) => dataCollector.create({ client, kount: true, ...options }))
                .catch(error => {
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
            ])
                .then(([client, visaCheckout]) => visaCheckout.create({ client }));
        }

        return this._visaCheckout;
    }

    getGooglePaymentComponent(): Promise<GooglePayBraintreeSDK> {
        if (!this._googlePay) {
            this._googlePay = Promise.all ([
                this.getClient(),
                this._braintreeScriptLoader.loadGooglePayment(),
            ])
                .then(([client, googlePay]) => googlePay.create({ client }));
        }

        return this._googlePay;
    }

    async createHostedFields(
        options: Pick<BraintreeHostedFieldsCreatorConfig, 'fields' | 'styles'>
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
            this._teardown(this._visaCheckout),
            this._teardown(this._googlePay),
        ]).then(() => {
            this._3ds = undefined;
            this._visaCheckout = undefined;
            this._dataCollectors = {};
            this._googlePay = undefined;
        });
    }

    private _teardown(module?: Promise<BraintreeModule>) {
        return module ?
            module.then(mod => mod.teardown()) :
            Promise.resolve();
    }
}
