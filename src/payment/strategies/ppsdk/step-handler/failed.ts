import { get, isString } from 'lodash';

import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface FailedResponse extends PaymentsAPIResponse {
    body: {
        type: 'failed';
        code: string;
    };
}

export const isFailed = (response: PaymentsAPIResponse): response is FailedResponse =>
    get(response.body, 'type') === 'failed' &&
    isString(get(response.body, 'code'));

export const handleFailed = (response: FailedResponse): Promise<void> =>
    Promise.reject(new RequestError(response));
