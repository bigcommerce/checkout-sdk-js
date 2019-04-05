import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    StandardError
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { StripeScriptLoader } from './index';

export default class StripePaymentStrategy implements PaymentStrategy {
    private stripeJs: any;
    private cardElement: any;
    private ccNumber: any;
    private ccExpiry: any;
    private ccCvv: any;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeScriptLoader
    ) {}

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._stripeScriptLoader.load('pk_test_OiGqP4ZezFBTJErOWeMFumjE') // options.initializationData.stripePublishableKey
            .then(stripeJs => {
                this.stripeJs = stripeJs;
                const elements = this.stripeJs.elements();
                this.cardElement = elements.create('card', {
                    style: {
                        base: {
                            color: '#32325D',
                            fontWeight: 500,
                            fontFamily: 'Inter UI, Open Sans, Segoe UI, sans-serif',
                            fontSize: '16px',
                            fontSmoothing: 'antialiased',

                            '::placeholder': {
                                color: '#CFD7DF',
                            },
                        },
                        invalid: {
                            color: '#E25950',
                        },
                    },
                });
                this.cardElement.mount('#stripe-card-element');

                // this.ccNumber = elements.create('cardNumber', {
                //     placeholder: '',
                // });
                // this.ccNumber.mount('#ccNumber');
                //
                // this.ccExpiry = elements.create('cardExpiry');
                // this.ccExpiry.mount('#ccExpiry');
                //
                // this.ccCvv = elements.create('cardCvc', {
                //     placeholder: '',
                // });
                // this.ccCvv.mount('#ccCvv');
                // TODO: Create card with Stripe JS and handlePayment()

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!options) {
            throw new InvalidArgumentError('Unable to initialize payment because "options" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

                if (!paymentMethod || !paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this.stripeJs.handleCardPayment(
                    paymentMethod.clientToken, this.cardElement, {
                        source_data: {
                            owner: { name: 'Carlos L' },
                        },
                    }
                ).then((stripeResponse: any) => {
                    if (stripeResponse.error) {
                        console.log(stripeResponse);
                    } else {
                        console.log('Success', stripeResponse);
                        // TODO: Remove this and finalize after stripe

                        const paymentPayload = {
                            methodId: payment.methodId,
                            paymentData: { nonce: stripeResponse.paymentIntent.id },
                        };

                        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload)));
                    }
                });
            })
            .catch((error: Error) => { throw new StandardError(error.message); });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
