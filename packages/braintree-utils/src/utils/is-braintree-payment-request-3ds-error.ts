export interface BraintreePayment3DSRequestErrors {
    code: string;
}

export interface BraintreePaymentRequest3DSError {
    name: string;
    body: {
        status: string;
        three_ds_result: {
            payer_auth_request: string;
        };
        errors: BraintreePayment3DSRequestErrors[];
    };
}

export default function isBraintreePaymentRequest3DSError(
    error: unknown,
): error is BraintreePaymentRequest3DSError {
    if (typeof error !== 'object' || error === null) {
        return false;
    }
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    return (
        'name' in error &&
        'body' in error &&
        'status' in (error as BraintreePaymentRequest3DSError).body &&
        'three_ds_result' in (error as BraintreePaymentRequest3DSError).body &&
        'payer_auth_request' in (error as BraintreePaymentRequest3DSError).body.three_ds_result &&
        'errors' in (error as BraintreePaymentRequest3DSError).body
    );
}
