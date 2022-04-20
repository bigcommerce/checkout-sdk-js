import { merge, some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { RequestError } from '../../../common/error/errors';
import { HostedForm } from '../../../hosted-form';
import { OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { InstrumentSelector } from '../../instrument';
import isCreditCardLike from '../../is-credit-card-like';
import isVaultedInstrument from '../../is-vaulted-instrument';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { CardinalThreeDSecureToken } from './cardinal';
import CardinalClient, { CardinalOrderData } from './cardinal-client';

export default class CardinalThreeDSecureFlowV2 {
    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _cardinalClient: CardinalClient
    ) {}

    async prepare(method: PaymentMethod): Promise<void> {
        await this._cardinalClient.load(method.id, method.config.testMode);
    }

    async start(
        execute: PaymentStrategy['execute'],
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
        hostedForm?: HostedForm
    ): Promise<InternalCheckoutSelectors> {
        const { instruments: { getCardInstrument } } = this._store.getState();
        const { payment = { methodId: '' } } = payload;
        const { paymentData = {} } = payment;

        try {
            return await execute(payload, options);
        } catch (error) {
            if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                const token = error.body.additional_action_required?.data?.token;
                const xid = error.body.three_ds_result?.payer_auth_request;

                await this._cardinalClient.configure(token);

                const bin = this._getBin(paymentData, getCardInstrument, hostedForm);

                if (bin) {
                    await this._cardinalClient.runBinProcess(bin);
                }

                try {
                    return await this._submitPayment(payment, { xid }, hostedForm);
                } catch (error) {
                    if (error instanceof RequestError && some(error.body.errors, {code: 'three_d_secure_required'})) {
                        const threeDsResult = error.body.three_ds_result;
                        const token = threeDsResult?.payer_auth_request;

                        await this._cardinalClient.getThreeDSecureData(threeDsResult, this._getOrderData());

                        return await this._submitPayment(payment, { token }, hostedForm);
                    }

                    throw error;
                }
            }

            throw error;
        }
    }

    private _getOrderData(): CardinalOrderData {
        const store = this._store.getState();
        const billingAddress = store.billingAddress.getBillingAddressOrThrow();
        const shippingAddress = store.shippingAddress.getShippingAddress();
        const { cart: { currency: { code: currencyCode }, cartAmount: amount } } = store.checkout.getCheckoutOrThrow();
        const id = store.order.getOrderOrThrow().orderId.toString();

        return { billingAddress, shippingAddress, currencyCode, id, amount };
    }

    private async _submitPayment(
        payment: OrderPaymentRequestBody,
        threeDSecure: CardinalThreeDSecureToken,
        hostedForm?: HostedForm
    ): Promise<InternalCheckoutSelectors> {
        const paymentPayload = merge({}, payment, { paymentData: { threeDSecure } });

        if (!hostedForm) {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        }

        await hostedForm.submit(paymentPayload);

        return this._store.getState();
    }

    private _getBin(
        paymentData: NonNullable<OrderPaymentRequestBody['paymentData']>,
        getCardInstrument: InstrumentSelector['getCardInstrument'],
        hostedForm?: HostedForm
    ): string {
        const instrument = isVaultedInstrument(paymentData) && getCardInstrument(paymentData.instrumentId);
        const ccNumber = isCreditCardLike(paymentData) && paymentData.ccNumber;
        const bin = instrument ?
            instrument.iin :
            hostedForm ?
                hostedForm?.getBin() :
                ccNumber;

        return bin || '';
    }
}
