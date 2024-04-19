export interface ProviderError extends Error {
    errors?: ErrorElement[];
    status?: string;
    three_ds_result?: {
        acs_url: unknown;
        payer_auth_request: unknown;
        merchant_data: unknown;
        callback_url: unknown;
    };
}

export interface ErrorElement {
    code: string;
    message: string;
    provider_error?: {
        code: string;
    };
}

export default function isPaypalCommerceProviderError(error: unknown): error is ProviderError {
    return typeof error === 'object' && error !== null && 'errors' in error;
}
