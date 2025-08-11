import isBraintreePaymentRequest3DSError, {
    BraintreePaymentRequest3DSError,
} from './is-braintree-payment-request-3ds-error';

describe('isBraintreePaymentRequest3DSError', () => {
    it('returns true for a structurally valid object with all required fields', () => {
        const error: BraintreePaymentRequest3DSError = {
            name: 'SomeError',
            body: {
                status: '400',
                three_ds_result: {
                    payer_auth_request: 'some-auth-request',
                },
                errors: [{ code: 'three_d_secure_required' }],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(true);
    });

    it('returns false when top-level properties are missing', () => {
        const error: unknown = {
            body: {
                status: '400',
                three_ds_result: {
                    payer_auth_request: 'auth',
                },
                errors: [],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false when body is missing', () => {
        const error: unknown = {
            name: 'MissingBodyError',
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false when three_ds_result is missing', () => {
        const error: unknown = {
            name: 'Missing3DS',
            body: {
                status: '400',
                errors: [],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false when payer_auth_request is missing', () => {
        const error: unknown = {
            name: 'MissingAuthRequest',
            body: {
                status: '400',
                three_ds_result: {},
                errors: [],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false when errors is missing', () => {
        const error: unknown = {
            name: 'MissingErrors',
            body: {
                status: '400',
                three_ds_result: {
                    payer_auth_request: 'some-auth-request',
                },
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });
});
