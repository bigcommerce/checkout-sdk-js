import { RequestSender } from '@bigcommerce/request-sender';

import { PaymentsAPIResponse } from './ppsdk-payments-api-response';
import { StepHandler } from './step-handler';

interface ResumeSettings {
    token: string;
    paymentId: string;
    bigpayBaseUrl: string;
}

export class PaymentResumer {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    resume({ paymentId, bigpayBaseUrl, token }: ResumeSettings): Promise<void> {
        const options = {
            credentials: false,
            headers: {
                authorization: token,
                'X-XSRF-TOKEN': null,
            },
        };

        return this._requestSender.get<PaymentsAPIResponse['body']>(`${bigpayBaseUrl}/payments/${paymentId}`, options)
            .then(response => this._stepHandler.handle(response));
    }
}
