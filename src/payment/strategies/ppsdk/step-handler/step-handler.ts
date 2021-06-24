import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

import { isContinue, ContinueHandler } from './continue-handler';
import { handleError, isError } from './error';
import { handleFailed, isFailed } from './failed';
import { handleNetworkError, isNetworkError } from './network-error';
import { handleSuccess, isSuccess } from './success';
import { handleUnsupported } from './unsupported';

export class StepHandler {
    constructor(
        private  _continueHandler: ContinueHandler
    ) {}

    handle(response: PaymentsAPIResponse): Promise<void> {
        const { body, status } = response;

        if (isNetworkError(status)) {
            return handleNetworkError(response);
        }

        if (isSuccess(body)) {
            return handleSuccess();
        }

        if (isContinue(body)) {
            return this._continueHandler.handle(body);
        }

        if (isFailed(body)) {
            return handleFailed(response);
        }

        if (isError(body)) {
            return handleError(response);
        }

        return handleUnsupported(response);
    }
}
