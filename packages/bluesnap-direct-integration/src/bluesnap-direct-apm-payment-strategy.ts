import { noop } from 'lodash';

import {
    CancellablePromise,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { createIframe } from './bluesnap-direct-iframe-creator';
import isBlueSnapDirectRedirectResponseProviderData from './is-bluesnap-direct-provider-data';
import {
    BlueSnapDirectAPMInitializeOptions,
    BlueSnapDirectRedirectResponse,
    WithBlueSnapDirectAPMPaymentInitializeOptions,
} from './types';

const IFRAME_NAME = 'bluesnap_direct_hosted_payment_page';

export default class BlueSnapDirectAPMPaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: BlueSnapDirectAPMInitializeOptions;

    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async initialize(
        options: PaymentInitializeOptions & WithBlueSnapDirectAPMPaymentInitializeOptions,
    ): Promise<void> {
        const { bluesnapdirect } = options;

        if (!bluesnapdirect) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bluesnapdirect" argument is not provided.',
            );
        }

        this._initializeOptions = bluesnapdirect;

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        try {
            await this._paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
            });
        } catch (error) {
            if (this._isBlueSnapDirectRedirectResponse(error)) {
                const providerData: unknown = JSON.parse(error.body.provider_data);

                if (isBlueSnapDirectRedirectResponseProviderData(providerData)) {
                    const providerDataQuery = new URLSearchParams(providerData).toString();

                    const frameUrl = `${error.body.additional_action_required.data.redirect_url}&${providerDataQuery}`;
                    const { onLoad, style } = this._initializeOptions;
                    const frame = createIframe(IFRAME_NAME, frameUrl, style);

                    const promise = new CancellablePromise<undefined>(new Promise(noop));

                    onLoad(frame, () => promise.cancel(new PaymentMethodCancelledError()));

                    return Promise.reject();
                }
            }

            return Promise.reject(error);
        }
    }

    async finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _isBlueSnapDirectRedirectResponse(
        response: unknown,
    ): response is BlueSnapDirectRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse: Partial<BlueSnapDirectRedirectResponse> = response;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody: Partial<BlueSnapDirectRedirectResponse['body']> = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required?.data.redirect_url &&
            typeof partialBody.provider_data === 'string'
        );
    }
}
