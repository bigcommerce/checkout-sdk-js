import { get } from 'lodash';

import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface Success {
    type: 'success';
}

export const isSuccess = (body: PaymentsAPIResponse['body']): body is Success =>
    get(body, 'type') === 'success';

export const handleSuccess = () => Promise.resolve();
