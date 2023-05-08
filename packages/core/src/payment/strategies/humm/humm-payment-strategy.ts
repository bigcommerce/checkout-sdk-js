import { FormPoster } from '@bigcommerce/form-poster';

import { PaymentExecuteError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaymentStrategy } from '..';
import { PaymentActionCreator } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';

export default class HummPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _formPoster: FormPoster,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
    ) {}

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment?.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId, options),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(payment.methodId);

        if (!paymentMethod.initializationData?.processable) {
            throw new PaymentExecuteError(
                'payment.humm_not_processable_error',
                'hummNotProcessableError',
            );
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment({ methodId: payment.methodId }),
            );
        } catch (error) {
            if (this._isOffsiteRedirectResponse(error)) {
                return this._handleOffsiteRedirectResponse(error);
            }

            return Promise.reject(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _handleOffsiteRedirectResponse(response: OffsiteRedirectResponse): Promise<never> {
        const url = response.body.additional_action_required.data.redirect_url;
        const data = response.body.provider_data;

        return new Promise(() => {
            this._formPoster.postForm(url, JSON.parse(data));
        });
    }

    private _isOffsiteRedirectResponse(response: unknown): response is OffsiteRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse: Partial<OffsiteRedirectResponse> = response;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody: Partial<OffsiteRedirectResponse['body']> = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required &&
            partialBody.additional_action_required.type === 'offsite_redirect' &&
            typeof partialBody.provider_data === 'string'
        );
    }
}

interface OffsiteRedirectResponse {
    body: {
        additional_action_required: {
            type: 'offsite_redirect';
            data: {
                redirect_url: string;
            };
        };
        status: string;
        provider_data: string;
    };
}
