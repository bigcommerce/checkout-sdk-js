import { RequestSender } from '@bigcommerce/request-sender';
import { round } from 'lodash';

import { Checkout } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ContentType } from '../../../common/http-request';
import { PaymentMethodFailedError } from '../../errors';
import PaymentMethod from '../../payment-method';
import { CheckoutcomGooglePayToken, CheckoutcomToken } from '../checkoutcom';

import { BillingAddressFormat, GooglePaymentData, GooglePayInitializer, GooglePayPaymentDataRequestV2, TokenizePayload } from './googlepay';

export default class GooglePayCheckoutcomInitializer implements GooglePayInitializer {
    private _publishableKey: string = '';
    private _testMode: boolean = true;

    constructor(
       private _requestSender: RequestSender
    ) {}

    async initialize(
        checkout: Checkout,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean
    ): Promise<GooglePayPaymentDataRequestV2> {
        this._publishableKey = paymentMethod.initializationData.checkoutcomkey;
        this._testMode = !!paymentMethod.config.testMode;

        return this._mapGooglePayCheckoutcomDataRequestToGooglePayDataRequestV2(
            checkout,
            paymentMethod.initializationData,
            hasShippingAddress
        );
    }

    teardown(): Promise<void> {
        return Promise.resolve();
    }

    async parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload> {
        let token;
        try {
            token = JSON.parse(paymentData.paymentMethodData.tokenizationData.token);
        } catch (err) {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }

        if (!token.signature || !token.protocolVersion || !token.signedMessage) {
            throw new PaymentMethodFailedError('Unable to parse response from Google Pay.');
        }
        const finalToken = await this._convertToken(this._testMode, this._publishableKey, token);

        return {
            nonce: finalToken,
            type: 'CreditCard',
            description: paymentData.paymentMethodData.description,
            details: {
                cardType: paymentData.paymentMethodData.info.cardNetwork,
                lastFour: paymentData.paymentMethodData.info.cardDetails,
            },
        };
    }

    private async _convertToken(testMode: boolean, checkoutcomkey: string, token: CheckoutcomGooglePayToken): Promise<string> {
        if (!token || !token.protocolVersion) {
            throw new PaymentMethodFailedError('Unable to parse response from GooglePay.');
        }

        const checkoutcomToken: CheckoutcomToken = await this._requestCheckoutcomTokenize(testMode, checkoutcomkey, {
            type: 'googlepay',
            token_data: token,
        });

        if (!checkoutcomToken || !checkoutcomToken.token) {
            throw new PaymentMethodFailedError('Unable to parse response from Checkout.com');
        }

        return checkoutcomToken.token;
    }

    private async _requestCheckoutcomTokenize(testMode: boolean, checkoutcomKey: string, data = {}): Promise<CheckoutcomToken> {
        const TEST_URL: string = 'https://api.sandbox.checkout.com/tokens';
        const LIVE_URL: string = 'https://api.checkout.com/tokens';

        const url = testMode ? TEST_URL : LIVE_URL;

        const response = await this._requestSender.post(url, {
            credentials: false,
            body: data,
            headers: {
                'Content-Type': ContentType.Json,
                Authorization: checkoutcomKey,
                'X-XSRF-TOKEN': null,
            },
        });

        return response.body as CheckoutcomToken;
    }

    private _mapGooglePayCheckoutcomDataRequestToGooglePayDataRequestV2(
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
                        format: BillingAddressFormat.Full,
                        phoneNumberRequired: true,
                    },
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'checkoutltd',
                        gatewayMerchantId: initializationData.checkoutcomkey,
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
