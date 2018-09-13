import {RequestSender} from '@bigcommerce/request-sender';
import Response from '@bigcommerce/request-sender/lib/response';

import {toFormUrlEncoded} from '../../../common/http-request';
import BraintreeSDKCreator from '../braintree/braintree-sdk-creator';

import {
    GooglePayAddress,
    GooglePayBraintreeSDK,
    GATEWAY,
    PaymentSuccessPayload
} from './googlepay';

export default class GooglePayPaymentProcessor {

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _requestSender: RequestSender
    ) {}

    initialize(clientToken: string, gateway: string): Promise<GooglePayBraintreeSDK> {
        if (GATEWAY.braintree === gateway) {
            this._braintreeSDKCreator.initialize(clientToken);
            return this._braintreeSDKCreator.getGooglePaymentComponent();
        } else {
            throw new Error('Gateway not supported');
        }
    }

    teardown(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    handleSuccess(payment: PaymentSuccessPayload): Promise<Response<any>> {
        return this._postForm(payment);
    }

    private _postForm(paymentData: PaymentSuccessPayload): Promise<Response<any>> {
        const {
            billingAddress,
            shippingAddress,
            email,
        } = paymentData;

        const cardInformation = paymentData.tokenizePayload.details;

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: toFormUrlEncoded({
                payment_type: paymentData.tokenizePayload.type,
                nonce: paymentData.tokenizePayload.nonce,
                provider: 'googlepay',
                action: 'set_external_checkout',
                card_information: this._getCardInformation(cardInformation),
                billing_address: this._getAddress(billingAddress, email),
                shipping_address: this._getAddress(shippingAddress, email),
            }),
        });
    }

    private _getAddress(address: GooglePayAddress, email: string) {
        const addressExtended = address.address2 + address.address3 + address.address4 + address.address5;
        return {
            email,
            first_name: address.name,
            phone_number: address.phoneNumber,
            address_line_1: address.address1,
            address_line_2: addressExtended,
            city: address.locality,
            state: address.administrativeArea,
            country_code: address.countryCode,
            postal_code: address.postalCode,
        };
    }

    private _getCardInformation(cardInformation: { cardType: string, lastFour: string }) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastFour,
        };
    }
}
