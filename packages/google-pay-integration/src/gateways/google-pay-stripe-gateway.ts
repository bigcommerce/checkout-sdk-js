import {
    InvalidArgumentError,
    isRequestError,
    PaymentArgumentInvalidError,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { includes, some } from 'lodash';
import { StripeUPEScriptLoader, StripeError, StripeUPEClient } from '@bigcommerce/checkout-sdk/stripe-integration';

import assertsIsGooglePayStripeInitializationData from '../guards/is-google-pay-stripe-initialization-data';
import assertIsGooglePayStripeTokenObject from '../guards/is-google-pay-stripe-token-object';
import {
    GooglePayCardDataResponse,
    GooglePaySetExternalCheckoutData,
    GooglePayStripeGatewayParameters,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayStripeGateway extends GooglePayGateway {
    private _stripeUPEClient?: StripeUPEClient;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader
    ) {
        super('stripe', paymentIntegrationService);
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

        assertIsGooglePayStripeTokenObject(token);

        data.nonce = token.id;

        return data;
    }

    getPaymentGatewayParameters(): GooglePayStripeGatewayParameters {
        const data = this.getGooglePayInitializationData();

        assertsIsGooglePayStripeInitializationData(data);

        const { stripeVersion, stripePublishableKey, stripeConnectedAccount } = data;

        return {
            gateway: this.getGatewayIdentifier(),
            'stripe:version': stripeVersion,
            'stripe:publishableKey': `${stripePublishableKey}/${stripeConnectedAccount}`,
        };
    }


    async processAdditionalAction(
        error: unknown,
        methodId?: string,
    ): Promise<PaymentIntegrationSelectors | never> {

        if (!methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!isRequestError(error)) {
            throw error;
        }

        const data = this.getGooglePayInitializationData();

        assertsIsGooglePayStripeInitializationData(data);

        const { stripePublishableKey, stripeConnectedAccount } = data;

        this._stripeUPEClient = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);

        if (some(error.body.errors, { code: 'three_d_secure_required' })) {
            const clientSecret = error.body.three_ds_result.token;
            let result;
            let catchedConfirmError = false;

            try {
                result = await this._stripeUPEClient.confirmCardPayment(clientSecret);
            } catch (error) {
                try {
                    result = await this._stripeUPEClient.retrievePaymentIntent(clientSecret);
                } catch (error) {
                    catchedConfirmError = true;
                }
            }

            if (result?.error) {
                this._throwDisplayableStripeError(result.error);

                if (this._isCancellationError(result.error)) {
                    throw new PaymentMethodCancelledError();
                }

                throw new PaymentMethodFailedError();
            }

            if (!result?.paymentIntent && !catchedConfirmError) {
                throw new RequestError();
            }

            // catchedConfirmError ? clientSecret : result?.paymentIntent?.id
            return this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: { nonce: result?.paymentIntent?.id || clientSecret},
            });
        }

        throw error;
    }

    private async _loadStripeJs(
        stripePublishableKey: string,
        stripeConnectedAccount: string,
    ): Promise<StripeUPEClient> {
        if (this._stripeUPEClient) {
            return this._stripeUPEClient;
        }

        return this.scriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);
    }

    private _isCancellationError(stripeError: StripeError | undefined) {
        return (
            stripeError &&
            stripeError.payment_intent.last_payment_error?.message?.indexOf('canceled') !== -1
        );
    }

    private _throwDisplayableStripeError(stripeError: StripeError) {
        if (
            includes(['card_error', 'invalid_request_error', 'validation_error'], stripeError.type)
        ) {
            throw new Error(stripeError.message);
        }
    }
}
