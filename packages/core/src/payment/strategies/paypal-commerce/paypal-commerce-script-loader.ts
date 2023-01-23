import { ScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';

import {
    FundingType,
    PaypalCommerceHostWindow,
    PaypalCommerceInitializationData,
    PaypalCommerceScriptParams,
    PaypalCommerceSDK,
} from './paypal-commerce-sdk';

export default class PaypalCommerceScriptLoader {
    private _window: PaypalCommerceHostWindow;
    private _paypalSdk?: Promise<PaypalCommerceSDK>;

    constructor(private _scriptLoader: ScriptLoader) {
        this._window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<PaypalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
    ): Promise<PaypalCommerceSDK> {
        if (!this._paypalSdk) {
            this._paypalSdk = this.loadPayPalSDK(
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
        paypalSdkScriptConfig: PaypalCommerceScriptParams,
    ): Promise<PaypalCommerceSDK> {
        if (!this._window.paypalLoadScript) {
            const PAYPAL_SDK_VERSION = '5.0.5';
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
        paymentMethod: PaymentMethod<PaypalCommerceInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
    ): PaypalCommerceScriptParams {
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

        const shouldEnableAPMs = !shouldShowInlineCheckout && !isHostedCheckoutEnabled; // should disable APMs if Inline Checkout or Shipping Options feature enabled
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
            'buyer-country': 'DE',
            locale: 'de_DE',
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
