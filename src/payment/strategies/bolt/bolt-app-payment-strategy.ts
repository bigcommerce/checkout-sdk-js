import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentMethodCancelledError } from '../../errors';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BoltCheckout, BoltTransaction } from './bolt';
import BoltScriptLoader from './bolt-script-loader';

export default class BoltAppPaymentStrategy implements PaymentStrategy {
    private _boltClient?: BoltCheckout;
    private _methodId!: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _boltScriptLoader: BoltScriptLoader
    ) { }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);

        if (!paymentMethod || !paymentMethod.initializationData.publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { publishableKey } = paymentMethod.initializationData;

        this._boltClient = await this._boltScriptLoader.load(publishableKey, paymentMethod.config.testMode);

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId, options));
        const paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const orderToken = paymentMethod.clientToken;

        const transaction: BoltTransaction = await new Promise((resolve, reject) => {
            const onSuccess = (transaction: BoltTransaction,  callback: () => void) => {
                resolve(transaction);
                callback();
            };

            const onClose = () => {
                reject(new PaymentMethodCancelledError());
            };

            const callbacks = {
                success: onSuccess,
                close: onClose,
            };

            if (!this._boltClient) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._boltClient.configure({ orderToken }, {}, callbacks).open();
        });

        const { shouldSaveInstrument } = payment.paymentData as NonceInstrument;

        const paymentPayload = {
            methodId: payment.methodId,
            paymentData: {
                nonce: transaction.reference,
                shouldSaveInstrument,
            },
        };

        return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }
}
