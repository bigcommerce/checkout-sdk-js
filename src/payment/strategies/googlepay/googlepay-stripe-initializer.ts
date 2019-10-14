import { round } from 'lodash';

import { Checkout } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';

import { GooglePaymentData, GooglePayInitializer, GooglePayPaymentDataRequestV2, TokenizePayload } from './googlepay';

export default class GooglePayStripeInitializer implements GooglePayInitializer {
    initialize(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): Promise<GooglePayPaymentDataRequestV2> {
        return Promise.resolve(this._mapGooglePayStripeDataRequestToGooglePayDataRequestV2(
            checkout,
            paymentMethod.initializationData,
            hasShippingAddress
        ));
    }

    teardown(): Promise<void> {
        return Promise.resolve();
    }

    parseResponse(paymentData: GooglePaymentData): TokenizePayload {
        try {
            const payload = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);

            return {
                nonce: payload.id,
                type: payload.type,
                details: {
                    cardType: payload.card.brand,
                    lastFour: payload.card.last4,
                },
            };
        } catch (err) {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }
    }

    private _mapGooglePayStripeDataRequestToGooglePayDataRequestV2(
        checkout: Checkout,
        initializationData: any,
        hasShippingAddress: boolean
    ): GooglePayPaymentDataRequestV2 {
        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
                authJwt: initializationData.platformToken,
                merchantId: initializationData.googleMerchantId,
                merchantName: initializationData.googleMerchantName,
            },
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
                    billingAddressRequired: true,
                    billingAddressParameters: {
                        format: 'FULL',
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'stripe',
                        'stripe:version': initializationData.stripeVersion,
                        'stripe:publishableKey': initializationData.stripePublishableKey,
                    },
                },
            }],
            transactionInfo: {
                currencyCode: checkout.cart.currency.code,
                totalPriceStatus: 'FINAL',
                totalPrice: round(checkout.outstandingBalance, 2).toFixed(2),
            },
            emailRequired: true,
            shippingAddressRequired: !hasShippingAddress,
            shippingAddressParameters: {
                phoneNumberRequired: true,
            },
        };
    }
}
