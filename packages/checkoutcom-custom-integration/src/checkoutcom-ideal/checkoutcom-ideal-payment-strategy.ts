import {
    CreditCardInstrument,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInstrument,
    PaymentRequestOptions,
    WithIdealInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import CheckoutComCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const CHECKOUTCOM_IDEAL_PAYMENT_METHOD = 'ideal';

export default class CheckoutComiDealPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected async _executeWithoutHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment?.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        try {
            await this._paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    ...paymentData,
                    formattedPayload: this._createFormattedPayload(
                        payment.methodId,
                        paymentData as PaymentInstrument,
                    ),
                },
            });
        } catch (error) {
            return this._processResponse(error);
        }
    }

    private _createFormattedPayload(
        methodId: string,
        paymentData: PaymentInstrument | (CreditCardInstrument & WithIdealInstrument),
    ): WithIdealInstrument | undefined {
        if (CHECKOUTCOM_IDEAL_PAYMENT_METHOD === methodId && 'bic' in paymentData) {
            return { bic: paymentData.bic };
        }
    }
}
