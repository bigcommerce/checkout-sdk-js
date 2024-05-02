import { merge, some } from 'lodash';

import {
    HostedForm,
    isVaultedInstrument,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CardinalClient, { CardinalOrderData } from './cardinal-client';

export default class CardinalThreeDSecureFlow {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _cardinalClient: CardinalClient,
    ) {}

    async prepare(method: PaymentMethod): Promise<void> {
        await this._cardinalClient.load(method.id, method.config.testMode);
        await this._cardinalClient.configure(await this._getClientToken(method));
    }

    async start(
        execute: PaymentStrategy['execute'],
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
        hostedForm?: HostedForm,
    ): Promise<void> {
        const { getCardInstrument, getPaymentMethodOrThrow } =
            this._paymentIntegrationService.getState();

        const { payment: { methodId = '', paymentData = {} } = {} } = payload;
        const instrument =
            isVaultedInstrument(paymentData) && getCardInstrument(paymentData.instrumentId);
        const bin = instrument ? instrument.iin : hostedForm && hostedForm.getBin();

        if (bin) {
            await this._cardinalClient.runBinProcess(bin);
        }

        try {
            return await execute(
                merge(payload, {
                    payment: {
                        paymentData: {
                            threeDSecure: { token: getPaymentMethodOrThrow(methodId).clientToken },
                        },
                    },
                }),
                options,
            );
        } catch (error) {
            if (
                !(error instanceof RequestError) ||
                !some(error.body.errors, { code: 'three_d_secure_required' })
            ) {
                throw error;
            }

            const threeDSecure = await this._cardinalClient.getThreeDSecureData(
                error.body.three_ds_result,
                this._getOrderData(),
            );

            if (!hostedForm) {
                await this._paymentIntegrationService.submitPayment(
                    merge(payload.payment, {
                        paymentData: { threeDSecure },
                    }),
                );

                return;
            }

            await hostedForm.submit(
                merge(payload.payment, {
                    paymentData: { threeDSecure },
                }),
            );
        }
    }

    private async _getClientToken(method: PaymentMethod): Promise<string> {
        if (method.clientToken) {
            return method.clientToken;
        }

        await this._paymentIntegrationService.loadPaymentMethod(method.id);

        const paymentMethod = this._paymentIntegrationService.getState().getPaymentMethodOrThrow(method.id);

        return paymentMethod.clientToken || '';
    }

    private _getOrderData(): CardinalOrderData {
        const state = this._paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const shippingAddress = state.getShippingAddress();
        const checkout = state.getCheckoutOrThrow();
        const order = state.getOrderOrThrow();

        console.log(billingAddress)
        console.log(shippingAddress)

        return {
            billingAddress,
            shippingAddress,
            currencyCode: checkout.cart.currency.code,
            id: order.orderId.toString(),
            amount: checkout.cart.cartAmount,
        };
    }
}
