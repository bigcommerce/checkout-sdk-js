import { InternalCheckoutSelectors } from '../../../../checkout';
import { OrderRequestBody } from '../../../../order';
import { PaymentArgumentInvalidError } from '../../../errors';
import { PaymentInstrument, WithDocumentInstrument } from '../../../payment';
import { PaymentRequestOptions } from '../../../payment-request-options';
import CheckoutcomCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const DOCUMENT_SUPPORTED_APMS = ['boleto', 'oxxo', 'qpay', 'ideal'];

export default class CheckoutcomAPMPaymentStrategy extends CheckoutcomCustomPaymentStrategy {
    protected async _executeWithoutHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment?.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        ...paymentData,
                        formattedPayload: this._createFormattedPayload(
                            payment.methodId,
                            paymentData,
                        ),
                    },
                }),
            );
        } catch (error) {
            return this._processResponse(error);
        }
    }

    private _createFormattedPayload(
        methodId: string,
        paymentData: PaymentInstrument,
    ): WithDocumentInstrument {
        const formattedPayload: WithDocumentInstrument = { ccDocument: '' };
        const ccDocument = 'ccDocument' in paymentData ? paymentData.ccDocument : '';

        if (DOCUMENT_SUPPORTED_APMS.indexOf(methodId) !== -1 && ccDocument) {
            formattedPayload.ccDocument = ccDocument;
        }

        return formattedPayload;
    }
}
