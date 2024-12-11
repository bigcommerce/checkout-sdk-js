import {
    BraintreeGooglePayment,
    BraintreeGooglePayThreeDSecure,
    BraintreeSdk,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CancellablePromise,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertIsGooglePayBraintreeTokenObject from '../guards/is-google-pay-braintree-token-object';
import {
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePaySetExternalCheckoutData,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayBraintreeGateway extends GooglePayGateway {
    private _braintreeGooglePayment?: BraintreeGooglePayment;
    private _service: PaymentIntegrationService;

    constructor(service: PaymentIntegrationService, private _braintreeSdk: BraintreeSdk) {
        super('braintree', service);

        this._service = service;
    }

    async initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>,
        isBuyNowFlow?: boolean,
        currencyCode?: string,
    ): Promise<void> {
        await super.initialize(getPaymentMethod, isBuyNowFlow, currencyCode);

        const paymentMethod = super.getPaymentMethod();

        if (!paymentMethod.clientToken || !paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSdk.initialize(paymentMethod.clientToken);
        this._braintreeGooglePayment = await this._braintreeSdk.getBraintreeGooglePayment();

        return Promise.resolve();
    }

    async getNonce(methodId: string) {
        const nonce = await super.getNonce(methodId);

        const { clientToken, initializationData } = super.getPaymentMethod();

        if (!clientToken || !initializationData || !initializationData.card_information?.bin) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            isThreeDSecureEnabled,
            card_information: { bin, isNetworkTokenized },
        } = initializationData;

        if (isThreeDSecureEnabled && !isNetworkTokenized) {
            const threeDSecure = await this._braintreeSdk.getBraintreeThreeDS();

            const { orderAmount } = this._service.getState().getOrderOrThrow();

            const verification = await this._braintreePresent3DSChallenge(
                threeDSecure,
                orderAmount,
                nonce,
                bin,
            );

            return verification.nonce;
        }

        return nonce;
    }

    async extraPaymentData() {
        return {
            deviceSessionId: await this._getBraintreeDeviceData(),
        };
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        let token: unknown;

        try {
            token = JSON.parse(data.nonce);
        } catch (error) {
            throw new InvalidArgumentError('Unable to parse response from Google Pay.');
        }

        assertIsGooglePayBraintreeTokenObject(token);

        data.nonce = token.androidPayCards[0].nonce;
        data.card_information.bin = token.androidPayCards[0].details.bin;
        data.card_information.isNetworkTokenized =
            token.androidPayCards[0].details.isNetworkTokenized;

        return data;
    }

    getCardParameters() {
        return super.getCardParameters();
    }

    async getPaymentGatewayParameters(): Promise<GooglePayGatewayParameters> {
        const braintreeGooglePayment = this.getBraintreeGooglePayment();

        const request = braintreeGooglePayment.createPaymentDataRequest({
            merchantInfo: super.getMerchantInfo(),
            transactionInfo: super.getTransactionInfo(),
            cardRequirements: {
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            ...(await super.getRequiredData()),
        });

        return request.paymentMethodTokenizationParameters.parameters;
    }

    private getBraintreeGooglePayment(): BraintreeGooglePayment {
        if (!this._braintreeGooglePayment) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._braintreeGooglePayment;
    }

    private async _getBraintreeDeviceData(): Promise<string | undefined> {
        const { deviceData } = await this._braintreeSdk.getDataCollectorOrThrow();

        return deviceData;
    }

    private _braintreePresent3DSChallenge(
        threeDSecure: BraintreeGooglePayThreeDSecure,
        amount: number,
        nonce: string,
        bin: string,
    ) {
        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                amount,
                bin,
                nonce,
                onLookupComplete: (_data, next) => {
                    next();
                },
            }),
        );

        return verification.promise;
    }
}
