import { omit } from 'lodash';

import {
    HostedCreditCardInstrument,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    OrderPaymentRequestBody,
    PaymentAdditionalAction,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import HostedFormOrderData from './hosted-form-order-data';

export default class HostedFormOrderDataTransformer {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    transform(
        payload: OrderPaymentRequestBody,
        additionalAction?: PaymentAdditionalAction,
    ): HostedFormOrderData {
        const state = this.paymentIntegrationService.getState();
        const checkout = state.getCheckout();
        const config = state.getConfig();
        const instrumentMeta = state.getInstrumentsMeta();
        const order = state.getOrder();
        const orderMeta = state.getOrderMeta();
        const payment = omit(
            payload.paymentData,
            'ccExpiry',
            'ccName',
            'ccNumber',
            'ccCvv',
        ) as HostedCreditCardInstrument;
        const paymentMethod = state.getPaymentMethod(payload.methodId, payload.gatewayId);
        const paymentMethodMeta = state.getPaymentMethodsMeta();
        const authToken =
            instrumentMeta && payment && isVaultedInstrument(payment)
                ? `${state.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}`
                : state.getPaymentToken();

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
