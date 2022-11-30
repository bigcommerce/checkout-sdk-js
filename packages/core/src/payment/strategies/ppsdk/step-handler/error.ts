import { get } from 'lodash';

import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface ErrorResponse extends PaymentsAPIResponse {
    body: {
        type: 'error';
    };
}

export const isError = (response: PaymentsAPIResponse): response is ErrorResponse =>
    get(response.body, 'type') === 'error';

export const handleError = (response: ErrorResponse) => Promise.reject(new RequestError(response));
