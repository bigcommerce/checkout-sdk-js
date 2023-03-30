import { round } from 'lodash';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Checkout } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';

import {
    BillingAddressFormat,
    GooglePayInitializer,
    GooglePaymentData,
    GooglePayPaymentDataRequestV2,
    TokenizePayload,
    totalPriceStatusType,
} from './googlepay';

export default class GooglePayStripeUPEInitializer implements GooglePayInitializer {
    initialize(
        checkout: Checkout | undefined,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean,
    ): Promise<GooglePayPaymentDataRequestV2> {
        return Promise.resolve(
            this._getGooglePayPaymentDataRequest(checkout, paymentMethod, hasShippingAddress),
        );
    }

    teardown(): Promise<void> {
        return Promise.resolve();
    }

    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        let payload;

        try {
            payload = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
        } catch (err) {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }

        if (
            !payload.id ||
            !payload.type ||
            !payload.card ||
            !payload.card.brand ||
            !payload.card.last4
        ) {
            throw new PaymentMethodFailedError('Unable to parse response from Google Pay.');
        }

        return Promise.resolve({
            nonce: payload.id,
            type: payload.type,
            details: {
                cardType: payload.card.brand,
                lastFour: payload.card.last4,
            },
        });
    }

    private _getGooglePayPaymentDataRequest(
        checkout: Checkout | undefined,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean,
    ): GooglePayPaymentDataRequestV2 {
        const currencyCode = checkout?.cart.currency.code || '';
        const decimalPlaces = checkout?.cart.currency.decimalPlaces || 2;
        const totalPrice = checkout?.outstandingBalance
            ? round(checkout.outstandingBalance, decimalPlaces).toFixed(decimalPlaces)
            : '';

        const {
            initializationData: {
                googleMerchantName: merchantName,
                googleMerchantId: merchantId,
                platformToken: authJwt,
                stripeVersion,
                stripePublishableKey,
                stripeConnectedAccount,
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
            allowedPaymentMethods: [
                {
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
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                            gateway: 'stripe',
                            'stripe:version': stripeVersion,
                            'stripe:publishableKey': `${stripePublishableKey}/${stripeConnectedAccount}`,
                        },
                    },
                },
            ],
            transactionInfo: {
                currencyCode,
                totalPriceStatus: totalPriceStatusType.FINAL,
                totalPrice,
            },
            emailRequired: true,
            shippingAddressRequired: !hasShippingAddress,
            shippingAddressParameters: {
                phoneNumberRequired: true,
            },
        };
    }
}
