import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethodClientUnavailableError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeIntegrityValues } from './braintree';
import { BRAINTREE_SDK_LATEST_STABLE_VERSION, BRAINTREE_SDK_STABLE_VERSION } from './sdk-verison';
import {
    BraintreeClientCreator,
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
import { VisaCheckoutSDK } from './visacheckout';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion: keyof BraintreeIntegrityValues = BRAINTREE_SDK_STABLE_VERSION;

    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    // TODO: this method should be moved to BraintreeSdk class in the future
    initialize(storeConfig?: StoreConfig) {
        const features = storeConfig?.checkoutSettings.features;
        const shouldUseStableBraintreeSdkVersion =
            features && features['PAYPAL-4489.braintree_sdk_version_update'];

        this.braintreeSdkVersion = shouldUseStableBraintreeSdkVersion
            ? BRAINTREE_SDK_STABLE_VERSION
            : BRAINTREE_SDK_LATEST_STABLE_VERSION;
    }

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

    async loadBraintreeLocalMethods(): Promise<BraintreeLocalPaymentCreator> {
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

    async loadGooglePayment(): Promise<GooglePayCreator> {
        return this.loadBraintreeModuleOrThrow<GooglePayCreator>(
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

        const scriptPath = `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/${fileName}`;

        const hash =
            this.getIntegrityValuesByModuleName(braintreeModuleName)[this.braintreeSdkVersion];

        await this.scriptLoader.loadScript(
            scriptPath,
            hash
                ? {
                      async: true,
                      attributes: {
                          integrity: hash,
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
    ): BraintreeIntegrityValues {
        switch (moduleName) {
            case BraintreeModuleName.Client:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-3yDEuTgH/1oa552vNZ1Z9Z0UnaOsDuHatxP1RmgpdD8/ecN3YMcikbI1DM6QQVHv',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-26BXDNnJI23JYRyFBj4xe4sVNrUSSiSSu11kxVXNM/vEPONm4LuL00w6ZaTgQewt',
                };

            case BraintreeModuleName.PaypalCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-kjA0K5UAS3wbxKm4CoMez5lxIYvzCQ+t/xtk0QiVIBIAhbXbV2YlWfr8uHJSY+tV',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-B+vzbZwnQtzWBthpkT4TXKUibO65tyeK7eCxSvpblgprTep2+IAXB2Cxxjrn710O',
                };

            case BraintreeModuleName.Paypal:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-HQ2o1BVFyVrkOzwU5aiPfSIa3ZhtHabNmBVf44kuw/+spM1L/6p7NbZXq4U5y4db',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-uyAGL1/3+XJAHnGoNy4eCoXdzJ4f7Ilzp+6w9PNnEjs6DCCz9WMyJjMN1gzc78U+',
                };

            case BraintreeModuleName.LocalPayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-/qKkzoquZWHgtiDkGqoBqyTMvVJd58HFDo+6iH/wLfKPE6M4aUIr9XG/eReN0a0H',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-LIvOEMkIVEwVuYBdVOQc1AC5YbGGlwyfUheS0ACK218D2STuVYQlZ4FyEPowAEfT',
                };

            case BraintreeModuleName.DataCollector:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-LHGVkS5dEY+LZmubY35YxkuLcNa5Ltw4vZOfCeRmVsCGQMjsvqdxZo4fBXNwf8fI',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-1bo9JDz+Kscthc085cCKWur8CLwUoBpoNyxsDi7932mCl0zFq3A5mv+FQLw9GHpV',
                };

            case BraintreeModuleName.UsBankAccount:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-F0KhPrZch56ryHzj0pyATKh49EtjJcnx7uaJRajLCcwVum/v1fP1kgGKG1P+MV/R',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-xmHBVaU+w74V+OebD3AaPONFxHUGMf+QRs8G/JxVPXNNP7MDa2jL0ICWHIe2tTfJ',
                };

            case BraintreeModuleName.GooglePayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-VdxBDsfslfvtDeGPAsXn88I9d2JmBCpdwrFaFO3+TiMA8j4/a4HU+BcviiXAptNV',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-WKDJl8mqoP82qZpMGH6AbZxnvXnSW8ILV4M64CyMLiugGMwu7LyP89wjCkHqsiBe',
                };

            case BraintreeModuleName.ThreeDSecure:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-nMqWo4zVYzGRrIh05fZ2bDOygNZVPHGlltJXuXoNw5WTPh8mUG9uCp7aBqtmm/e/',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-VQUlpGHzsGvs5XeiGFip7EXRsvoHWEXDVmgCacfbyieZI9mdBOqq3NSoyo28OCOB',
                };

            case BraintreeModuleName.VisaCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-WMsHC0Xqz6BN+fUfCghOBd9U0ZkrXDafAq1IZapnh1Z4iWtY86zJlG08lCaB4xF6',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-yx7mADfzTN0T43Q6rlH49LIg1EJ0iUZgBp/EczX9LXsUGkySgxrD+nWHQRBkyfoT',
                };

            case BraintreeModuleName.Venmo:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-d76HNGG5/6M30cuphYSP4hiRYVyFckvx/GV6Lc4u52JUxnJKPNAaGVXntJKHxVWX',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-QX4rPjoj1ZDhuG0aSyKs56lEKDqTMTcjYxUHY1SzO5VZDsqIE2NTkqot7KNSCyov',
                };

            case BraintreeModuleName.HostedFields:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-a87dK5DmKr/rtH//0rV44/rzz9Kl6AvNp5mMy8IYonT/f0ik5bUtX8bl/qeGOaSx',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-VvYBACfSu0Cr/J32uKmxG7AXcNOJE1AzIIL3kbikyS7YKp5fz5Is+NzNP/lyauNy',
                };

            case BraintreeModuleName.Fastlane:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-MunHz5V8FY0J9AOHGkmEjphvIKAI4WokwrT6w/NP9mwfBHhcq3LmDi7q1tIe1Aqk',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-9oGsZMRZwpGtDEDYa/dFt76dECqj1xAni9gIKgc3KfMIiRnR73nEeeUDLiBzxhFa',
                };

            default:
                throw new Error('Unexpected fileName value');
        }
    }
}
