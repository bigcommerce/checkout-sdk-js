import { supportsPopups } from '@braintree/browser-detection';

import {
    Address,
    LegacyAddress,
    NotInitializedError,
    NotInitializedErrorType,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Overlay } from '@bigcommerce/checkout-sdk/ui';

import BraintreeScriptLoader from './braintree-script-loader';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig,
    BraintreeDataCollectors,
    BraintreeEnv,
    BraintreeError,
    BraintreeFastlane,
    BraintreeFastlaneStylesOption,
    BraintreeHostWindow,
    BraintreeModule,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeShippingAddressOverride,
    BraintreeThreeDSecure,
    BraintreeTokenizationDetails,
    BraintreeTokenizePayload,
    GetLocalPaymentInstance,
    GooglePayBraintreeSDK,
    LocalPaymentInstance,
    PAYPAL_COMPONENTS,
} from './types';
import isBraintreeError from './utils/is-braintree-error';

export interface PaypalConfig {
    amount: number;
    currency: string;
    locale: string;
    offerCredit?: boolean;
    shippingAddressEditable?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    shouldSaveInstrument?: boolean;
}

// Info: this class is deprecated and will be removed in a nearest future. Please, do not add anything here.
export default class BraintreeIntegrationService {
    private client?: Promise<BraintreeClient>;
    private clientToken?: string;
    private dataCollectors: BraintreeDataCollectors = {};
    private paypalCheckout?: BraintreePaypalCheckout;
    private braintreeLocalMethods?: LocalPaymentInstance;
    private googlePay?: Promise<GooglePayBraintreeSDK>;
    private threeDS?: Promise<BraintreeThreeDSecure>;
    private braintreePaypal?: Promise<BraintreePaypal>;

    constructor(
        private braintreeScriptLoader: BraintreeScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
        private overlay?: Overlay,
    ) {}

    initialize(clientToken: string, storeConfig?: StoreConfig) {
        this.clientToken = clientToken;
        this.braintreeScriptLoader.initialize(storeConfig);
    }

    async getBraintreeFastlane(
        cardId?: string,
        isTestModeEnabled?: boolean,
        styles?: BraintreeFastlaneStylesOption,
    ): Promise<BraintreeFastlane> {
        if (isTestModeEnabled) {
            window.localStorage.setItem('axoEnv', 'sandbox');
            window.localStorage.setItem('fastlaneEnv', 'sandbox');
        }

        if (!this.braintreeHostWindow.braintreeFastlane) {
            const clientToken = this.getClientTokenOrThrow();
            const client = await this.getClient();
            const deviceData = await this.getSessionId(cardId);

            const braintreeFastlaneCreator = await this.braintreeScriptLoader.loadFastlane();

            const defaultStyles = {
                root: {
                    backgroundColorPrimary: 'transparent',
                },
            };

            this.braintreeHostWindow.braintreeFastlane = await braintreeFastlaneCreator.create({
                authorization: clientToken,
                client,
                deviceData,
                styles: styles || defaultStyles,
            });
        }

        return this.braintreeHostWindow.braintreeFastlane;
    }

    // Info: This method is deprecated. Use getClient method from BraintreeSdk class instead
    async getClient(): Promise<BraintreeClient> {
        if (!this.client) {
            const clientToken = this.getClientTokenOrThrow();
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.client = clientCreator.create({ authorization: clientToken });
        }

        return this.client;
    }

    getPaypal(): Promise<BraintreePaypal> {
        if (!this.braintreePaypal) {
            this.braintreePaypal = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.loadPaypal(),
            ]).then(([client, paypal]) => paypal.create({ client }));
        }

        return this.braintreePaypal;
    }

    paypal({ shouldSaveInstrument, ...config }: PaypalConfig): Promise<BraintreeTokenizePayload> {
        const newWindowFlow = supportsPopups();

        return this.getPaypal()
            .then((paypal) => {
                if (newWindowFlow) {
                    this.overlay?.show({
                        onClick: () => paypal.focusWindow(),
                    });
                }

                return paypal.tokenize({
                    enableShippingAddress: true,
                    flow: shouldSaveInstrument ? 'vault' : 'checkout',
                    useraction: 'commit',
                    ...config,
                });
            })
            .then((response) => {
                this.overlay?.remove();

                return response;
            })
            .catch((error) => {
                this.overlay?.remove();

                throw error;
            });
    }

    async getPaypalCheckout(
        config: Partial<BraintreePaypalSdkCreatorConfig>,
        onSuccess: (instance: BraintreePaypalCheckout) => void,
        onError: (error: BraintreeError) => void,
    ): Promise<BraintreePaypalCheckout> {
        const client = await this.getClient();
        const paypalCheckout = await this.braintreeScriptLoader.loadPaypalCheckout();

        const paypalCheckoutConfig = { client };
        const paypalCheckoutCallback = (
            error: BraintreeError | undefined,
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            if (error) {
                return onError(error);
            }

            const paypalSdkLoadCallback = () => onSuccess(braintreePaypalCheckout);
            const paypalSdkLoadConfig = {
                currency: config.currency,
                ...(config.isCreditEnabled && { 'enable-funding': 'paylater' }),
                components: PAYPAL_COMPONENTS.toString(),
                intent: config.intent,
                commit: config.commit ?? true,
            };

            if (!this.braintreeHostWindow.paypal) {
                braintreePaypalCheckout.loadPayPalSDK(paypalSdkLoadConfig, paypalSdkLoadCallback);
            } else {
                onSuccess(braintreePaypalCheckout);
            }
        };

        this.paypalCheckout = await paypalCheckout.create(
            paypalCheckoutConfig,
            paypalCheckoutCallback,
        );

        return this.paypalCheckout;
    }

    async loadBraintreeLocalMethods(
        getLocalPaymentInstance: GetLocalPaymentInstance,
        merchantAccountId: string,
    ) {
        const client = await this.getClient();
        const braintreeLocalMethods = await this.braintreeScriptLoader.loadBraintreeLocalMethods();

        if (!this.braintreeLocalMethods) {
            this.braintreeLocalMethods = await braintreeLocalMethods.create(
                {
                    client,
                    merchantAccountId,
                },
                (
                    localPaymentErr: BraintreeError | undefined,
                    localPaymentInstance: LocalPaymentInstance,
                ) => {
                    if (localPaymentErr) {
                        throw new Error(localPaymentErr.message);
                    }

                    getLocalPaymentInstance(localPaymentInstance);
                },
            );
        }

        return this.braintreeLocalMethods;
    }

    get3DS(): Promise<BraintreeThreeDSecure> {
        if (!this.threeDS) {
            this.threeDS = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.load3DS(),
            ]).then(([client, threeDSecure]) => threeDSecure.create({ client, version: 2 }));
        }

        return this.threeDS;
    }

    async getDataCollector(
        options?: Partial<BraintreeDataCollectorCreatorConfig>,
    ): Promise<BraintreeDataCollector> {
        const cacheKey: keyof BraintreeDataCollectors = options?.paypal ? 'paypal' : 'default';

        let cached = this.dataCollectors[cacheKey];

        if (!cached) {
            try {
                const client = await this.getClient();
                const dataCollector = await this.braintreeScriptLoader.loadDataCollector();

                const dataCollectorConfig: BraintreeDataCollectorCreatorConfig = {
                    client,
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

            this.dataCollectors[cacheKey] = cached;
        }

        return cached;
    }

    getGooglePaymentComponent(): Promise<GooglePayBraintreeSDK> {
        if (!this.googlePay) {
            this.googlePay = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.loadGooglePayment(),
            ]).then(([client, googlePay]) => googlePay.create({ client }));
        }

        return this.googlePay;
    }

    getBraintreeEnv(isTestMode = false): BraintreeEnv {
        return isTestMode ? BraintreeEnv.Sandbox : BraintreeEnv.Production;
    }

    mapToBraintreeShippingAddressOverride(address: Address): BraintreeShippingAddressOverride {
        return {
            recipientName: `${address.firstName} ${address.lastName}`,
            line1: address.address1,
            line2: address.address2,
            city: address.city,
            state: address.stateOrProvinceCode,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phone,
        };
    }

    mapToLegacyShippingAddress(details: BraintreeTokenizationDetails): Partial<LegacyAddress> {
        const { email, phone, shippingAddress } = details;
        const recipientName = shippingAddress?.recipientName || '';
        const [firstName, lastName] = recipientName.split(' ');

        return {
            email,
            first_name: firstName || '',
            last_name: lastName || '',
            phone_number: phone,
            address_line_1: shippingAddress?.line1,
            address_line_2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            country_code: shippingAddress?.countryCode,
            postal_code: shippingAddress?.postalCode,
        };
    }

    mapToLegacyBillingAddress(details: BraintreeTokenizationDetails): Partial<LegacyAddress> {
        const { billingAddress, email, firstName, lastName, phone, shippingAddress } = details;

        const address = billingAddress || shippingAddress;

        return {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            address_line_1: address?.line1,
            address_line_2: address?.line2,
            city: address?.city,
            state: address?.state,
            country_code: address?.countryCode,
            postal_code: address?.postalCode,
        };
    }

    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }

    async getSessionId(cartId?: string): Promise<string | undefined> {
        const { deviceData } = await this.getDataCollector({
            riskCorrelationId: cartId,
        });

        return deviceData;
    }

    async teardown(): Promise<void> {
        await this.teardownModule(this.dataCollectors.default);
        await this.teardownModule(this.dataCollectors.paypal);
        this.dataCollectors = {};

        await this.teardownModule(this.paypalCheckout);
        this.paypalCheckout = undefined;

        // TODO: should be added in future migrations

        // await this.teardownModule(this._3ds);
        // this._3ds = undefined;

        // await this.teardownModule(this._googlePay);
        // this._googlePay = undefined;

        // await this.teardownModule(this._venmoCheckout);
        // this._venmoCheckout = undefined;

        // await this.teardownModule(this._visaCheckout);
        // this._visaCheckout = undefined;
    }

    private teardownModule(module?: BraintreeModule) {
        return module ? module.teardown() : Promise.resolve();
    }

    private getClientTokenOrThrow(): string {
        if (!this.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.clientToken;
    }
}
