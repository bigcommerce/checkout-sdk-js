import { createAction, createErrorAction, Action, ReadableDataStore, ThunkAction } from '@bigcommerce/data-store';
import { omit, pick } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutSelector, CheckoutSelectors } from '../checkout';

import Payment, { CreditCard, VaultedInstrument } from './payment';
import * as actionTypes from './payment-action-types';
import PaymentMethod from './payment-method';
import PaymentRequestBody from './payment-request-body';
import PaymentRequestSender from './payment-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class PaymentActionCreator {
    constructor(
        private _paymentRequestSender: PaymentRequestSender
    ) {}

    submitPayment(payment: Payment): ThunkAction<Action> {
        return (store: ReadableDataStore<CheckoutSelectors>) =>
            Observable.create((observer: Observer<Action>) => {
                observer.next(createAction(actionTypes.SUBMIT_PAYMENT_REQUESTED));

                return this._paymentRequestSender.submitPayment(
                    this._getPaymentRequestBody(payment, store.getState().checkout)
                )
                    .then(({ body }) => {
                        observer.next(createAction(actionTypes.SUBMIT_PAYMENT_SUCCEEDED, body));
                        observer.complete();
                    })
                    .catch(response => {
                        observer.error(createErrorAction(actionTypes.SUBMIT_PAYMENT_FAILED, response));
                    });
            });
    }

    initializeOffsitePayment(payment: Payment): ThunkAction<Action> {
        return (store: ReadableDataStore<CheckoutSelectors>) =>
            Observable.create((observer: Observer<Action>) => {
                observer.next(createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED));

                return this._paymentRequestSender.initializeOffsitePayment(
                    this._getPaymentRequestBody(payment, store.getState().checkout)
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

    private _getPaymentRequestBody(payment: Payment, checkout: CheckoutSelector): PaymentRequestBody {
        const deviceSessionId = payment.paymentData && (payment.paymentData as CreditCard).deviceSessionId || checkout.getCheckoutMeta().deviceSessionId;
        const checkoutMeta = checkout.getCheckoutMeta();
        const billingAddress = checkout.getBillingAddress();
        const cart = checkout.getCart();
        const customer = checkout.getCustomer();
        const order = checkout.getOrder();
        const paymentMethod = checkout.getPaymentMethod(payment.name, payment.gateway);
        const shippingAddress = checkout.getShippingAddress();
        const shippingOption = checkout.getSelectedShippingOption();
        const config = checkout.getConfig();

        const authToken = payment.paymentData && (payment.paymentData as VaultedInstrument).instrumentId
            ? `${checkoutMeta.paymentAuthToken}, ${checkoutMeta.vaultAccessToken}`
            : checkoutMeta.paymentAuthToken;

        return {
            billingAddress,
            cart,
            customer,
            order,
            paymentMethod: paymentMethod ? this._getRequestPaymentMethod(paymentMethod) : undefined,
            shippingAddress,
            shippingOption,
            authToken,
            orderMeta: pick(checkoutMeta, ['deviceFingerprint']),
            payment: omit(payment.paymentData, ['deviceSessionId']) as Payment,
            quoteMeta: {
                request: {
                    ...pick(checkoutMeta, [
                        'geoCountryCode',
                        'sessionHash',
                    ]),
                    deviceSessionId,
                },
            },
            source: payment.source || 'bcapp-checkout-uco',
            store: pick(config, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    private _getRequestPaymentMethod(paymentMethod: PaymentMethod): PaymentMethod {
        return (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ?
            { ...paymentMethod, gateway: paymentMethod.id } :
            paymentMethod;
    }
}
