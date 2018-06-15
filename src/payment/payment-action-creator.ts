import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { pick } from 'lodash';
import { concat } from 'rxjs/observable/concat';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { mapToInternalAddress } from '../address';
import { mapToInternalCart } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { mapToInternalOrder, OrderActionCreator } from '../order';

import isVaultedInstrument from './is-vaulted-instrument';
import Payment from './payment';
import { InitializeOffsitePaymentAction, PaymentActionType, SubmitPaymentAction } from './payment-actions';
import PaymentMethod from './payment-method';
import PaymentMethodSelector from './payment-method-selector';
import PaymentRequestBody from './payment-request-body';
import PaymentRequestSender from './payment-request-sender';

export default class PaymentActionCreator {
    constructor(
        private _paymentRequestSender: PaymentRequestSender,
        private _orderActionCreator: OrderActionCreator
    ) {}

    submitPayment(payment: Payment): ThunkAction<SubmitPaymentAction, InternalCheckoutSelectors> {
        return store => concat(
            Observable.create((observer: Observer<SubmitPaymentAction>) => {
                observer.next(createAction(PaymentActionType.SubmitPaymentRequested));

                return this._paymentRequestSender.submitPayment(
                    this._getPaymentRequestBody(payment, store.getState())
                )
                    .then(({ body }) => {
                        observer.next(createAction(PaymentActionType.SubmitPaymentSucceeded, body));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(PaymentActionType.SubmitPaymentFailed, response));
                    });
            }),
            this._orderActionCreator.loadCurrentOrder()(store)
        );
    }

    initializeOffsitePayment(payment: Payment): ThunkAction<InitializeOffsitePaymentAction, InternalCheckoutSelectors> {
        return store =>
            Observable.create((observer: Observer<InitializeOffsitePaymentAction>) => {
                observer.next(createAction(PaymentActionType.InitializeOffsitePaymentRequested));

                return this._paymentRequestSender.initializeOffsitePayment(
                    this._getPaymentRequestBody(payment, store.getState())
                )
                    .then(() => {
                        observer.next(createAction(PaymentActionType.InitializeOffsitePaymentSucceeded));
                        observer.complete();
                    })
                    .catch(() => {
                        observer.error(createErrorAction(PaymentActionType.InitializeOffsitePaymentFailed));
                    });
            });
    }

    private _getPaymentRequestBody(payment: Payment, state: InternalCheckoutSelectors): PaymentRequestBody {
        const billingAddress = state.billingAddress.getBillingAddress();
        const checkout = state.checkout.getCheckout();
        const customer = state.customer.getCustomer();
        const order = state.order.getOrder();
        const paymentMethod = this._getPaymentMethod(payment, state.paymentMethods);
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const shippingOption = state.shippingOptions.getSelectedShippingOption();
        const config = state.config.getStoreConfig();
        const instrumentMeta = state.instruments.getInstrumentsMeta();
        const paymentMeta = state.paymentMethods.getPaymentMethodsMeta();

        const authToken = payment.paymentData && instrumentMeta && isVaultedInstrument(payment.paymentData) ?
            `${state.payment.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}` :
            state.payment.getPaymentToken();

        if (!authToken || !payment.paymentData) {
            throw new MissingDataError('Unable to submit payment because "authToken" or "paymentData" is missing.');
        }

        return {
            authToken,
            billingAddress: billingAddress && mapToInternalAddress(billingAddress),
            customer,
            paymentMethod,
            shippingAddress: shippingAddress && mapToInternalAddress(shippingAddress),
            shippingOption,
            cart: checkout && mapToInternalCart(checkout),
            order: order && mapToInternalOrder(order),
            orderMeta: state.order.getOrderMeta(),
            payment: payment.paymentData,
            quoteMeta: {
                request: paymentMeta && paymentMeta.request,
            },
            source: 'bigcommerce-checkout-js-sdk',
            store: pick(config && config.storeProfile, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    private _getPaymentMethod(payment: Payment, paymentMethodSelector: PaymentMethodSelector): PaymentMethod | undefined {
        const paymentMethod = paymentMethodSelector.getPaymentMethod(payment.methodId, payment.gatewayId);

        return (paymentMethod && paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
