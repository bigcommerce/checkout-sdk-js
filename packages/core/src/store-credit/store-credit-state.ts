import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";

import { StorefrontErrorResponseBody } from '../common/error';

export default interface StoreCreditState {
    errors: StoreCreditErrorsState;
    statuses: StoreCreditStatusesState;
}

export interface StoreCreditErrorsState {
    applyError?: RequestError<StorefrontErrorResponseBody>;
}

export interface StoreCreditStatusesState {
    isApplying?: boolean;
}

export const DEFAULT_STATE: StoreCreditState = {
    errors: {},
    statuses: {},
};
