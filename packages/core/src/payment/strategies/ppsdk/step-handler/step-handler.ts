import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

import { isContinue, ContinueHandler } from './continue-handler';
import { handleError, isError } from './error';
import { handleFailure, isFailure } from './failure';
import { handleSuccess, isSuccess } from './success';
import { handleUnsupported } from './unsupported';

export class StepHandler {
    constructor(
        private  _continueHandler: ContinueHandler
    ) {}

    handle(response: PaymentsAPIResponse): Promise<void> {
        const { body } = response;

        if (isSuccess(body)) {
            return handleSuccess();
        }

        if (isContinue(body)) {
            return this._continueHandler.handle(body);
        }

        if (isFailure(response)) {
            return handleFailure(response);
        }

        if (isError(response)) {
            return handleError(response);
        }

        return handleUnsupported(response);
    }
}
