import {
    Address,
    LegacyAddress,
    NotInitializedError,
    NotInitializedErrorType,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccount,
    BraintreeClient,
    BraintreeConnectStylesOption,
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig,
    BraintreeDetails,
    BraintreeEnv,
    BraintreeError,
    BraintreeHostWindow,
    BraintreeModule,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeShippingAddressOverride,
    GetLocalPaymentInstance,
    LocalPaymentInstance,
} from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';
import isBraintreeError from './is-braintree-error';
import { PAYPAL_COMPONENTS } from './paypal';
import getValidBraintreeConnectStyles from './utils/get-valid-braintree-connect-styles';

interface DataCollectors {
    default?: BraintreeDataCollector;
    paypal?: BraintreeDataCollector;
}

export default class BraintreeIntegrationService {
    private client?: Promise<BraintreeClient>;
    private clientToken?: string;
    private dataCollectors: DataCollectors = {};
    private paypalCheckout?: BraintreePaypalCheckout;
    private usBankAccount?: Promise<BraintreeBankAccount>;
    private braintreeLocalMethods?: LocalPaymentInstance;

    constructor(
        private braintreeScriptLoader: BraintreeScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    initialize(clientToken: string, storeConfig: StoreConfig) {
        this.clientToken = clientToken;
        this.braintreeScriptLoader.initialize(storeConfig);
    }

    async getBraintreeConnect(
        cardId?: string,
        isTestModeEnabled?: boolean,
        styles?: BraintreeConnectStylesOption,
    ) {
        if (isTestModeEnabled) {
            window.localStorage.setItem('axoEnv', 'sandbox');
        }

        if (!this.braintreeHostWindow.braintreeConnect) {
            const clientToken = this.getClientTokenOrThrow();
            const client = await this.getClient();
            const deviceData = await this.getSessionId(cardId);

            const braintreeConnectCreator = await this.braintreeScriptLoader.loadConnect();

            this.braintreeHostWindow.braintreeConnect = await braintreeConnectCreator.create({
                authorization: clientToken,
                client,
                deviceData,
                styles: getValidBraintreeConnectStyles(styles),
            });
        }

        return this.braintreeHostWindow.braintreeConnect;
    }

    async getClient(): Promise<BraintreeClient> {
        if (!this.client) {
            const clientToken = this.getClientTokenOrThrow();
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.client = clientCreator.create({ authorization: clientToken });
        }

        return this.client;
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

    async getUsBankAccount() {
        if (!this.usBankAccount) {
            const client = await this.getClient();
            const usBankAccount = await this.braintreeScriptLoader.loadUsBankAccount();

            this.usBankAccount = usBankAccount.create({ client });
        }

        return this.usBankAccount;
    }

    async getDataCollector(
        options?: Partial<BraintreeDataCollectorCreatorConfig>,
    ): Promise<BraintreeDataCollector> {
        const cacheKey: keyof DataCollectors = options?.paypal ? 'paypal' : 'default';

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

    mapToLegacyShippingAddress(details: BraintreeDetails): Partial<LegacyAddress> {
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

    mapToLegacyBillingAddress(details: BraintreeDetails): Partial<LegacyAddress> {
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
