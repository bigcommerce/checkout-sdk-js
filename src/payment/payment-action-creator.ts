import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { pick } from 'lodash';
import { concat, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { mapToInternalAddress } from '../address';
import { mapToInternalCart } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { StandardError } from '../common/error/errors';
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

    initializeOffsitePayment(
        methodId: string,
        gatewayId?: string
    ): ThunkAction<InitializeOffsitePaymentAction, InternalCheckoutSelectors> {
        return store => {
            const payload = this._getPaymentRequestBody({ gatewayId, methodId }, store.getState());

            return concat(
                of(createAction(PaymentActionType.InitializeOffsitePaymentRequested)),
                this._paymentRequestSender.initializeOffsitePayment(payload)
                    .then(() => createAction(PaymentActionType.InitializeOffsitePaymentSucceeded))
            ).pipe(
                catchError(error => throwErrorAction(PaymentActionType.InitializeOffsitePaymentFailed, error))
            );
        };
    }

    private _getPaymentRequestBody(payment: Payment, state: InternalCheckoutSelectors): PaymentRequestBody {
        const billingAddress = state.billingAddress.getBillingAddress();
        const checkout = state.checkout.getCheckout();
        const customer = state.customer.getCustomer();
        const order = state.order.getOrder();
        const paymentMethod = this._getPaymentMethod(state.paymentMethods, payment.methodId, payment.gatewayId);
        const shippingAddress = state.shippingAddress.getShippingAddress();
        const consignments = state.consignments.getConsignments();
        const shippingOption = state.consignments.getShippingOption();
        const storeConfig = state.config.getStoreConfig();
        const contextConfig = state.config.getContextConfig();
        const instrumentMeta = state.instruments.getInstrumentsMeta();
        const paymentMeta = state.paymentMethods.getPaymentMethodsMeta();
        const orderMeta = state.order.getOrderMeta();
        const internalCustomer = customer && billingAddress && mapToInternalCustomer(customer, billingAddress);

        const authToken = instrumentMeta && payment.paymentData && isVaultedInstrument(payment.paymentData) ?
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

    private _getPaymentMethod(
        paymentMethodSelector: PaymentMethodSelector,
        methodId: string,
        gatewayId?: string
    ): PaymentMethod | undefined {
        const paymentMethod = paymentMethodSelector.getPaymentMethod(methodId, gatewayId);

        if (!paymentMethod) {
            return;
        }

        if (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) {
            return { ...paymentMethod, gateway: paymentMethod.id };
        }

        if (paymentMethod.initializationData && paymentMethod.initializationData.gateway) {
            return { ...paymentMethod, id: paymentMethod.initializationData.gateway };
        }

        return paymentMethod;
    }
}
