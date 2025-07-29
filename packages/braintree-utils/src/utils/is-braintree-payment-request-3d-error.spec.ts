import isBraintreePaymentRequest3DSError, {
    BraintreePaymentRequest3DSError,
} from './is-braintree-payment-request-3ds-error';

describe('isBraintreePaymentRequest3DSError', () => {
    it('returns true for a valid BraintreePaymentRequest3DSError object', () => {
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

    it('returns false if top-level fields are incorrect', () => {
        const error = {
            name: 123,
            body: {},
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false if nested fields are missing', () => {
        const error = {
            name: 'ErrorName',
            body: {
                status: '400',
                errors: [],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false if payer_auth_request is not a string', () => {
        const error = {
            name: 'ErrorName',
            body: {
                status: '400',
                three_ds_result: {
                    payer_auth_request: 123,
                },
                errors: [],
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });

    it('returns false if errors is not an array', () => {
        const error = {
            name: 'ErrorName',
            body: {
                status: '400',
                three_ds_result: {
                    payer_auth_request: 'valid',
                },
                errors: null,
            },
        };

        expect(isBraintreePaymentRequest3DSError(error)).toBe(false);
    });
});
