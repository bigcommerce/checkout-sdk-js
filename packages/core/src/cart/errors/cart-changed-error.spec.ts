import { getCheckout } from '../../checkout/checkouts.mock';

import CartChangedError from './cart-changed-error';

describe('CartChangedError', () => {
    it('returns error name', () => {
        const error = new CartChangedError(getCheckout(), {
            ...getCheckout(),
            outstandingBalance: 0,
        });

        expect(error.name).toBe('CartChangedError');
        expect(error.data.previous).toEqual(getCheckout());
        expect(error.data.updated).toEqual({
            ...getCheckout(),
            outstandingBalance: 0,
        });
    });
});
