import {
    BraintreeGooglePayThreeDSecure,
    BraintreeIntegrationService,
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
    GooglePayBraintreeGatewayParameters,
    GooglePayCardDataResponse,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePaySetExternalCheckoutData,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayBraintreeGateway extends GooglePayGateway {
    private _paymentGatewayParameters?: GooglePayBraintreeGatewayParameters;
    private _service: PaymentIntegrationService;

    constructor(
        service: PaymentIntegrationService,
        private _braintreeService: BraintreeIntegrationService,
    ) {
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

        this._braintreeService.initialize(
            paymentMethod.clientToken,
            this._service.getState().getStoreConfig(),
        );

        const googleBraintreePaymentInstance =
            await this._braintreeService.getGooglePaymentComponent();

        const request = googleBraintreePaymentInstance.createPaymentDataRequest({
            merchantInfo: super.getMerchantInfo(),
            transactionInfo: super.getTransactionInfo(),
            cardRequirements: {
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            ...(await super.getRequiredData()),
        });

        this._paymentGatewayParameters = request.paymentMethodTokenizationParameters.parameters;

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
            card_information: { bin },
        } = initializationData;

        if (isThreeDSecureEnabled) {
            const threeDSecure = await this._braintreeService.get3DS();

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

        return data;
    }

    getCardParameters() {
        return super.getCardParameters();
    }

    getPaymentGatewayParameters(): GooglePayGatewayParameters {
        if (!this._paymentGatewayParameters) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._paymentGatewayParameters;
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
