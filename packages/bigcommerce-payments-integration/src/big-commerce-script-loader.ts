import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommerceHostWindow,
    BigCommerceInitializationData,
    BigCommerceScriptParams,
    BigCommerceSDK,
    ComponentsScriptType,
    FundingType,
} from './big-commerce-types';

export default class BigCommerceScriptLoader {
    private window: BigCommerceHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getBigCommerceSDK(
        paymentMethod: PaymentMethod<BigCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<BigCommerceSDK> {
        const bigCommerceSdkScriptConfig = this.getBigCommerceSdkScriptConfigOrThrow(
            paymentMethod,
            currencyCode,
            initializesOnCheckoutPage,
        );

        return this.loadBigCommerceSDK(bigCommerceSdkScriptConfig, forceLoad);
    }

    private async loadBigCommerceSDK(
        bigCommerceSdkScriptConfig: BigCommerceScriptParams,
        forceLoad = false,
    ): Promise<BigCommerceSDK> {
        if (!this.window.bigcommerce || forceLoad) {
            const options = this.transformConfig<BigCommerceScriptParams['options']>(
                bigCommerceSdkScriptConfig.options,
            );
            const attributes = this.transformConfig<BigCommerceScriptParams['attributes']>(
                bigCommerceSdkScriptConfig.attributes,
            );

            const paypalSdkUrl = 'https://www.paypal.com/sdk/js'; // paypal method remains the same
            const scriptQuery = new URLSearchParams(options).toString();
            const scriptSrc = `${paypalSdkUrl}?${scriptQuery}`;

            await this.scriptLoader.loadScript(scriptSrc, { async: true, attributes });
        }

        if (!this.window.bigcommerce) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.bigcommerce;
    }

    private getBigCommerceSdkScriptConfigOrThrow(
        paymentMethod: PaymentMethod<BigCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
    ): BigCommerceScriptParams {
        const { id, clientToken, initializationData } = paymentMethod;

        if (!initializationData?.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            intent,
            clientId,
            merchantId,
            buyerCountry,
            attributionId,
            isVenmoEnabled,
            isHostedCheckoutEnabled,
            isBigCommerceCreditAvailable,
            isDeveloperModeApplicable,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
            isGooglePayEnabled,
        } = initializationData;

        const commit = isHostedCheckoutEnabled || initializesOnCheckoutPage;

        const shouldEnableCard = id === 'bigcommerce_payments_creditcard';
        const enableCardFunding = shouldEnableCard ? ['card'] : [];
        const disableCardFunding = !shouldEnableCard ? ['card'] : [];

        const enableCreditFunding = isBigCommerceCreditAvailable ? ['credit', 'paylater'] : [];
        const disableCreditFunding = !isBigCommerceCreditAvailable ? ['credit', 'paylater'] : [];

        const shouldEnableAPMs = initializesOnCheckoutPage || !commit;
        const enableVenmoFunding = isVenmoEnabled ? ['venmo'] : [];
        const disableVenmoFunding = !isVenmoEnabled ? ['venmo'] : [];
        const enableAPMsFunding = shouldEnableAPMs ? enabledAlternativePaymentMethods : [];
        const disableAPMsFunding = shouldEnableAPMs
            ? availableAlternativePaymentMethods.filter(
                  (apm: string) => !enabledAlternativePaymentMethods.includes(apm),
              )
            : availableAlternativePaymentMethods;
        const googlePayComponent: ComponentsScriptType = isGooglePayEnabled ? ['googlepay'] : [];
        const cardFieldsComponent: ComponentsScriptType = initializesOnCheckoutPage
            ? ['card-fields']
            : [];
        const disableFunding: FundingType = [
            ...disableCardFunding,
            ...disableCreditFunding,
            ...disableVenmoFunding,
            ...disableAPMsFunding,
        ];
        const enableFunding: FundingType = [
            ...enableCardFunding,
            ...enableCreditFunding,
            ...enableVenmoFunding,
            ...enableAPMsFunding,
        ];

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                'enable-funding': enableFunding.length > 0 ? enableFunding : undefined,
                'disable-funding': disableFunding.length > 0 ? disableFunding : undefined,
                commit,
                components: [
                    'buttons',
                    'hosted-fields',
                    'payment-fields',
                    'legal',
                    ...googlePayComponent,
                    ...cardFieldsComponent,
                ],
                currency: currencyCode,
                intent,
                ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
            },
            attributes: {
                'data-partner-attribution-id': attributionId,
                'data-client-token': clientToken,
            },
        };
    }

    private transformConfig<T extends Record<string, unknown>>(config: T): Record<string, string> {
        let transformedConfig = {};

        const keys = Object.keys(config) as Array<keyof T>;

        keys.forEach((key) => {
            const value = config[key];

            if (
                value === undefined ||
                value === null ||
                value === '' ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return;
            }

            transformedConfig = {
                ...transformedConfig,
                [key]: Array.isArray(value) ? value.join(',') : value,
            };
        });

        return transformedConfig;
    }
}
