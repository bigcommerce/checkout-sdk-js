import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError, NotInitializedErrorType,
    StandardError
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { StripeCardElement, StripeV3Client } from './stripev3';
import StripeV3ScriptLoader from './stripev3-script-loader';

export default class StripeV3PaymentStrategy implements PaymentStrategy {
    private _stripeV3Client?: StripeV3Client;
    private _cardElement?: StripeCardElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeV3ScriptLoader
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const stripeOptions = options.stripev3;

        if (!stripeOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.stripev3" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._stripeScriptLoader.load(paymentMethod.initializationData.stripePublishableKey)
            .then(stripeJs => {
                this._stripeV3Client = stripeJs;
                const elements = this._stripeV3Client.elements();
                const cardElement = elements.create('card', {
                    style: stripeOptions.style,
                });

                cardElement.mount(`#${stripeOptions.containerId}`);

                this._cardElement = cardElement;

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

                if (!paymentMethod || !paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!this._cardElement) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                return this._getStripeJs().handleCardPayment(
                    paymentMethod.clientToken, this._cardElement, {}
                ).then(stripeResponse => {
                    if (stripeResponse.error || !stripeResponse.paymentIntent.id) {
                        throw new StandardError(stripeResponse.error && stripeResponse.error.message);
                    }

                    const paymentPayload = {
                        methodId: payment.methodId,
                        paymentData: { nonce: stripeResponse.paymentIntent.id },
                    };

                    return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                        .then(() =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload))
                        );
                });
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._cardElement) {
            this._cardElement.unmount();
        }

        return Promise.resolve(this._store.getState());
    }

    private _getStripeJs(): StripeV3Client {
        if (!this._stripeV3Client) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeV3Client;
    }
}
