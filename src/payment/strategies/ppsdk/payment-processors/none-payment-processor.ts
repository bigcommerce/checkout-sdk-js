import { RequestSender } from '@bigcommerce/request-sender';

import { PPSDKPaymentMethod } from '../../../ppsdk-payment-method';
import { PaymentProcessor } from '../ppsdk-payment-processor';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';
import { StepHandler } from '../step-handler';

export class NonePaymentProcessor implements PaymentProcessor {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    process(paymentMethod: PPSDKPaymentMethod) {
        const paymentMethodId = `${paymentMethod.id}.${paymentMethod.method}`;
        const body = { payment_method_id: paymentMethodId };

        return this._requestSender.post<PaymentsAPIResponse>('/payments', { body })
            .then(this._stepHandler.handle);
    }
}
