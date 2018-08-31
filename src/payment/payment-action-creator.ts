import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { pick } from 'lodash';
import { concat } from 'rxjs/observable/concat';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { catchError, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { mapToInternalAddress } from '../address';
import { mapToInternalCart } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { InvalidArgumentError, StandardError } from '../common/error/errors';
import { mapToInternalCustomer } from '../customer';
import { mapToInternalOrder, OrderActionCreator } from '../order';
import { mapToInternalShippingOption } from '../shipping';

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
            of(createAction(PaymentActionType.SubmitPaymentRequested)),
            from(this._paymentRequestSender.submitPayment(
                this._getPaymentRequestBody(payment, store.getState())
            ))
                .pipe(
                    switchMap(({ body }) => concat(
                        this._orderActionCreator.loadCurrentOrder()(store),
                        of(createAction(PaymentActionType.SubmitPaymentSucceeded, body))
                    ))
                )
        ).pipe(
            catchError(error => throwErrorAction(PaymentActionType.SubmitPaymentFailed, error))
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
        if (!payment.paymentData) {
            throw new InvalidArgumentError('Unable to construct payment request because `payment.paymentData` is not provided.');
        }

        const billingAddress = state.billingAddress.getBillingAddress();
        const checkout = state.checkout.getCheckout();
        const customer = state.customer.getCustomer();
        const order = state.order.getOrder();
        const paymentMethod = this._getPaymentMethod(payment, state.paymentMethods);
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const consignments = state.consignments.getConsignments();
        const shippingOption = state.consignments.getShippingOption();
        const storeConfig = state.config.getStoreConfig();
        const contextConfig = state.config.getContextConfig();
        const instrumentMeta = state.instruments.getInstrumentsMeta();
        const paymentMeta = state.paymentMethods.getPaymentMethodsMeta();
        const orderMeta = state.order.getOrderMeta();
        const internalCustomer = customer && billingAddress && mapToInternalCustomer(customer, billingAddress);

        const authToken = instrumentMeta && isVaultedInstrument(payment.paymentData) ?
            `${state.payment.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}` :
            state.payment.getPaymentToken();

        if (!authToken) {
            throw new StandardError();
        }

        return {
            authToken,
            paymentMethod,
            customer: internalCustomer,
            billingAddress: billingAddress && mapToInternalAddress(billingAddress),
            shippingAddress: shippingAddress && mapToInternalAddress(shippingAddress, consignments),
            shippingOption: shippingOption && mapToInternalShippingOption(shippingOption, true),
            cart: checkout && mapToInternalCart(checkout),
            order: order && mapToInternalOrder(order, orderMeta),
            orderMeta,
            payment: payment.paymentData,
            quoteMeta: {
                request: {
                    ...paymentMeta,
                    geoCountryCode: contextConfig && contextConfig.geoCountryCode,
                },
            },
            source: 'bigcommerce-checkout-js-sdk',
            store: pick(storeConfig && storeConfig.storeProfile, [
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
