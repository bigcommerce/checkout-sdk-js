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

const PAYPAL_SDK_VERSION = '5.0.5';

export default class PayPalCommerceScriptLoader {
    private window: PayPalCommerceHostWindow;
    private paypalSdk?: PayPalSDK;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<PayPalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
    ): Promise<PayPalSDK> {
        if (!this.paypalSdk) {
            this.paypalSdk = await this.loadPayPalSDK(
                this.getPayPalSdkScriptConfigOrThrow(
                    paymentMethod,
                    currencyCode,
                    initializesOnCheckoutPage,
                ),
            );
        }

        return this.paypalSdk;
    }

    private async loadPayPalSDK(
        paypalSdkScriptConfig: PayPalCommerceScriptParams,
    ): Promise<PayPalSDK> {
        if (!this.window.paypalLoadScript) {
            const scriptSrc = `https://unpkg.com/@paypal/paypal-js@${PAYPAL_SDK_VERSION}/dist/iife/paypal-js.min.js`;

            await this.scriptLoader.loadScript(scriptSrc, { async: true, attributes: {} });

            if (!this.window.paypalLoadScript) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        await this.window.paypalLoadScript(paypalSdkScriptConfig);

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
            'client-id': clientId,
            'data-partner-attribution-id': attributionId,
            'data-client-token': clientToken,
            'merchant-id': merchantId,
            'enable-funding': enableFunding.length > 0 ? enableFunding : undefined,
            'disable-funding': disableFunding.length > 0 ? disableFunding : undefined,
            commit,
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields', 'legal'],
            currency: currencyCode,
            intent,
            ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
        };
    }
}
