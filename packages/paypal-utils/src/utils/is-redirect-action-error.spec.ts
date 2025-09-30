import isRedirectActionError from './is-redirect-action-error';

describe('isRedirectActionError', () => {
    it('returns true if error is redirect action type', () => {
        const redirectActionError = {
            status: 'error',
            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
            body: {
                additional_action_required: {
                    type: 'offsite_redirect',
                    data: {
                        redirect_url: 'https://example.redirect.com',
                    },
                },
            },
            errors: [
                {
                    code: 'invalid_request_error',
                    message:
                        "We're experiencing difficulty processing your transaction. Please contact us or try again later.",
                },
            ],
        };

        expect(isRedirectActionError(redirectActionError)).toBe(true);
    });

    it('returns false if error is not redirect action type', () => {
        const notRedirectActionError = {
            status: 'error',
            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
        };

        expect(isRedirectActionError(notRedirectActionError)).toBe(false);
    });
});
