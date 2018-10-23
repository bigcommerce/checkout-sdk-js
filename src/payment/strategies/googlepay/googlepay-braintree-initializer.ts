import { Checkout } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType
} from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';
import { BraintreeSDKCreator, GooglePayBraintreeSDK } from '../braintree';

import {
    GooglePaymentData,
    GooglePayDataRequestV1,
    GooglePayInitializer,
    GooglePayPaymentDataRequestV1,
    TokenizePayload
} from './googlepay';

export default class GooglePayBraintreeInitializer implements GooglePayInitializer {
    private _googlePaymentInstance!: GooglePayBraintreeSDK;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator
    ) {}

    initialize(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): Promise<GooglePayPaymentDataRequestV1> {
        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);

        return this._braintreeSDKCreator.getGooglePaymentComponent()
            .then(googleBraintreePaymentInstance => {
                this._googlePaymentInstance = googleBraintreePaymentInstance;

                return this._createGooglePayPayload(
                    checkout,
                    paymentMethod.initializationData.platformToken,
                    hasShippingAddress
                );
            });
    }

    teardown(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        return this._googlePaymentInstance.parseResponse(paymentData);
    }

    private _createGooglePayPayload(
        checkout: Checkout,
        platformToken: string,
        hasShippingAddress: boolean
    ): GooglePayPaymentDataRequestV1 {
        if (!platformToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const googlePaymentDataRequest: GooglePayDataRequestV1 = {
            merchantInfo: {
                authJwt: platformToken,
            },
            transactionInfo: {
                currencyCode: checkout.cart.currency.code,
                totalPriceStatus: 'FINAL',
                totalPrice: checkout.grandTotal.toString(),
            },
            cardRequirements: {
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            shippingAddressRequired: !hasShippingAddress,
            emailRequired: true,
            phoneNumberRequired: true,
        };

        return this._googlePaymentInstance.createPaymentDataRequest(googlePaymentDataRequest);
    }
}
