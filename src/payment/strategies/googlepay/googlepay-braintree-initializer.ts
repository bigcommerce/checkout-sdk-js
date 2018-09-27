import Checkout from '../../../checkout/checkout';
import {MissingDataError, MissingDataErrorType, StandardError} from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';
import BraintreeSDKCreator from '../braintree/braintree-sdk-creator';

import {
    GooglePaymentData, GooglePayDataRequestV1, GooglePayInitializer,
    GooglePayPaymentDataRequestV1, TokenizePayload
} from './googlepay';
import {GooglePayBraintreeSDK} from './index';

export default class GooglePayBraintreeInitializer implements GooglePayInitializer {
    private _googlePaymentInstance!: GooglePayBraintreeSDK;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(checkout: Checkout, paymentMethod: PaymentMethod): Promise<GooglePayPaymentDataRequestV1> {
        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);

        return this._braintreeSDKCreator.getGooglePaymentComponent()
            .then(googleBraintreePaymentInstance => {
                this._googlePaymentInstance = googleBraintreePaymentInstance;
                return this._createGooglePayPayload(googleBraintreePaymentInstance, checkout, paymentMethod.initializationData.platformToken);
            }).catch((error: Error) => {
                throw new StandardError(error.message);
            });
    }
    teardown(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        return this._googlePaymentInstance.parseResponse(paymentData);
    }

    private _createGooglePayPayload(googleBraintreePaymentInstance: GooglePayBraintreeSDK, checkout: Checkout, platformToken: string): GooglePayPaymentDataRequestV1 {
        if (!platformToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const googlePaymentDataRequest: GooglePayDataRequestV1 = {
            merchantInfo: {
                merchantId: '01234567890123456789',
                merchantName: 'BIGCOMMERCE',
                authJwt: platformToken,
            },
            transactionInfo: {
                currencyCode: checkout.cart.currency.code,
                totalPriceStatus: 'FINAL',
                totalPrice: checkout.grandTotal.toString(),
            },
            cardRequirements: {
                // We recommend collecting billing address information, at minimum
                // billing postal code, and passing that billing postal code with all
                // Google Pay transactions as a best practice.
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            shippingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
        };

        return googleBraintreePaymentInstance.createPaymentDataRequest(googlePaymentDataRequest) as GooglePayPaymentDataRequestV1;
    }
}
