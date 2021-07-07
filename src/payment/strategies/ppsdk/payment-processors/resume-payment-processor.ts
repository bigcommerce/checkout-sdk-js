import { RequestSender } from '@bigcommerce/request-sender';

import { NotInitializedError, NotInitializedErrorType } from '../../../../common/error/errors';
import { PaymentProcessor, ProcessorSettings } from '../ppsdk-payment-processor';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';
import { StepHandler } from '../step-handler';

export class ResumePaymentProcessor implements PaymentProcessor {
    constructor(
        private _requestSender: RequestSender,
        private _stepHandler: StepHandler
    ) {}

    process({ paymentId, bigpayBaseUrl }: ProcessorSettings) {
        if (!paymentId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._requestSender.get<PaymentsAPIResponse['body']>(`${bigpayBaseUrl}/payments/${paymentId}`)
            .then(response => this._stepHandler.handle(response));
    }
}
