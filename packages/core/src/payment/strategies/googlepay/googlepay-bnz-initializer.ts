import { round } from 'lodash';

import { Checkout } from '../../../checkout';
import PaymentMethod from '../../payment-method';

import {
    BillingAddressFormat,
    GooglePayInitializer,
    GooglePaymentData,
    GooglePayPaymentDataRequestV2,
    TokenizePayload,
    TotalPriceStatusType,
} from './googlepay';

export default class GooglePayBNZInitializer implements GooglePayInitializer {
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
        const {
            paymentMethodData: {
                type,
                tokenizationData: { token },
                info: { cardNetwork: cardType, cardDetails: lastFour },
            },
        } = paymentData;

        return Promise.resolve({
            nonce: btoa(token),
            type,
            details: {
                cardType,
                lastFour,
            },
        });
    }

    private _getGooglePayPaymentDataRequest(
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
                            gateway: 'cybersource',
                            gatewayMerchantId,
                        },
                    },
                },
            ],
            transactionInfo: {
                currencyCode,
                totalPriceStatus: TotalPriceStatusType.FINAL,
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
