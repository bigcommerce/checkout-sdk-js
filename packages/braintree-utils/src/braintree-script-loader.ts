import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethodClientUnavailableError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeIntegrityValues } from './braintree';
import {
    BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION,
    BRAINTREE_SDK_LATEST_STABLE_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './sdk-verison';
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

    // TODO: this method is needed only for braintree Fastlane, so can be removed after GA
    // TODO: this method should be moved to BraintreeSdk class in the future
    initialize(storeConfig?: StoreConfig) {
        const features = storeConfig?.checkoutSettings.features;
        const shouldUseBraintreeAlphaVersion =
            features && features['PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree'];
        const shouldUseLatestStableBraintreeSdkVersion =
            features && features['PAYPAL-4489.braintree_sdk_version_update'];

        if (shouldUseLatestStableBraintreeSdkVersion) {
            this.braintreeSdkVersion = BRAINTREE_SDK_LATEST_STABLE_VERSION;

            return;
        }

        this.braintreeSdkVersion = shouldUseBraintreeAlphaVersion
            ? BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION
            : BRAINTREE_SDK_STABLE_VERSION;
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
                        'sha384-5q9Kkv64ho8xutoRBtnaeRE1Ux47T6+LSRpsRmKrKSq7SiZOXn0Mv2XWXVQvCFJj',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-WFefLU7p2TWWSJ17dsTC2uZF0qylvIUEXI7ZaQiWiMPGHtvQlpjc53WirI93FZtv',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-e30b612e9d17ad8dc16187e4f65677de67d6d5fb5f2eba8686ecdb74e6f970014a99103376b9274b70f0360360832513',
                };

            case BraintreeModuleName.PaypalCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-sozUyB/9Y4TygM5npllDME7tGVRo9/4Fh1clHUiPI1F2Q922yyJsMtL5fcFtZHdT',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-M5Uymuf5O0lh9Dyu+4soyJzefD1uUsL3m3fakhOuIH6C/FXGvii+XHGSGwQwxeJJ',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-4feb9009e54d48afe671481c47de64051fdc20c62f7f9135d425406f9fed313fd40b8f6f003f038f2dff7cfa28f93e4b',
                };

            case BraintreeModuleName.Paypal:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-Kw2YNA/MLpnN7vkRO3LOCNB0ZrSgT0UZiucLokB06z+0591xAAWgcf9v8AKjCwCX',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-R9O45bWivOlvh5zNaZeRaL0Vie0i6RgNpcD+anBxCVV0Lasox0rsayskrWpOcckT',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-7eda4fc304d5bb39a79fdb8924273e66c6b777f6ab077f4a477963316c55cce27edc85de41535005456dec4f12eeec0b',
                };

            case BraintreeModuleName.LocalPayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-P4U+tVQc9ja0VB3w4O6kTlLtIsBPGgsnFQlEdMYVYlU5BF5QP1aoIUhbmLXi0ewT',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-76tfvCYa9NzY9D66qhNk0cwnecFNOIUw/G+uNE4AhOZ/+Nhej6Po/8zvoOElmE/1',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-2ee2de9739d61c20a49e2cfb11ffb1a8f999d74405b2439b8ebb920f038e68443cf181c3657ed065890a1fb380d4617c',
                };

            case BraintreeModuleName.DataCollector:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-MYeeYlFD7uDuhGi2ZmrRth4uLy52c+MmJhlrIeNsZCpstpX3qQJI389DB/a2137k',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-zpZXyctWw5HY7JwKnhbSRzkOnIkNv8hYoEEyMKkJnpoIT2BijSjiXkNxtSI6lig9',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-2082333372fd66d9fc3dbba97ea863a821c0950de440588b4f8b7477d8fd0ce5a276c6e4c5a59b6607eb3ebeb11c8e0e',
                };

            case BraintreeModuleName.UsBankAccount:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-fyOBNpf/tlxbtQsgTICLilgs48q2M8n7gHcsGlmDK945m3pGZzmOdoTKSihFxwEe',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-WwIPgRv2U5MDKNnHUhlvuwa4xOFjK0U6RfIk07n6QF5N9WX3q2qW1pdIfnEX0P8b',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-3ab70e117df51dd85a019c5b6af2f034aeaa035188c7981130794ccb96d37e27ef294676fbfcc1af2713e47eab838845',
                };

            case BraintreeModuleName.GooglePayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-4ePQT3gULIgtQDyvx+F4rXu9DcyWrOP1dxHCoCO8uESGC8BoDbPVAxDiugVawQjJ',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-p0G7HnR6D/f81mKyLqCkr9fEwbDWCwwK8lVZmaudReYXt7bGD3mVO0y9HFsZQhfQ',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-97207c3ec2daabc8d814024faca936c467b518750da983274c8f144ab6b92a00d4be85f19640acd53393c35ba1d859e3',
                };

            case BraintreeModuleName.ThreeDSecure:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-kBYpTT1+KcpIHYwnFE6XY3xQkdmazh9F4r9ufjh/cIFXAZFpP96XYNyW8PvHuiJ8',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-cs4wDHFa3sU5X2n8S/9qte1uPxRPy7Kp/KL14lYurOXbXxMZma0660Gfo0a6AUS1',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-77a644a565128cbdbbed48bc224f14cde3cd711cef0b02f7ffff3e0e670887abe69de5894e808dac5d03c28d2c4900df',
                };

            case BraintreeModuleName.VisaCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-XzzKn9jU+Lvx1tJscq9e+nMRNBybQnSgSTXn1/PS0v6JxOUQlgFIBjI9ER8CODFt',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-iMFvsiulnHPuXwzbm5r/DPdATPCPn6J4aVNyTheAvM3e5FLA1j/wZTCAYxM081cP',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-318cba171a3dca9da78d9a9e3b7a2816023768f400906ae4a252e582ac3e90a14f2cf04abe76ac7286dedb4e2ec318e4',
                };

            case BraintreeModuleName.Venmo:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-AfqcRXnzzimKHVeUXcJNlB6ti2rmN9UJaZrLFU21pj779Db0zIJtBMdVcwb64NEm',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-prmYZ8RvB+/Nuld/7DbA6VfQ+vgDVSwR2Bos6s2FPhoOWf4fYW+YnYA0j9G4bS5/',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-a4bee2af2b0ccd99f240840d815654ad3de5f8086bf01e4e72fc647709dce5d9832e5f4b2a9eba3225e2e0a745840cf8',
                };

            case BraintreeModuleName.HostedFields:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-7I4A3VPyzQnBGG7F2aiC9We5tN3Py+cYyPWoqiQJaXCEIVLX2goBaku2lGhZXpyK',
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-0gdeYixIb/qimY4JRVwaybygpjWS7O4NtcwQPEJwFhx0nGBKE+NxbkQXOiTXY5QY',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-677e0351d88744239fa176fee6d8d1bf435d47773e9997f9852f21db277965f57426f83a00dc3020be45a972a27177ac',
                };

            case BraintreeModuleName.Fastlane:
                return {
                    [BRAINTREE_SDK_FASTLANE_COMPATIBLE_VERSION]:
                        'sha384-Ca2r1xkeRMuYnf7qxF1rf9RrxNNYv/yqkVNZJ8f3CX6vwiagJNl7L65/3zWyu2hH',
                    [BRAINTREE_SDK_LATEST_STABLE_VERSION]:
                        'sha384-962443bfd43a6491be8da73601554c48701edf02e0b021b430d7b2e58065a7af36f7755e063f433096c87a5545ef44dc',
                };

            default:
                throw new Error('Unexpected fileName value');
        }
    }
}
