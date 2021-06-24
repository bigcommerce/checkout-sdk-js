import { get, isString } from 'lodash';

import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface Failed {
    type: 'failed';
    code: string;
}

export const isFailed = (body: PaymentsAPIResponse['body']): body is Failed =>
    get(body, 'type') === 'failed' &&
    isString(get(body, 'code'));

export const handleFailed = (response: PaymentsAPIResponse): Promise<void> =>
    Promise.reject(new RequestError(response));
