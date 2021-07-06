import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

import { isContinue, ContinueHandler } from './continue-handler';
import { handleError, isError } from './error';
import { handleFailed, isFailed } from './failed';
import { handleServerError, isServerError } from './server-error';
import { handleSuccess, isSuccess } from './success';
import { handleUnsupported } from './unsupported';

export class StepHandler {
    constructor(
        private  _continueHandler: ContinueHandler
    ) {}

    handle(response: PaymentsAPIResponse): Promise<void> {
        const { body, status } = response;

        if (isServerError(status)) {
            return handleServerError(response);
        }

        if (isSuccess(body)) {
            return handleSuccess();
        }

        if (isContinue(body)) {
            return this._continueHandler.handle(body);
        }

        if (isFailed(response)) {
            return handleFailed(response);
        }

        if (isError(response)) {
            return handleError(response);
        }

        return handleUnsupported(response);
    }
}
