import { RequestSender } from '@bigcommerce/request-sender';

import { PaymentsAPIResponse } from './ppsdk-payments-api-response';
import { StepHandler } from './step-handler';

interface ResumeSettings {
    paymentId: string;
    bigpayBaseUrl: string;
}

export class PaymentResumer {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    resume({ paymentId, bigpayBaseUrl }: ResumeSettings): Promise<void> {
        return this._requestSender.get<PaymentsAPIResponse['body']>(`${bigpayBaseUrl}/payments/${paymentId}`)
            .then(response => this._stepHandler.handle(response));
    }
}
