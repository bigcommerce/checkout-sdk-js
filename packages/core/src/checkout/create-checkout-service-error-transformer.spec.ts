import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import createCheckoutServiceErrorTransformer from './create-checkout-service-error-transformer';

describe('createCheckoutServiceErrorTransformer()', () => {
    it('appends debug information if in development mode', () => {
        const transformer = createCheckoutServiceErrorTransformer(true);
        const error = new MissingDataError(MissingDataErrorType.MissingCheckout);
        const originalMessage = error.message;

        expect(transformer.transform(error).message)
            .toEqual(`${originalMessage} The data could be unavailable because it has not loaded from the server yet. To fix this issue, you can try calling \`CheckoutService#loadCheckout\` before performing the same action again.`);
    });

    it('does not append debug information if not in development mode', () => {
        const transformer = createCheckoutServiceErrorTransformer(false);
        const error = new MissingDataError(MissingDataErrorType.MissingCheckout);
        const originalMessage = error.message;

        expect(transformer.transform(error).message)
            .toEqual(originalMessage);
    });
});
