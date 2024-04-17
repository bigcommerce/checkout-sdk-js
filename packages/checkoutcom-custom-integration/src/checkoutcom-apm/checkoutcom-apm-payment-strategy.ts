import {
    CreditCardInstrument,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInstrument,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithDocumentInstrument } from '../checkoutcom';
import CheckoutComCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const DOCUMENT_SUPPORTED_APMS = ['boleto', 'oxxo', 'qpay', 'ideal'];

export default class CheckoutComAPMPaymentStrategy extends CheckoutComCustomPaymentStrategy {
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
        paymentData: PaymentInstrument | (CreditCardInstrument & WithDocumentInstrument),
    ): WithDocumentInstrument {
        const formattedPayload: WithDocumentInstrument = { ccDocument: '' };
        const ccDocument = 'ccDocument' in paymentData ? paymentData.ccDocument : '';

        if (DOCUMENT_SUPPORTED_APMS.indexOf(methodId) !== -1 && ccDocument) {
            formattedPayload.ccDocument = ccDocument;
        }

        return formattedPayload;
    }
}
