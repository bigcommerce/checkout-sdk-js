import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/concat';

import { createAction, createErrorAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { omit, pick } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, NotInitializedError } from '../common/error/errors';
import { InternalOrder, OrderActionCreator } from '../order';

import Payment, { CreditCard, VaultedInstrument } from './payment';
import * as actionTypes from './payment-action-types';
import PaymentMethod from './payment-method';
import PaymentMethodSelector from './payment-method-selector';
import PaymentRequestBody from './payment-request-body';
import PaymentRequestSender from './payment-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaymentActionCreator {
    constructor(
        private _paymentRequestSender: PaymentRequestSender,
        private _orderActionCreator: OrderActionCreator
    ) {}

    submitPayment(payment: Payment): ThunkAction<Action, InternalCheckoutSelectors> {
        return store =>
            Observable.create((observer: Observer<Action>) => {
                observer.next(createAction(actionTypes.SUBMIT_PAYMENT_REQUESTED));

                return this._paymentRequestSender.submitPayment(
                    this._getPaymentRequestBody(payment, store.getState())
                )
                    .then(({ body }) => {
                        observer.next(createAction(actionTypes.SUBMIT_PAYMENT_SUCCEEDED, body));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(actionTypes.SUBMIT_PAYMENT_FAILED, response));
                    });
            })
                .concat(Observable.defer(() => {
                    const state = store.getState();
                    const order = state.order.getOrder();

                    if (!order || !order.orderId) {
                        throw new MissingDataError('Unable to reload order data because "order.orderId" is missing');
                    }

                    return this._orderActionCreator.loadOrder(order.orderId);
                }));
    }

    initializeOffsitePayment(payment: Payment): ThunkAction<Action, InternalCheckoutSelectors> {
        return store =>
            Observable.create((observer: Observer<Action>) => {
                observer.next(createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED));

                return this._paymentRequestSender.initializeOffsitePayment(
                    this._getPaymentRequestBody(payment, store.getState())
                )
                    .then(() => {
                        observer.next(createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED));
                        observer.complete();
                    })
                    .catch(() => {
                        observer.error(createErrorAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_FAILED));
                    });
            });
    }

    private _getPaymentRequestBody(payment: Payment, state: InternalCheckoutSelectors): PaymentRequestBody {
        const deviceSessionId = payment.paymentData && (payment.paymentData as CreditCard).deviceSessionId || state.quote.getQuoteMeta().request.deviceSessionId;
        const billingAddress = state.billingAddress.getBillingAddress();
        const cart = state.cart.getCart();
        const customer = state.customer.getCustomer();
        const order = state.order.getOrder() as InternalOrder;
        const paymentMethod = this._getPaymentMethod(payment, state.paymentMethods);
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const shippingOption = state.shippingOptions.getSelectedShippingOption();
        const config = state.config.getStoreConfig();
        const instrumentMeta = state.instruments.getInstrumentsMeta();

        if (!config) {
            throw new NotInitializedError('Config data is missing');
        }

        const authToken = payment.paymentData && (payment.paymentData as VaultedInstrument).instrumentId
            ? `${state.order.getPaymentAuthToken()}, ${instrumentMeta.vaultAccessToken}`
            : state.order.getPaymentAuthToken();

        if (!authToken) {
            throw new MissingDataError('Unable to submit payment because "authToken" is missing.');
        }

        return {
            billingAddress,
            cart,
            customer,
            order,
            paymentMethod,
            shippingAddress,
            shippingOption,
            authToken,
            orderMeta: state.order.getOrderMeta(),
            payment: omit(payment.paymentData, ['deviceSessionId']) as Payment,
            quoteMeta: {
                request: {
                    ...state.quote.getQuoteMeta().request,
                    deviceSessionId,
                },
            },
            source: payment.source || 'bcapp-checkout-uco',
            store: pick(config.storeProfile, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    private _getPaymentMethod(payment: Payment, paymentMethodSelector: PaymentMethodSelector): PaymentMethod | undefined {
        const paymentMethod = paymentMethodSelector.getPaymentMethod(payment.name, payment.gateway);

        return (paymentMethod && paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
