import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ProviderError } from './is-paypal-commerce-provider-error';

export interface RedirectActionError extends ProviderError {
    body: {
        additional_action_required: {
            type: 'offsite_redirect';
            data: {
                redirect_url: string;
            };
        };
    };
}

export default function isRedirectActionError(error: unknown): error is RedirectActionError {
    return (
        isRequestError(error) && error.body.additional_action_required?.type === 'offsite_redirect'
    );
}
