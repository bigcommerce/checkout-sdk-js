import {
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInstrument,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithCheckoutcomSEPAInstrument } from '../checkoutcom';
import CheckoutComCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const CHECKOUTCOM_SEPA_PAYMENT_METHOD = 'sepa';

export default class CheckoutComSEPAPaymentStrategy extends CheckoutComCustomPaymentStrategy {
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
        paymentData: PaymentInstrument,
    ): WithCheckoutcomSEPAInstrument {
        const formattedPayload: WithCheckoutcomSEPAInstrument = { iban: '', bic: '' };
        const { iban, bic } =
            'iban' in paymentData && 'bic' in paymentData ? paymentData : formattedPayload;

        if (methodId === CHECKOUTCOM_SEPA_PAYMENT_METHOD && document) {
            formattedPayload.iban = iban;
            formattedPayload.bic = bic;
        }

        return formattedPayload;
    }
}
