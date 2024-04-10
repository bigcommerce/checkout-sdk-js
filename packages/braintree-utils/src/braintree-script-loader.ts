import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethodClientUnavailableError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeIntegrityValues, BraintreeSdkFileName } from './braintree';
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
    private braintreeSdkVersion: keyof BraintreeIntegrityValues = BRAINTREE_SDK_STABLE_VERSION;

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
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.Client)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeClientCreator>(
            BraintreeModuleName.Client,
            BraintreeSdkFileName.Client,
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
    }

    async loadConnect(): Promise<BraintreeConnectCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.Connect)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeConnectCreator>(
            BraintreeModuleName.Connect,
            BraintreeSdkFileName.Connect,
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
    }

    async loadFastlane(): Promise<BraintreeFastlaneCreator> {
        // Info: fastlane.min.js does not have Access-Control-Allow-Origin: * or not found
        return this.loadBraintreeModuleOrThrow<BraintreeFastlaneCreator>(
            BraintreeModuleName.Fastlane,
            BraintreeSdkFileName.FastLine,
        );
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.PaypalCheckout)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreePaypalCheckoutCreator>(
            BraintreeModuleName.PaypalCheckout,
            BraintreeSdkFileName.PaypalCheckout,
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
    }

    async loadPaypal(): Promise<BraintreePaypalCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.Paypal)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreePaypalCreator>(
            BraintreeModuleName.Paypal,
            BraintreeSdkFileName.Paypal,
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
    }

    async loadBraintreeLocalMethods(): Promise<BraintreeLocalPaymentCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.LocalPayment)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeLocalPaymentCreator>(
            BraintreeModuleName.LocalPayment,
            BraintreeSdkFileName.LocalPayment,
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
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.DataCollector)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeDataCollectorCreator>(
            BraintreeModuleName.DataCollector,
            BraintreeSdkFileName.DataCollector,
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
    }

    async loadUsBankAccount(): Promise<BraintreeUsBankAccountCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.UsBankAccount)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeUsBankAccountCreator>(
            BraintreeModuleName.UsBankAccount,
            BraintreeSdkFileName.UsBankAccount,
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
    }

    async loadGooglePayment(): Promise<GooglePayCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.GooglePayment)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<GooglePayCreator>(
            BraintreeModuleName.GooglePayment,
            BraintreeSdkFileName.GooglePayment,
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
    }

    async load3DS(): Promise<BraintreeThreeDSecureCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.ThreeDSecure)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeThreeDSecureCreator>(
            BraintreeModuleName.ThreeDSecure,
            BraintreeSdkFileName.ThreeDSecure,
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
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.VisaCheckout)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeVisaCheckoutCreator>(
            BraintreeModuleName.VisaCheckout,
            BraintreeSdkFileName.VisaCheckout,
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
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.Venmo)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeVenmoCheckoutCreator>(
            BraintreeModuleName.Venmo,
            BraintreeSdkFileName.Venmo,
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
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        const hash = this.getIntegrityValuesByFileName(BraintreeSdkFileName.HostedFields)[
            this.braintreeSdkVersion
        ];

        return this.loadBraintreeModuleOrThrow<BraintreeHostedFieldsCreator>(
            BraintreeModuleName.HostedFields,
            BraintreeSdkFileName.HostedFields,
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
    }

    private async loadBraintreeModuleOrThrow<T extends BraintreeModuleCreators>(
        braintreeModuleName: BraintreeModuleName,
        fileName: string,
        options?: LoadScriptOptions,
    ): Promise<T> {
        const scriptPath = `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/${fileName}`;

        await this.scriptLoader.loadScript(scriptPath, options);

        const braintreeModule = this.braintreeHostWindow.braintree?.[braintreeModuleName];

        if (!braintreeModule) {
            throw new PaymentMethodClientUnavailableError();
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return braintreeModule as T;
    }

    private getIntegrityValuesByFileName(fileName: string): BraintreeIntegrityValues {
        switch (fileName) {
            case BraintreeSdkFileName.Client:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-5q9Kkv64ho8xutoRBtnaeRE1Ux47T6+LSRpsRmKrKSq7SiZOXn0Mv2XWXVQvCFJj',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-cpfxkJc2j2IgFLlXdJEhNVkCief/ezpYjc3d/QC7psgcdB7AZRZVSCWBrWHJd8kV',
                };

            case BraintreeSdkFileName.Connect:
                return {
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-F/Vm+lvAqbrFfTjVSXul1yeJablUdRQXoGSpXX5ub24OKFeMuITbFiY1TTK1QlxY',
                };

            case BraintreeSdkFileName.PaypalCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-sozUyB/9Y4TygM5npllDME7tGVRo9/4Fh1clHUiPI1F2Q922yyJsMtL5fcFtZHdT',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-b/Bkr377Yi/i9fGXP9adBSYC+Z2//ruSfUlkIni9AjL/YFeu/ygqtgYyJdAEAsr7',
                };

            case BraintreeSdkFileName.Paypal:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-Kw2YNA/MLpnN7vkRO3LOCNB0ZrSgT0UZiucLokB06z+0591xAAWgcf9v8AKjCwCX',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-2T9Nx2wNbrtrj7SFleQU/i/trUmvBvf3Lmj/enmh9KESjit397Vaaps6EkI18MGt',
                };

            case BraintreeSdkFileName.LocalPayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-P4U+tVQc9ja0VB3w4O6kTlLtIsBPGgsnFQlEdMYVYlU5BF5QP1aoIUhbmLXi0ewT',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-ARWRFedVLKaSGVUD0YTsHxkzRZ/Cc2BD994a3NqnXoCP+iRM7XeRs1ulS4E+i9ts',
                };

            case BraintreeSdkFileName.DataCollector:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-MYeeYlFD7uDuhGi2ZmrRth4uLy52c+MmJhlrIeNsZCpstpX3qQJI389DB/a2137k',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-L12Sd8K1LbH+gXLvRG54pH+vdCJUnpepjTb6qG2HiD8NvJYLZS/VjJ671OCXr5Vz',
                };

            case BraintreeSdkFileName.UsBankAccount:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-fyOBNpf/tlxbtQsgTICLilgs48q2M8n7gHcsGlmDK945m3pGZzmOdoTKSihFxwEe',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-mBAnHTYdpowjxBu8uRyjsdzDxTLpoZohyMvINZYEV3OyonbtFIjB9/k1k4A2vWrC',
                };

            case BraintreeSdkFileName.GooglePayment:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-4ePQT3gULIgtQDyvx+F4rXu9DcyWrOP1dxHCoCO8uESGC8BoDbPVAxDiugVawQjJ',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-OL0G9k2ShrnVAtkmS4Q4Fg7SHi5IxM6B8dgB8GDn1kIcl8rYoGG+FPjrLvfxJO++',
                };

            case BraintreeSdkFileName.ThreeDSecure:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-kBYpTT1+KcpIHYwnFE6XY3xQkdmazh9F4r9ufjh/cIFXAZFpP96XYNyW8PvHuiJ8',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-ashYIRvaw82mbN1eOd7B43a0La3ngECGkjMK6qbr7UNYb613xBJipfWnNHahDEj6',
                };

            case BraintreeSdkFileName.VisaCheckout:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-XzzKn9jU+Lvx1tJscq9e+nMRNBybQnSgSTXn1/PS0v6JxOUQlgFIBjI9ER8CODFt',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-YUiwmkaPgw7G/n4k2XVoNjsAtn2J+m8cA5oPhGH7y/o90302cwzLiFS23bNAw1e0',
                };

            case BraintreeSdkFileName.Venmo:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-AfqcRXnzzimKHVeUXcJNlB6ti2rmN9UJaZrLFU21pj779Db0zIJtBMdVcwb64NEm',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-CXsbLYSCKdOjrs8CILcaOLBkdI/d7jWlym/+lnzbda8MS/X58DCHrskKp7mPaDxG',
                };

            case BraintreeSdkFileName.HostedFields:
                return {
                    [BRAINTREE_SDK_STABLE_VERSION]:
                        'sha384-7I4A3VPyzQnBGG7F2aiC9We5tN3Py+cYyPWoqiQJaXCEIVLX2goBaku2lGhZXpyK',
                    [BRAINTREE_SDK_ALPHA_VERSION]:
                        'sha384-5l3JvGSYH74qGQJB8IlsrUAqeqrH58vkIkxJoW+LH7O99z4Np2BceIcFvZ46QGld',
                };

            default:
                throw new Error('Unexpected fileName value');
        }
    }
}
