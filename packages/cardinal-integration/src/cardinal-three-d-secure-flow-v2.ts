import { merge, some } from 'lodash';

import {
    HostedForm,
    isCreditCardInstrument,
    isVaultedInstrument,
    OrderPaymentRequestBody,
    OrderRequestBody,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CardinalThreeDSecureToken } from './cardinal';
import CardinalClient, { CardinalOrderData } from './cardinal-client';

export default class CardinalThreeDSecureFlowV2 {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _cardinalClient: CardinalClient,
    ) {}

    async prepare(method: PaymentMethod): Promise<void> {
        await this._cardinalClient.load(method.id, method.config.testMode);
    }

    async start(
        execute: PaymentStrategy['execute'],
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
        hostedForm?: HostedForm,
    ): Promise<void> {
        const { getCardInstrument } = this._paymentIntegrationService.getState();
        const { payment = { methodId: '' } } = payload;
        const { paymentData = {} } = payment;

        try {
            return await execute(payload, options);
        } catch (error) {
            if (
                error instanceof RequestError &&
                error.body.status === 'additional_action_required'
            ) {
                const token = error.body.additional_action_required?.data?.token;
                const xid = error.body.three_ds_result?.payer_auth_request;

                await this._cardinalClient.configure(token);

                const bin = this._getBin(paymentData, getCardInstrument, hostedForm);

                if (bin) {
                    await this._cardinalClient.runBinProcess(bin);
                }

                try {
                    return await this._submitPayment(payment, { xid }, hostedForm);
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                } catch (error) {
                    if (
                        error instanceof RequestError &&
                        some(error.body.errors, { code: 'three_d_secure_required' })
                    ) {
                        const threeDsResult = error.body.three_ds_result;
                        const threeDsToken = threeDsResult?.payer_auth_request;

                        await this._cardinalClient.getThreeDSecureData(
                            threeDsResult,
                            this._getOrderData(),
                        );

                        return this._submitPayment(payment, { token: threeDsToken }, hostedForm);
                    }

                    throw error;
                }
            }

            throw error;
        }
    }

    private _getOrderData(): CardinalOrderData {
        const store = this._paymentIntegrationService.getState();
        const billingAddress = store.getBillingAddressOrThrow();
        const shippingAddress = store.getShippingAddress();
        const {
            cart: {
                currency: { code: currencyCode },
                cartAmount: amount,
            },
        } = store.getCheckoutOrThrow();
        const id = store.getOrderOrThrow().orderId.toString();

        return { billingAddress, shippingAddress, currencyCode, id, amount };
    }

    private async _submitPayment(
        payment: OrderPaymentRequestBody,
        threeDSecure: CardinalThreeDSecureToken,
        hostedForm?: HostedForm,
    ): Promise<void> {
        const paymentPayload = merge({}, payment, { paymentData: { threeDSecure } });

        if (!hostedForm) {
            await this._paymentIntegrationService.submitPayment(paymentPayload);
        }

        await hostedForm?.submit(paymentPayload);
    }

    private _getBin(
        paymentData: NonNullable<OrderPaymentRequestBody['paymentData']>,
        getCardInstrument: PaymentIntegrationSelectors['getCardInstrument'],
        hostedForm?: HostedForm,
    ): string {
        const instrument =
            isVaultedInstrument(paymentData) && getCardInstrument(paymentData.instrumentId);
        const ccNumber = isCreditCardInstrument(paymentData) && paymentData.ccNumber;
        const hostedFormBin = hostedForm ? hostedForm.getBin() : ccNumber;
        const bin = instrument ? instrument.iin : hostedFormBin;

        return bin || '';
    }
}
