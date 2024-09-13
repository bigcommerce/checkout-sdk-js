import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import AmazonPayV2ConfigCreationError from './amazon-pay-v2-config-creation-error';

describe('AmazonPayV2ConfigCreationError', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw default error message', () => {
        const error = new AmazonPayV2ConfigCreationError();

        expect(error).toBeInstanceOf(StandardError);
        expect(error.message).toBe(
            'An unexpected error has occurred during config creation process. Please try again later.',
        );
        expect(error.name).toBe('AmazonPayV2ConfigCreationError');
        expect(error.type).toBe('amazon_pay_v2_config_creation_error');
    });

    it('should throw custom error message', () => {
        const error = new AmazonPayV2ConfigCreationError('Custom error message');

        expect(error.message).toBe('Custom error message');
    });
});
