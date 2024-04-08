import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethodClientUnavailableError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BRAINTREE_SDK_ALPHA_VERSION, BRAINTREE_SDK_STABLE_VERSION } from './sdk-verison';
import {
    BraintreeClientCreator,
    BraintreeConnectCreator,
    BraintreeDataCollectorCreator,
    BraintreeFastlaneCreator,
    BraintreeHostedFieldsCreator,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreeModuleCreators,
    BraintreeModuleName,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeUsBankAccountCreator,
    BraintreeVenmoCheckoutCreator,
    BraintreeVisaCheckoutCreator,
    GooglePayCreator,
} from './types';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion = BRAINTREE_SDK_STABLE_VERSION;

    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    // TODO: this method is needed only for braintree Fastlane, so can be removed after Beta state
    // TODO: this method should be moved to BraintreeSdk class in the future
    initialize(storeConfig?: StoreConfig) {
        const features = storeConfig?.checkoutSettings.features;
        const shouldUseBraintreeAlphaVersion =
            features && features['PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree'];

        this.braintreeSdkVersion = shouldUseBraintreeAlphaVersion
            ? BRAINTREE_SDK_ALPHA_VERSION
            : BRAINTREE_SDK_STABLE_VERSION;
    }

    async loadClient(): Promise<BraintreeClientCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeClientCreator>(
            BraintreeModuleName.client,
            'client.min.js',
        );
    }

    async loadConnect(): Promise<BraintreeConnectCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeConnectCreator>(
            BraintreeModuleName.connect,
            'connect.min.js',
        );
    }

    async loadFastlane(): Promise<BraintreeFastlaneCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeFastlaneCreator>(
            BraintreeModuleName.fastlane,
            'fastlane.min.js',
        );
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreePaypalCheckoutCreator>(
            BraintreeModuleName.paypalCheckout,
            'paypal-checkout.min.js',
        );
    }

    async loadPaypal(): Promise<BraintreePaypalCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreePaypalCreator>(
            BraintreeModuleName.paypal,
            'paypal.min.js',
        );
    }

    async loadBraintreeLocalMethods(): Promise<BraintreeLocalPaymentCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeLocalPaymentCreator>(
            BraintreeModuleName.localPayment,
            'local-payment.min.js',
        );
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeDataCollectorCreator>(
            BraintreeModuleName.dataCollector,
            'data-collector.min.js',
        );
    }

    async loadUsBankAccount(): Promise<BraintreeUsBankAccountCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeUsBankAccountCreator>(
            BraintreeModuleName.usBankAccount,
            'us-bank-account.min.js',
        );
    }

    async loadGooglePayment(): Promise<GooglePayCreator> {
        return this.loadBraintreeModuleOrThrow<GooglePayCreator>(
            BraintreeModuleName.googlePayment,
            'google-payment.min.js',
        );
    }

    async load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeThreeDSecureCreator>(
            BraintreeModuleName.threeDSecure,
            'three-d-secure.min.js',
        );
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeVisaCheckoutCreator>(
            BraintreeModuleName.visaCheckout,
            'visa-checkout.min.js',
        );
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeVenmoCheckoutCreator>(
            BraintreeModuleName.venmo,
            'venmo.min.js',
        );
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeHostedFieldsCreator>(
            BraintreeModuleName.hostedFields,
            'hosted-fields.min.js',
        );
    }

    private async loadBraintreeModuleOrThrow<T extends BraintreeModuleCreators>(
        braintreeModuleName: BraintreeModuleName,
        fileName: string,
    ): Promise<T> {
        const scriptPath = `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/${fileName}`;

        await this.scriptLoader.loadScript(scriptPath);

        const braintreeModule = this.braintreeHostWindow.braintree?.[braintreeModuleName];

        if (!braintreeModule) {
            throw new PaymentMethodClientUnavailableError();
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return braintreeModule as T;
    }
}
