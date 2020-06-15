import { round } from 'lodash';

import { Checkout } from '../../../checkout';
import PaymentMethod from '../../payment-method';

import { BillingAddressFormat, GooglePaymentData, GooglePayInitializer, GooglePayPaymentDataRequestV2, TokenizePayload, TokenizeType } from './googlepay';

export default class GooglePayAdyenV2Initializer implements GooglePayInitializer {
    initialize(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): Promise<GooglePayPaymentDataRequestV2> {
        return Promise.resolve(this._getGooglePayPaymentDataRequest(
            checkout,
            paymentMethod,
            hasShippingAddress
        ));
    }

    teardown(): Promise<void> {
        return Promise.resolve();
    }

    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        const {
            paymentMethodData: {
                type,
                tokenizationData: { token },
                info: {
                    cardNetwork: cardType,
                    cardDetails: lastFour,
                },
            },
        } = paymentData;

        return Promise.resolve({
            type: type as TokenizeType,
            nonce: token,
            details: {
                cardType,
                lastFour,
            },
        });
    }

    private _getGooglePayPaymentDataRequest(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): GooglePayPaymentDataRequestV2 {
        const {
            outstandingBalance,
            cart: {
                currency: { code: currencyCode },
            },
        } = checkout;

        const {
            initializationData: {
                gatewayMerchantId,
                googleMerchantName: merchantName,
                googleMerchantId: merchantId,
                platformToken: authJwt,
            },
            supportedCards,
        } = paymentMethod;

        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
                authJwt,
                merchantId,
                merchantName,
            },
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: supportedCards.map(card => card === 'MC' ? 'MASTERCARD' : card),
                    billingAddressRequired: true,
                    billingAddressParameters: {
                        format: BillingAddressFormat.Full,
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'adyen',
                        gatewayMerchantId,
                    },
                },
            }],
            transactionInfo: {
                currencyCode,
                totalPriceStatus: 'FINAL',
                totalPrice: round(outstandingBalance, 2).toFixed(2),
            },
            emailRequired: true,
            shippingAddressRequired: !hasShippingAddress,
            shippingAddressParameters: {
                phoneNumberRequired: true,
            },
        };
    }
}
