import { RequestSender } from '@bigcommerce/request-sender';

import { PaymentProcessor, ProcessorSettings } from '../ppsdk-payment-processor';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';
import { StepHandler } from '../step-handler';

export class NonePaymentProcessor implements PaymentProcessor {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    process({ paymentMethod, bigpayBaseUrl, token }: ProcessorSettings) {
        const paymentMethodId = `${paymentMethod.id}.${paymentMethod.method}`;
        const body = { payment_method_id: paymentMethodId };
        const options = {
            credentials: false,
            body,
            headers: {
                authorization: token,
                'X-XSRF-TOKEN': null,
            },
        };

        return this._requestSender.post<PaymentsAPIResponse['body']>(`${bigpayBaseUrl}/payments`, options)
            .then(response => this._stepHandler.handle(response));
    }
}
