import { getResponse } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayMerchantNotAuthorizedError from './errors/apple-pay-merchant-not-authorized-error';
import getMerchantValidationError from './get-merchant-validation-error';

describe('getMerchantValidationError', () => {
    it('returns ApplePayMerchantNotAuthorizedError if response status is 417', () => {
        const error = getMerchantValidationError(getResponse({}, {}, 417, 'Expectation Failed'));

        expect(error).toBeInstanceOf(ApplePayMerchantNotAuthorizedError);
    });

    it('returns generic error for other response statuses', () => {
        const error = getMerchantValidationError(getResponse({}, {}, 500, 'Internal Server Error'));

        expect(error).not.toBeInstanceOf(ApplePayMerchantNotAuthorizedError);
        expect(error.message).toBe('Merchant validation failed');
    });

    it('returns generic error for non-response values', () => {
        expect(getMerchantValidationError(false).message).toBe('Merchant validation failed');
    });
});
