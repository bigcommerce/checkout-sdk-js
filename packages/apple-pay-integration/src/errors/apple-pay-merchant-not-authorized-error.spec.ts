import ApplePayMerchantNotAuthorizedError from './apple-pay-merchant-not-authorized-error';

describe('ApplePayMerchantNotAuthorizedError', () => {
    it('returns error name', () => {
        const error = new ApplePayMerchantNotAuthorizedError();

        expect(error.name).toBe('ApplePayMerchantNotAuthorizedError');
    });

    it('returns error type', () => {
        const error = new ApplePayMerchantNotAuthorizedError();

        expect(error.type).toBe('apple_pay_merchant_not_authorized_error');
    });

    it('returns error default message', () => {
        const error = new ApplePayMerchantNotAuthorizedError();

        expect(error.message).toBe(
            'Apple Pay is unavailable: the merchant ID is not authorized to process transactions on behalf of the root merchant ID. Please check the Mass Enablement or WWDR registration.',
        );
    });

    it('returns error custom message', () => {
        const error = new ApplePayMerchantNotAuthorizedError('This is a custom error message');

        expect(error.message).toBe('This is a custom error message');
    });
});
