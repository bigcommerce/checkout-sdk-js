import { InternalCheckoutSelectors } from '../../../../checkout';
import { OrderRequestBody } from '../../../../order';
import { PaymentArgumentInvalidError } from '../../../errors';
import { PaymentInstrument, WithCheckoutcomFawryInstrument } from '../../../payment';
import { PaymentRequestOptions } from '../../../payment-request-options';
import CheckoutcomCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const CHECKOUTCOM_FAWRY_PAYMENT_METHOD = 'fawry';

export default class CheckoutcomFawryPaymentStrategy extends CheckoutcomCustomPaymentStrategy {
    protected async _executeWithoutHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

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
    ): WithCheckoutcomFawryInstrument | undefined {
        if (
            CHECKOUTCOM_FAWRY_PAYMENT_METHOD === methodId &&
            'customerMobile' in paymentData &&
            'customerEmail' in paymentData
        ) {
            return {
                customerMobile: paymentData.customerMobile,
                customerEmail: paymentData.customerEmail,
            };
        }
    }
}
