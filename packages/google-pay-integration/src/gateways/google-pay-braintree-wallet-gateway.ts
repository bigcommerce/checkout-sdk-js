import { BraintreeGooglePayment, BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    guard,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertIsGooglePayBraintreeTokenObject from '../guards/is-google-pay-braintree-token-object';
import {
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
    GooglePayTransactionInfo,
} from '../types';

import GooglePayWalletGateway, { GooglePayWalletRedirectData } from './google-pay-wallet-gateway';

export default class GooglePayBraintreeWalletGateway implements GooglePayWalletGateway {
    private readonly providerId = 'googlepaybraintree';
    private readonly paymentType = 'googlepay';
    private braintreeGooglePayment?: BraintreeGooglePayment;

    constructor(private braintreeSdk: BraintreeSdk) {}

    async initialize(paymentMethod: PaymentMethod<GooglePayInitializationData>): Promise<void> {
        if (!paymentMethod.clientToken || !paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreeSdk.initialize(paymentMethod.clientToken);
        this.braintreeGooglePayment = await this.braintreeSdk.getBraintreeGooglePayment();
    }

    getPaymentGatewayParameters(
        merchantInfo: GooglePayMerchantInfo,
        transactionInfo: GooglePayTransactionInfo,
    ): GooglePayGatewayParameters {
        const request = this.getBraintreeGooglePaymentOrThrow().createPaymentDataRequest({
            merchantInfo,
            transactionInfo,
            cardRequirements: {
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
        });

        return request.paymentMethodTokenizationParameters.parameters;
    }

    async getRedirectData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePayWalletRedirectData> {
        const {
            tokenizationData: { token },
            info: { cardNetwork: type, cardDetails: number },
        } = response.paymentMethodData;

        let parsedToken: unknown;

        try {
            parsedToken = JSON.parse(token);
        } catch {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }

        assertIsGooglePayBraintreeTokenObject(parsedToken);

        const {
            nonce,
            details: { bin, isNetworkTokenized },
        } = parsedToken.androidPayCards[0];

        const { deviceData } = await this.braintreeSdk.getDataCollectorOrThrow();

        const cardInformation = { type, number, bin, isNetworkTokenized };

        return {
            paymentWalletData: {
                providerId: this.providerId,
                providerOrderId: nonce,
            },
            queryParams: [
                { key: 'payment_type', value: this.paymentType },
                { key: 'provider', value: this.providerId },
                { key: 'nonce', value: nonce },
                {
                    key: 'card_information',
                    value: JSON.stringify(cardInformation),
                },
                ...(deviceData ? [{ key: 'device_data', value: deviceData }] : []),
            ],
        };
    }

    async deinitialize(): Promise<void> {
        await this.braintreeSdk.deinitialize();
    }

    private getBraintreeGooglePaymentOrThrow(): BraintreeGooglePayment {
        return guard(
            this.braintreeGooglePayment,
            () => new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
        );
    }
}
