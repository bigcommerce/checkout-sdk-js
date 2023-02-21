import { round } from 'lodash';

import { PaymentMethod } from '../..';
import { Checkout } from '../../../checkout';

import {
    BillingAddressFormat,
    GooglePayInitializer,
    GooglePaymentData,
    GooglePayPaymentDataRequestV2,
    TokenizationSpecification,
    TokenizePayload,
} from './googlepay';

const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
};

export default class GooglePayAuthorizeNetInitializer implements GooglePayInitializer {
    initialize(
        checkout: Checkout | undefined,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean,
    ): Promise<GooglePayPaymentDataRequestV2> {
        return Promise.resolve(
            this._getGooglePaymentDataRequest(checkout, paymentMethod, hasShippingAddress),
        );
    }

    teardown(): Promise<void> {
        return Promise.resolve();
    }

    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        const {
            paymentMethodData: {
                type,
                tokenizationData: { token },
                info: { cardNetwork: cardType, cardDetails: lastFour },
            },
        } = paymentData;

        return Promise.resolve({
            type,
            nonce: btoa(token),
            details: {
                cardType,
                lastFour,
            },
        });
    }

    private _getGooglePaymentDataRequest(
        checkout: Checkout | undefined,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean,
    ): GooglePayPaymentDataRequestV2 {
        const currencyCode = checkout?.cart.currency.code || '';
        const totalPrice = checkout?.outstandingBalance
            ? round(checkout.outstandingBalance, 2).toFixed(2)
            : '';

        const {
            initializationData: {
                paymentGatewayId: gatewayMerchantId,
                storeCountry: countryCode,
                googleMerchantName: merchantName,
                googleMerchantId: merchantId,
                platformToken: authJwt,
            },
            supportedCards,
        } = paymentMethod;

        const paymentGatewaySpecification = this._getPaymentGatewaySpecification(gatewayMerchantId);
        const cardPaymentMethod = this._getCardPaymentMethod(
            paymentGatewaySpecification,
            supportedCards,
        );

        return {
            ...baseRequest,
            allowedPaymentMethods: [cardPaymentMethod],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice,
                currencyCode,
                countryCode,
            },
            merchantInfo: {
                merchantName,
                merchantId,
                authJwt,
            },
            emailRequired: true,
            shippingAddressRequired: !hasShippingAddress,
            shippingAddressParameters: {
                phoneNumberRequired: true,
            },
        };
    }

    private _getPaymentGatewaySpecification(gatewayMerchantId: string) {
        return {
            type: 'PAYMENT_GATEWAY',
            parameters: {
                gateway: 'authorizenet',
                gatewayMerchantId,
            },
        };
    }

    private _getCardPaymentMethod(
        tokenizationSpecification: TokenizationSpecification,
        supportedCards: string[],
    ) {
        return {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: supportedCards.map((card) =>
                    card === 'MC' ? 'MASTERCARD' : card,
                ),
                billingAddressRequired: true,
                billingAddressParameters: {
                    format: BillingAddressFormat.Full,
                    phoneNumberRequired: true,
                },
            },
            tokenizationSpecification,
        };
    }
}
