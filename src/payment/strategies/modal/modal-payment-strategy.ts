import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import ModalPaymentInitializeOptions from './modal-payment-initialize-options';

export default class ModalPaymentStrategy implements PaymentStrategy {
    private _initializationOptions?: ModalPaymentInitializeOptions;
    private _methodId!: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;
        const { modal } = options;
        if (!modal) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.modal" argument is not provided.');
        }
        this._initializationOptions = modal;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const orderPayload = order;

        if (!this._initializationOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.modal" argument is not provided.');
        }
        const { closureEventName, iframeName, setModalLoadingStatus, setModalStatus } = this._initializationOptions;
        setModalLoadingStatus(true);
        setModalStatus(true);

        if (!payment) {
            throw new PaymentArgumentInvalidError([this._methodId]);
        }

        return new Promise<InternalCheckoutSelectors>((_resolve, reject) => {
            window.addEventListener(closureEventName, () => {
                setModalStatus(false);

                reject();
            });

            this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payment.methodId, payment.gatewayId, iframeName))
                .then(() => {
                    setModalLoadingStatus(false);

                    return this._store.getState();
                })
            );
        })
        .catch();
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (options) {
            const { methodId } = options;
            /**
             * Check if the method we are trying to deinitialize is the same as the initialized one,
             * by checking this, we prevent the deinitialization of a different method that may have
             * been already initialized by this strategy.
             */
            if (methodId === this._methodId) {
                this._initializationOptions = undefined;
            }
        }

        return Promise.resolve(this._store.getState());
    }
}
