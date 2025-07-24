import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BRAINTREE_SDK_SCRIPTS_INTEGRITY } from './braintree-sdk-scripts-integrity';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';
import {
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeFastlaneCreator,
    BraintreeGooglePaymentCreator,
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
} from './types';
import { VisaCheckoutSDK } from './visacheckout';

export default class BraintreeScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
        private braintreeSDKVersionManager: BraintreeSDKVersionManager,
    ) {}

    async loadClient(): Promise<BraintreeClientCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeClientCreator>(
            BraintreeModuleName.Client,
            'client.min.js',
        );
    }

    async loadFastlane(): Promise<BraintreeFastlaneCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeFastlaneCreator>(
            BraintreeModuleName.Fastlane,
            'fastlane.min.js',
        );
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreePaypalCheckoutCreator>(
            BraintreeModuleName.PaypalCheckout,
            'paypal-checkout.min.js',
        );
    }

    async loadPaypal(): Promise<BraintreePaypalCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreePaypalCreator>(
            BraintreeModuleName.Paypal,
            'paypal.min.js',
        );
    }

    async loadLocalPayment(): Promise<BraintreeLocalPaymentCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeLocalPaymentCreator>(
            BraintreeModuleName.LocalPayment,
            'local-payment.min.js',
        );
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeDataCollectorCreator>(
            BraintreeModuleName.DataCollector,
            'data-collector.min.js',
        );
    }

    async loadUsBankAccount(): Promise<BraintreeUsBankAccountCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeUsBankAccountCreator>(
            BraintreeModuleName.UsBankAccount,
            'us-bank-account.min.js',
        );
    }

    async loadGooglePayment(): Promise<BraintreeGooglePaymentCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeGooglePaymentCreator>(
            BraintreeModuleName.GooglePayment,
            'google-payment.min.js',
        );
    }

    async load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeThreeDSecureCreator>(
            BraintreeModuleName.ThreeDSecure,
            'three-d-secure.min.js',
        );
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeVisaCheckoutCreator>(
            BraintreeModuleName.VisaCheckout,
            'visa-checkout.min.js',
        );
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeVenmoCheckoutCreator>(
            BraintreeModuleName.Venmo,
            'venmo.min.js',
        );
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        return this.loadBraintreeModuleOrThrow<BraintreeHostedFieldsCreator>(
            BraintreeModuleName.HostedFields,
            'hosted-fields.min.js',
        );
    }

    async loadVisaCheckoutSdk(testMode?: boolean): Promise<VisaCheckoutSDK> {
        if (this.braintreeHostWindow.V) {
            return this.braintreeHostWindow.V;
        }

        const hash = testMode
            ? 'sha384-0eu1s1GtqzXlL9DtLgmwzC5WWlEH/ADRM0n38cVQkvtT+W/gey96rcb1LwuUOPDm'
            : 'sha384-1f1csvP3ZFxg4dILH1GaY4LHlZ0oX7Rk83rxmLlwbnIi4TM0NYzXoev1VoEiVDS6';

        return this.scriptLoader
            .loadScript(
                `//${
                    testMode ? 'sandbox-' : ''
                }assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js`,
                {
                    async: true,
                    attributes: {
                        integrity: hash,
                        crossorigin: 'anonymous',
                    },
                },
            )
            .then(() => {
                if (!this.braintreeHostWindow.V) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this.braintreeHostWindow.V;
            });
    }

    private async loadBraintreeModuleOrThrow<T extends BraintreeModuleCreators>(
        braintreeModuleName: BraintreeModuleName,
        fileName: string,
    ): Promise<T> {
        let module = this.getBraintreeModule(braintreeModuleName);

        if (module) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return module as T;
        }

        const braintreeSdkVersion = this.braintreeSDKVersionManager.getSDKVersion();

        const scriptPath = `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/${fileName}`;

        const integrity = this.getIntegrityValuesByModuleName(
            braintreeModuleName,
            braintreeSdkVersion,
        );

        await this.scriptLoader.loadScript(
            scriptPath,
            integrity
                ? {
                      async: true,
                      attributes: {
                          integrity,
                          crossorigin: 'anonymous',
                      },
                  }
                : undefined,
        );

        module = this.getBraintreeModule(braintreeModuleName);

        if (!module) {
            throw new PaymentMethodClientUnavailableError();
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return module as T;
    }

    private getBraintreeModule(
        braintreeModuleName: BraintreeModuleName,
    ): BraintreeModuleCreators | undefined {
        return this.braintreeHostWindow.braintree?.[braintreeModuleName];
    }

    private getIntegrityValuesByModuleName(
        moduleName: BraintreeModuleName,
        version: keyof typeof BRAINTREE_SDK_SCRIPTS_INTEGRITY,
    ): string {
        const integrity = BRAINTREE_SDK_SCRIPTS_INTEGRITY[version][moduleName];

        if (!integrity) {
            throw new Error('Unexpected fileName value');
        }

        return integrity;
    }
}
