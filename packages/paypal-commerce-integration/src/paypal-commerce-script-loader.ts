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
    private _window: PayPalCommerceHostWindow;
    private _paypalSdk?: PayPalSDK;

    constructor(private _scriptLoader: ScriptLoader) {
        this._window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<PayPalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
    ): Promise<PayPalSDK> {
        if (!this._paypalSdk) {
            this._paypalSdk = await this.loadPayPalSDK(
                this._getPayPalSdkScriptConfigOrThrow(
                    paymentMethod,
                    currencyCode,
                    initializesOnCheckoutPage,
                ),
            );
        }

        return this._paypalSdk;
    }

    private async loadPayPalSDK(
        paypalSdkScriptConfig: PayPalCommerceScriptParams,
    ): Promise<PayPalSDK> {
        if (!this._window.paypalLoadScript) {
            const scriptSrc = `https://unpkg.com/@paypal/paypal-js@${PAYPAL_SDK_VERSION}/dist/iife/paypal-js.min.js`;

            await this._scriptLoader.loadScript(scriptSrc, { async: true, attributes: {} });

            if (!this._window.paypalLoadScript) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        await this._window.paypalLoadScript(paypalSdkScriptConfig);

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }

    private _getPayPalSdkScriptConfigOrThrow(
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
            attributionId,
            isVenmoEnabled,
            isHostedCheckoutEnabled,
            isInlineCheckoutEnabled,
            isPayPalCreditAvailable,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
        } = initializationData;

        const shouldShowInlineCheckout = !initializesOnCheckoutPage && isInlineCheckoutEnabled;

        const commit =
            shouldShowInlineCheckout || isHostedCheckoutEnabled || initializesOnCheckoutPage;

        const shouldEnableCard = shouldShowInlineCheckout || id === 'paypalcommercecreditcards';
        const enableCardFunding = shouldEnableCard ? ['card'] : [];
        const disableCardFunding = !shouldEnableCard ? ['card'] : [];

        const enableCreditFunding = isPayPalCreditAvailable ? ['credit', 'paylater'] : [];
        const disableCreditFunding = !isPayPalCreditAvailable ? ['credit', 'paylater'] : [];

        const shouldEnableAPMs = !shouldShowInlineCheckout && !isHostedCheckoutEnabled; // should disable APMs if Inline (Accelerated) Checkout or Shipping Options feature is enabled
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
            components: ['buttons', 'hosted-fields', 'messages', 'payment-fields'],
            currency: currencyCode,
            intent,
        };
    }
}
