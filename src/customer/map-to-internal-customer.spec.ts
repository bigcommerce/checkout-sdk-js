import { getCheckout } from '../checkout/checkouts.mock';
import { getCustomer as getInternalCustomer, getGuestCustomer as getInternalGuestCustomer } from '../customer/internal-customers.mock';

import { getCart } from '../cart/carts.mock';

import { getCustomer } from './customers.mock';
import mapToInternalCustomer from './map-to-internal-customer';

describe('mapToInternalCustomer', () => {
    it('maps to internal guest customer', () => {
        expect(mapToInternalCustomer(getCheckout()))
            .toEqual(getInternalGuestCustomer());
    });

    it('maps to internal customer', () => {
        const checkout = { ...getCheckout(), customer: getCustomer(), cart: { ...getCart(), customerId: 4 } };

        expect(mapToInternalCustomer(checkout))
            .toEqual(getInternalCustomer());
    });
});
