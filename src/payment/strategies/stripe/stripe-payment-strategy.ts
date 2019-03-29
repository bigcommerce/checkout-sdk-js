import { pick } from 'lodash';

import {mapToInternalAddress} from '../../../address';
import {mapToInternalCart} from '../../../cart';
import {CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors} from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    StandardError
} from '../../../common/error/errors';
import {mapToInternalCustomer} from '../../../customer';
import {mapToInternalOrder, OrderActionCreator, OrderRequestBody} from '../../../order';
import {OrderFinalizationNotRequiredError} from '../../../order/errors';
import {mapToInternalShippingOption} from '../../../shipping';
import {PaymentArgumentInvalidError} from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodSelector from '../../payment-method-selector';
import PaymentRequestBody from '../../payment-request-body';
import {PaymentInitializeOptions, PaymentRequestOptions} from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import ThreeDSecureProcessor from '../3dsecure/threedsecure-processor';
import PaymentStrategy from '../payment-strategy';

export default class StripePaymentStrategy implements PaymentStrategy {

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _threeDSecureProcessor: ThreeDSecureProcessor
    ) {}

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        // return this._threeDSecureProcessor.doPayment({})
        //     .then(() => {
        //         return Promise.resolve(this._store.getState());
        //     });

        return Promise.resolve(this._store.getState());
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

                return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                    .then(() =>
                        this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
                    ).catch((error: Error) => this._handleError(error));
            })
            .catch((error: Error) => this._handleError(error));
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _handleError(error: Error): never {
        if (error.name === 'StripeError') {
            throw new StandardError(error.message);
        }

        throw error;
    }
}
