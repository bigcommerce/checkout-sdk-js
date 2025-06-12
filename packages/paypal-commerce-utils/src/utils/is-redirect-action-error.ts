import { ProviderError } from './is-paypal-commerce-provider-error';

export interface RedirectActionError extends ProviderError {
    additional_action_required: {
        type: 'offsite_redirect';
        data: {
            redirect_url: string;
        };
    };
}

export default function isRedirectActionError(error: unknown): error is RedirectActionError {
    return typeof error === 'object' && error !== null && 'additional_action_required' in error;
}
