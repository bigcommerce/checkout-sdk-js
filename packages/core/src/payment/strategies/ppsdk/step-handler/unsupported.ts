import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { PaymentsAPIResponse } from '../ppsdk-payments-api-response';

export const handleUnsupported = (response: PaymentsAPIResponse) =>
    Promise.reject(new RequestError(response));
