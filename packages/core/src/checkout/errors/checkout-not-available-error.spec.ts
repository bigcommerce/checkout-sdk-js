import { getErrorResponse } from '../../common/http-request/responses.mock';

import { CheckoutNotAvailableError } from '.';

describe('init', () => {
    it('sets type to checkout_not_available', () => {
        const error = new CheckoutNotAvailableError(getErrorResponse());

        expect(error.type).toEqual('checkout_not_available');
    });

    it('returns error name', () => {
        const error = new CheckoutNotAvailableError(getErrorResponse());

        expect(error.name).toEqual('CheckoutNotAvailableError');
    });

    it('sets the message as `body.title`', () => {
        const response = getErrorResponse();
        const error = new CheckoutNotAvailableError(response);

        expect(error.message).toEqual(response.body.title);
    });
});
