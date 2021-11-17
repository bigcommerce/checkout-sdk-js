import { RequestSender } from '@bigcommerce/request-sender';

import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';
import { PaymentProcessor, ProcessorSettings } from '../ppsdk-sub-strategy';
import { StepHandler } from '../step-handler';

export class NonePaymentProcessor implements PaymentProcessor {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    process({ methodId, bigpayBaseUrl, token }: ProcessorSettings) {
        const body = { payment_method_id: methodId };
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
