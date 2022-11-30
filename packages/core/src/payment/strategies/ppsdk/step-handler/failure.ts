import { get, isString } from 'lodash';

import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface FailureResponse extends PaymentsAPIResponse {
    body: {
        type: 'failure';
        code: string;
    };
}

export const isFailure = (response: PaymentsAPIResponse): response is FailureResponse =>
    get(response.body, 'type') === 'failure' && isString(get(response.body, 'code'));

const toRequestErrorFormat = (failureResponse: FailureResponse) => ({
    ...failureResponse,
    body: {
        errors: [{ code: failureResponse.body.code }],
    },
});

export const handleFailure = (response: FailureResponse): Promise<void> =>
    Promise.reject(new RequestError(toRequestErrorFormat(response)));
