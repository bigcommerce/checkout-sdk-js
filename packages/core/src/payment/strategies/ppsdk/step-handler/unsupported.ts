import { RequestError } from '../../../../common/error/errors';
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export const handleUnsupported = (response: PaymentsAPIResponse) =>
    Promise.reject(new RequestError(response));
