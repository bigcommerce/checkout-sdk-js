import Checkout from '../../../checkout/checkout';
import {StandardError} from '../../../common/error/errors';
import BraintreeSDKCreator from '../braintree/braintree-sdk-creator';

import {GooglePayInitializer, GooglePayPaymentDataRequest} from './googlepay';
import {GooglePayBraintreeSDK} from './index';

export default class GooglePayBraintreeInitializer implements GooglePayInitializer {
    private _googlePaymentInstance!: GooglePayBraintreeSDK;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(checkout: Checkout, clientToken: string): Promise<any> {
        if (!clientToken) {
            throw new Error('clientToken undefined');
        }
        this._braintreeSDKCreator.initialize(clientToken);
        return this._braintreeSDKCreator.getGooglePaymentComponent()
            .then(googleBraintreePaymentInstance => {
                this._googlePaymentInstance = googleBraintreePaymentInstance;
                return this._createGooglePayPayload(googleBraintreePaymentInstance, checkout);
            }).catch((error: Error) => {
                throw new StandardError(error.message);
            });
    }
    teardown(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    parseResponse(paymentData: any): Promise<any> {
        return this._googlePaymentInstance.parseResponse(paymentData);
    }

    private _createGooglePayPayload(googleBraintreePaymentInstance: GooglePayBraintreeSDK, checkout: Checkout): any {
        const googlePaymentDataRequest: any = {
            merchantInfo: {
                merchantId: '01234567890123456789',
                // merchantName: 'BIGCOMMERCE',
                // authJwt: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudE9yaWdpbiI6Ind3dy5iaWdjb21tZXJjZS5jb20iLCJtZXJjaGFudElkIjoiMTIzNDUiLCJpYXQiOjE1Mzc1MDE0Mjh9.YjA2YTg5MmQ0MWI3Mjk4ZTdlNzI2ZmYzYzIyYzZkMTY0ZTU4OTlmNTljYmVkNjZkNWEwOGI2MjE3ZmZlNTc1Mg',
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

        return googleBraintreePaymentInstance.createPaymentDataRequest(googlePaymentDataRequest);
    }
}
