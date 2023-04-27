import { RequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

function getBody(code = 'three_d_secure_required') {
    return {
        status: 'error',
        three_ds_result: {
            acs_url: 'https://foo.com',
            callback_url: 'https://bar.com',
            code,
        },
        errors: [
            {
                code,
                message:
                    'Further authentication is required to process your payment. Please contact us.',
            },
        ],
    };
}

export default function getThreeDSecureRequestError() {
    return new RequestError(getResponse(getBody()));
}

export function getGenericRequestError() {
    return new RequestError(
        getResponse({
            status: 'error',
            three_ds_result: {
                code: 'processing_error',
                token: null,
            },
            errors: [],
        }),
    );
}

export function getThreeDSecureLikeRequestError() {
    return new RequestError(getResponse(getBody('additional_action_required')));
}
