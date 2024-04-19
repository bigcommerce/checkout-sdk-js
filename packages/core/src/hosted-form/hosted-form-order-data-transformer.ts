import { omit } from 'lodash';

import { ReadableCheckoutStore } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { OrderPaymentRequestBody } from '../order';
import {
    HostedCreditCardInstrument,
    isVaultedInstrument,
    PaymentAdditionalAction,
} from '../payment';

import HostedFormOrderData from './hosted-form-order-data';

export default class HostedFormOrderDataTransformer {
    constructor(private _store: ReadableCheckoutStore) {}

    transform(
        payload: OrderPaymentRequestBody,
        additionalAction?: PaymentAdditionalAction,
    ): HostedFormOrderData {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();
        const config = state.config.getConfig();
        const instrumentMeta = state.instruments.getInstrumentsMeta();
        const order = state.order.getOrder();
        const orderMeta = state.order.getOrderMeta();
        const payment = omit(
            payload.paymentData,
            'ccExpiry',
            'ccName',
            'ccNumber',
            'ccCvv',
        ) as HostedCreditCardInstrument;
        const paymentMethod = state.paymentMethods.getPaymentMethod(
            payload.methodId,
            payload.gatewayId,
        );
        const paymentMethodMeta = state.paymentMethods.getPaymentMethodsMeta();
        const authToken =
            instrumentMeta && payment && isVaultedInstrument(payment)
                ? `${state.payment.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}`
                : state.payment.getPaymentToken();

        if (!authToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        return {
            additionalAction,
            authToken,
            checkout,
            config,
            order,
            orderMeta,
            payment,
            paymentMethod,
            paymentMethodMeta,
        };
    }
}
