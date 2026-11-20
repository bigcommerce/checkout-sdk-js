import { Response } from '@bigcommerce/request-sender';

import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

const isRequestResponse = (error: unknown): error is Response<unknown> => isRequestError(error);

export default isRequestResponse;
