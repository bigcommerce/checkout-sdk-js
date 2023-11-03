import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    FundingType,
    PayPalCommerceHostWindow,
    PayPalCommerceInitializationData,
    PayPalCommerceScriptParams,
    PayPalSDK,
} from './paypal-commerce-types';

export default class PayPalCommerceScriptLoader {
    private window: PayPalCommerceHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<PayPalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalSDK> {
        const paypalSdkScriptConfig = this.getPayPalSdkScriptConfigOrThrow(
            paymentMethod,
            currencyCode,
            initializesOnCheckoutPage,
        );

        return this.loadPayPalSDK(paypalSdkScriptConfig, forceLoad);
    }

    private async loadPayPalSDK(
        paypalSdkScriptConfig: PayPalCommerceScriptParams,
        forceLoad = false,
    ): Promise<PayPalSDK> {
        if (!this.window.paypal || forceLoad) {
            const options = this.transformConfig<PayPalCommerceScriptParams['options']>(
                paypalSdkScriptConfig.options,
            );
            const attributes = this.transformConfig<PayPalCommerceScriptParams['attributes']>(
                paypalSdkScriptConfig.attributes,
            );

            const paypalSdkUrl = 'https://www.paypal.com/sdk/js';
            const scriptQuery = new URLSearchParams(options).toString();
            const scriptSrc = `${paypalSdkUrl}?${scriptQuery}`;

            await this.scriptLoader.loadScript(scriptSrc, { async: true, attributes });
        }

        if (!this.window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypal;
    }

    private getPayPalSdkScriptConfigOrThrow(
        paymentMethod: PaymentMethod<PayPalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
    ): PayPalCommerceScriptParams {
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
            isPayPalCreditAvailable,
            isDeveloperModeApplicable,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
        } = initializationData;

        const commit = isHostedCheckoutEnabled || initializesOnCheckoutPage;

        const shouldEnableCard = id === 'paypalcommercecreditcards';
        const enableCardFunding = shouldEnableCard ? ['card'] : [];
        const disableCardFunding = !shouldEnableCard ? ['card'] : [];

        const enableCreditFunding = isPayPalCreditAvailable ? ['credit', 'paylater'] : [];
        const disableCreditFunding = !isPayPalCreditAvailable ? ['credit', 'paylater'] : [];

        const shouldEnableAPMs = initializesOnCheckoutPage || !commit;
        const enableVenmoFunding = shouldEnableAPMs && isVenmoEnabled ? ['venmo'] : [];
        const disableVenmoFunding = !shouldEnableAPMs || !isVenmoEnabled ? ['venmo'] : [];
        const enableAPMsFunding = shouldEnableAPMs ? enabledAlternativePaymentMethods : [];
        const disableAPMsFunding = shouldEnableAPMs
            ? availableAlternativePaymentMethods.filter(
                  (apm: string) => !enabledAlternativePaymentMethods.includes(apm),
              )
            : availableAlternativePaymentMethods;

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
                components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
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
