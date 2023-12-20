import { InternalCheckoutSelectors } from '../../../../checkout';
import { OrderRequestBody } from '../../../../order';
import { PaymentArgumentInvalidError } from '../../../errors';
import { PaymentInstrument, WithCheckoutcomSEPAInstrument } from '../../../payment';
import { PaymentRequestOptions } from '../../../payment-request-options';
import CheckoutcomCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const CHECKOUTCOM_SEPA_PAYMENT_METHOD = 'sepa';

export default class CheckoutcomSEPAPaymentStrategy extends CheckoutcomCustomPaymentStrategy {
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
