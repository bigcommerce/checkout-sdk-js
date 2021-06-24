import { get } from 'lodash';

import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface Error  {
    type: 'error';
}

export const isError = (body: PaymentsAPIResponse['body']): body is Error =>
    get(body, 'type') === 'error';

export const handleError = (response: PaymentsAPIResponse) =>
    Promise.reject(new RequestError(response));
