import { isArray, isObject, some } from 'lodash';

import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { TdOnlineMartAdditionalAction, TdOnlineMartThreeDSErrorBody } from '../types';

function isTdOnlineMartThreeDSErrorBody(
    errorBody: unknown,
): errorBody is TdOnlineMartThreeDSErrorBody {
    return (
        isObject(errorBody) &&
        typeof errorBody === 'object' &&
        'errors' in errorBody &&
        'three_ds_result' in errorBody &&
        isArray((errorBody as TdOnlineMartThreeDSErrorBody).errors) &&
        some((errorBody as TdOnlineMartThreeDSErrorBody).errors, {
            code: 'three_d_secure_required',
        })
    );
}
/* eslint-enable @typescript-eslint/consistent-type-assertions */

export function isTdOnlineMartAdditionalAction(
    error: unknown,
): error is TdOnlineMartAdditionalAction {
    return isRequestError(error) && isTdOnlineMartThreeDSErrorBody(error.body);
}
