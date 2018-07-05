import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentRequestOptions,
} from '../..';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { toFormUrlEncoded } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { ChasePayScriptLoader, ChasePaySuccessPayload } from '../../../payment/strategies/chasepay';
import PaymentStrategy from '../payment-strategy';

export default class ChasepayPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _requestSender: RequestSender
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const cart = state.cart.getCart();
                const storeConfig = state.config.getStoreConfig();

                if (!cart || !storeConfig || !this._paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                return this._chasePayScriptLoader.load(this._paymentMethod.config.testMode)
                    .then(({ ChasePay }) => {
                        ChasePay.on(ChasePay.EventType.START_CHECKOUT, () => {
                            this._refreshDigitalSessionId(methodId)
                                .then(digitalSessionId => {
                                    ChasePay.startCheckout(digitalSessionId);
                                });
                        });
                        ChasePay.on(ChasePay.EventType.COMPLETE_CHECKOUT, (payload: ChasePaySuccessPayload) => this._setExternalCheckoutData(payload));
                    });
          })
          .then(() => super.initialize(options));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paymentInitData = this._paymentMethod.initializationData;

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment, paymentData: {
                        cryptogramId: paymentInitData.paymentCryptogram,
                        eci: paymentInitData.eci,
                        transactionId: btoa(paymentInitData.reqTokenId),
                        ccExpiry: {
                            month: paymentInitData.expDate.toString().substr(0, 2),
                            year: paymentInitData.expDate.toString().substr(2, 2),
                        },
                        ccNumber: paymentInitData.accountNum,
                        accountMask: paymentInitData.accountMask,
                    },
                }))
            );
    }

    private _refreshDigitalSessionId(methodId: string): Promise<string | undefined> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                if (!this._paymentMethod) {
                    return;
                }
                return this._paymentMethod.initializationData.digitalSessionId;
            });
    }

    private _setExternalCheckoutData(payload: ChasePaySuccessPayload): Promise<Response> {
        const url = `checkout.php?provider=chasepay&action=set_external_checkout`;
        const options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: toFormUrlEncoded({
                sessionToken: payload.sessionToken,
            }),
        };

        return this._requestSender.post(url, options);
    }
}

export interface ChasePayInitializeOptions {
    container: string;
}
