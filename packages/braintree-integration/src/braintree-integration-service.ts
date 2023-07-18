import {
    Address,
    LegacyAddress,
    NotInitializedError,
    NotInitializedErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccount,
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeDetails,
    BraintreeEnv,
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreeModule,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeShippingAddressOverride,
} from './braintree';
import {
    BraintreeLocalMethods,
    GetLocalPaymentInstance,
    LocalPaymentInstance,
} from './braintree-local-payment-methods/braintree-local-methods-options';
import BraintreeScriptLoader from './braintree-script-loader';
import isBraintreeError from './is-braintree-error';
import { PAYPAL_COMPONENTS } from './paypal';

export default class BraintreeIntegrationService {
    private client?: Promise<BraintreeClient>;
    private clientToken?: string;
    private dataCollectors: {
        default?: BraintreeDataCollector;
        paypal?: BraintreeDataCollector;
    } = {};
    private paypalCheckout?: BraintreePaypalCheckout;
    private usBankAccount?: Promise<BraintreeBankAccount>;
    private braintreeLocalMethods?: BraintreeLocalMethods;

    constructor(
        private braintreeScriptLoader: BraintreeScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    initialize(clientToken: string, initializationData: BraintreeInitializationData) {
        this.clientToken = clientToken;
        this.braintreeScriptLoader.initialize(initializationData);
    }

    async getClient(): Promise<BraintreeClient> {
        if (!this.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!this.client) {
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.client = clientCreator.create({ authorization: this.clientToken });
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
            this.braintreeLocalMethods = braintreeLocalMethods.create(
                {
                    client,
                    merchantAccountId,
                },
                (localPaymentErr: string, localPaymentInstance: LocalPaymentInstance) => {
                    if (localPaymentErr) {
                        throw new Error(localPaymentErr);
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

    async getDataCollector(options?: { paypal: boolean }): Promise<BraintreeDataCollector> {
        const cacheKey = options?.paypal ? 'paypal' : 'default';
        let cached = this.dataCollectors[cacheKey];

        if (!cached) {
            try {
                const client = await this.getClient();
                const dataCollector = await this.braintreeScriptLoader.loadDataCollector();

                cached = await dataCollector.create({ client, kount: true, ...options });
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

    async getSessionId(): Promise<string | undefined> {
        const { deviceData } = await this.getDataCollector();

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
}
