import isPaypalProviderError from './is-paypal-provider-error';

describe('isPaypalProviderError', () => {
    it('returns true if error paypalcommerce provider related', () => {
        const providerError = {
            status: 'error',
            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
            errors: [
                {
                    code: 'invalid_request_error',
                    message:
                        'Were experiencing difficulty processing your transaction. Please contact us or try again later.',
                },
                {
                    code: 'transaction_rejected',
                    message: 'Payment was declined. Please try again.',
                    provider_error: {
                        code: 'INSTRUMENT_DECLINED',
                    },
                },
            ],
        };

        expect(isPaypalProviderError(providerError)).toBe(true);
    });

    it('returns false if error not paypalcommerce provider related', () => {
        const notProviderError = {
            status: 'error',
            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
        };

        expect(isPaypalProviderError(notProviderError)).toBe(false);
    });
});
