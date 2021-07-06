import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export const isServerError = (status: number): boolean =>
    status < 200 || status >= 400;

export const handleServerError = (response: PaymentsAPIResponse) =>
    Promise.reject(new RequestError(response));
