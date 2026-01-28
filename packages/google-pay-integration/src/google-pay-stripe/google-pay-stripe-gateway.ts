import { includes, some } from 'lodash';

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
import {
    STRIPE_UPE_CLIENT_API_VERSION,
    STRIPE_UPE_CLIENT_BETAS,
    StripeJsVersion,
    StripeScriptLoader,
} from '@bigcommerce/checkout-sdk/stripe-utils';

import GooglePayGateway from '../gateways/google-pay-gateway';
import assertsIsGooglePayStripeInitializationData from '../guards/is-google-pay-stripe-initialization-data';
import isGooglePayStripeRequestError from '../guards/is-google-pay-stripe-request-error';
import assertIsGooglePayStripeTokenObject from '../guards/is-google-pay-stripe-token-object';
import {
    GooglePayCardDataResponse,
    GooglePaySetExternalCheckoutData,
    GooglePayStripeGatewayParameters,
    GooglePayStripeInitializationData,
} from '../types';

import { StripeError, StripeUPEClient } from './types';

export default class GooglePayStripeGateway extends GooglePayGateway {
    private stripeUPEClient?: StripeUPEClient;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
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

        if (!isRequestError(error) || !isGooglePayStripeRequestError(error.body)) {
            throw error;
        }

        const shouldTrigger3DS = some(error.body.errors, { code: 'three_d_secure_required' });

        if (shouldTrigger3DS) {
            const initialization = this.getGooglePayInitializationData();

            assertsIsGooglePayStripeInitializationData(initialization);

            this.stripeUPEClient = await this.loadStripeJs(initialization, methodId);

            const clientSecret = error.body.three_ds_result.token;
            let result;
            let catchedConfirmError = false;

            try {
                result = await this.stripeUPEClient.confirmCardPayment(clientSecret);
            } catch (_) {
                try {
                    result = await this.stripeUPEClient.retrievePaymentIntent(clientSecret);
                } catch (__) {
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

            return this.paymentIntegrationService.submitPayment({
                methodId,
                paymentData: { nonce: result?.paymentIntent?.id || clientSecret },
            });
        }

        throw error;
    }

    private async loadStripeJs(
        initializationData: GooglePayStripeInitializationData,
        methodId: string,
    ): Promise<StripeUPEClient> {
        if (this.stripeUPEClient) {
            return this.stripeUPEClient;
        }

        const locale = this.paymentIntegrationService.getState().getCartLocale();

        if (methodId === 'googlepaystripeocs' && !!initializationData.useNewStripeJsVersion) {
            return this.scriptLoader.getStripeClient(
                initializationData,
                locale,
                StripeJsVersion.CLOVER,
            );
        }

        return this.scriptLoader.getStripeClient(
            initializationData,
            locale,
            StripeJsVersion.V3,
            STRIPE_UPE_CLIENT_BETAS,
            STRIPE_UPE_CLIENT_API_VERSION,
        );
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
