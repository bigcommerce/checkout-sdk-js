import { round } from 'lodash';

import { Checkout } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';
import { BraintreeSDKCreator, GooglePayBraintreeSDK } from '../braintree';

import { GooglePaymentData, GooglePayInitializer, GooglePayPaymentDataRequestV2, TokenizePayload } from './googlepay';
import { GooglePayBraintreeDataRequest, GooglePayBraintreePaymentDataRequestV1 } from './googlepay-braintree';

export default class GooglePayBraintreeInitializer implements GooglePayInitializer {
    private _googlePaymentInstance!: GooglePayBraintreeSDK;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): Promise<GooglePayPaymentDataRequestV2> {
        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);

        return this._braintreeSDKCreator.getGooglePaymentComponent()
            .then(googleBraintreePaymentInstance => {
                this._googlePaymentInstance = googleBraintreePaymentInstance;

                return this._createGooglePayPayload(
                    checkout,
                    paymentMethod.initializationData,
                    hasShippingAddress
                );
            });
    }

    teardown(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    parseResponse(paymentData: GooglePaymentData): TokenizePayload {
        const payload = JSON.parse(paymentData.paymentMethodData.tokenizationData.token).androidPayCards[0];

        return {
            nonce: payload.nonce,
            type: payload.type,
            description: payload.description,
            details: {
                cardType: payload.details.cardType,
                lastFour: payload.details.lastFour,
                lastTwo: payload.details.lastTwo,
            },
            binData: payload.binData,
        };
    }

    private _createGooglePayPayload(
        checkout: Checkout,
        initializationData: any,
        hasShippingAddress: boolean
    ): GooglePayPaymentDataRequestV2 {
        if (!initializationData.platformToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const googlePayBraintreePaymentDataRequest: GooglePayBraintreeDataRequest = {
            merchantInfo: {
                authJwt: initializationData.platformToken,
                merchantName: initializationData.googleMerchantName,
                merchantId: initializationData.googleMerchantId,
            },
            transactionInfo: {
                currencyCode: checkout.cart.currency.code,
                totalPriceStatus: 'FINAL',
                totalPrice: round(checkout.outstandingBalance, 2).toFixed(2),
            },
            cardRequirements: {
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            shippingAddressRequired: !hasShippingAddress,
            emailRequired: true,
            phoneNumberRequired: true,
        };

        return this._mapGooglePayBraintreeDataRequestToGooglePayDataRequestV2(
            this._googlePaymentInstance.createPaymentDataRequest(googlePayBraintreePaymentDataRequest)
        );
    }

    private _mapGooglePayBraintreeDataRequestToGooglePayDataRequestV2(googlePayBraintreeDataRequestV1: GooglePayBraintreePaymentDataRequestV1): GooglePayPaymentDataRequestV2 {
        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
                authJwt: googlePayBraintreeDataRequestV1.merchantInfo.authJwt,
                merchantId: googlePayBraintreeDataRequestV1.merchantInfo.merchantId,
                merchantName: googlePayBraintreeDataRequestV1.merchantInfo.merchantName,
            },
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: googlePayBraintreeDataRequestV1.cardRequirements.allowedCardNetworks,
                    billingAddressRequired: true,
                    billingAddressParameters: {
                        format: 'FULL',
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'braintree',
                        'braintree:apiVersion': 'v1',
                        'braintree:authorizationFingerprint': googlePayBraintreeDataRequestV1.paymentMethodTokenizationParameters.parameters['braintree:authorizationFingerprint'],
                        'braintree:merchantId': googlePayBraintreeDataRequestV1.paymentMethodTokenizationParameters.parameters['braintree:merchantId'],
                        'braintree:sdkVersion': googlePayBraintreeDataRequestV1.paymentMethodTokenizationParameters.parameters['braintree:sdkVersion'],
                    },
                },
            }],
            transactionInfo: googlePayBraintreeDataRequestV1.transactionInfo,
            emailRequired: true,
            shippingAddressRequired: googlePayBraintreeDataRequestV1.shippingAddressRequired,
            shippingAddressParameters: {
                phoneNumberRequired: googlePayBraintreeDataRequestV1.phoneNumberRequired,
            },
        };
    }
}
