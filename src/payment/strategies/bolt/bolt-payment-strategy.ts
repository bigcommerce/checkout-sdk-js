import { isNonceLike } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BoltCheckout, BoltTransaction } from './bolt';
import BoltScriptLoader from './bolt-script-loader';

export default class BoltPaymentStrategy implements PaymentStrategy {
    private _boltClient?: BoltCheckout;
    private _useBoltClient: boolean = false;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _boltScriptLoader: BoltScriptLoader
    ) { }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { bolt, methodId } = options;

        this._useBoltClient = !!(bolt && bolt.useBigCommerceCheckout);

        if (this._useBoltClient) {
            const state = this._store.getState();
            const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

            if (!paymentMethod || !paymentMethod.initializationData.publishableKey) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const { developerConfig, publishableKey } = paymentMethod.initializationData;

            this._boltClient = await this._boltScriptLoader.load(publishableKey, paymentMethod.config.testMode, developerConfig);
        }

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._boltClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._useBoltClient) {
            return this._executeWithBoltClient(payload, options);
        } else {
            return this._executeWithBoltCheckout(payload, options);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private async _executeWithBoltClient(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._boltClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const boltClient = this._boltClient;

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

            boltClient.configure({ orderToken }, {}, callbacks).open();
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

    private async _executeWithBoltCheckout(payload: OrderRequestBody, _options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, paymentData } = payment;

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!paymentData || !isNonceLike(paymentData)) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, _options));

        return this._store.dispatch(this._paymentActionCreator.submitPayment({
            methodId,
            paymentData,
        }));
    }
}
