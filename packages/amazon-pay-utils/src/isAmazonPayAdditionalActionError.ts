import { AmazonPayAdditionalActionErrorBody } from './amazon-pay-v2';

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export function isAmazonPayAdditionalActionErrorBody(
    errorBody: unknown,
): errorBody is AmazonPayAdditionalActionErrorBody {
    return (
        typeof errorBody === 'object' &&
        errorBody !== null &&
        'status' in errorBody &&
        'additional_action_required' in errorBody &&
        (errorBody as AmazonPayAdditionalActionErrorBody).status === 'additional_action_required' &&
        'data' in (errorBody as AmazonPayAdditionalActionErrorBody).additional_action_required &&
        'redirect_url' in
            (errorBody as AmazonPayAdditionalActionErrorBody).additional_action_required.data &&
        typeof (errorBody as AmazonPayAdditionalActionErrorBody).additional_action_required.data
            .redirect_url === 'string'
    );
}
/* eslint-enable @typescript-eslint/consistent-type-assertions */
