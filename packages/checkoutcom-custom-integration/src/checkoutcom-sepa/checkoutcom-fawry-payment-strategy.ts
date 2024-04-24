import {
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInstrument,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithCheckoutcomFawryInstrument } from '../checkoutcom';
import CheckoutComCustomPaymentStrategy from '../checkoutcom-custom-payment-strategy';

const CHECKOUTCOM_FAWRY_PAYMENT_METHOD = 'fawry';

export default class CheckoutComFawryPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected async _executeWithoutHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

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
    ): WithCheckoutcomFawryInstrument | undefined {
        if (
            CHECKOUTCOM_FAWRY_PAYMENT_METHOD === methodId &&
            'customerMobile' in paymentData &&
            'customerEmail' in paymentData
        ) {
            const fawryPaymentData = paymentData as {
                customerMobile: string;
                customerEmail: string;
            };

            return {
                customerMobile: fawryPaymentData.customerMobile,
                customerEmail: fawryPaymentData.customerEmail,
            };
        }
    }
}
