import { RequestSender } from '@bigcommerce/request-sender';

import {
    ContentType,
    InvalidArgumentError,
    isRequestError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import assertIsGooglePayCheckoutComInitializationData from '../guards/is-google-pay-checkoutcom-initialization-data';
import { isGooglePayThreeDSecureResult } from '../guards/is-google-pay-threedsecure-result';
import assertIsGooglePayTokenObject from '../guards/is-google-pay-token-object';
import {
    GooglePayAdditionalActionProcessable,
    GooglePayCardDataResponse,
    GooglePayCheckoutComTokenObject,
    GooglePayGatewayParameters,
    GooglePaySetExternalCheckoutData,
    GooglePayTokenObject,
} from '../types';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayCheckoutComGateway
    extends GooglePayGateway
    implements GooglePayAdditionalActionProcessable
{
    constructor(service: PaymentIntegrationService, private _requestSender: RequestSender) {
        super('checkoutltd', service);
    }

    processAdditionalAction(error: unknown): Promise<void> {
        return new Promise((_resolve, reject) => {
            if (
                isRequestError(error) &&
                isGooglePayThreeDSecureResult(error.body) &&
                error.body.three_ds_result.code === 'three_d_secure_required'
            ) {
                return window.location.assign(error.body.three_ds_result.acs_url);
            }

            reject(error);
        });
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

        assertIsGooglePayTokenObject(token);

        data.nonce = await this._tokenize(token);

        return data;
    }

    getPaymentGatewayParameters(): GooglePayGatewayParameters {
        const data = this.getGooglePayInitializationData();

        assertIsGooglePayCheckoutComInitializationData(data);

        return {
            gateway: this.getGatewayIdentifier(),
            gatewayMerchantId: data.checkoutcomkey,
        };
    }

    private async _tokenize(token_data: GooglePayTokenObject): Promise<string> {
        const url = this.getPaymentMethod().config.testMode
            ? 'https://api.sandbox.checkout.com/tokens'
            : 'https://api.checkout.com/tokens';
        const data = this.getGooglePayInitializationData();

        assertIsGooglePayCheckoutComInitializationData(data);

        const { body } = await this._requestSender.post<GooglePayCheckoutComTokenObject>(url, {
            credentials: false,
            body: {
                type: 'googlepay',
                token_data,
            },
            headers: {
                Authorization: data.checkoutcomkey,
                'Content-Type': ContentType.Json,
                'X-XSRF-TOKEN': null,
            },
        });

        return body.token;
    }
}
