import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { get } from 'lodash';

import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export interface ErrorResponse extends PaymentsAPIResponse  {
    body: {
        type: 'error';
    };
}

export const isError = (response: PaymentsAPIResponse): response is ErrorResponse =>
    get(response.body, 'type') === 'error';

export const handleError = (response: ErrorResponse) =>
    Promise.reject(new RequestError(response));
