import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export const isNetworkError = (status: number): boolean =>
    status >= 400;

export const handleNetworkError = (response: PaymentsAPIResponse) =>
    Promise.reject(new RequestError(response));
