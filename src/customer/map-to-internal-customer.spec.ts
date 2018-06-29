import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getCustomer as getInternalCustomer, getGuestCustomer as getInternalGuestCustomer } from '../customer/internal-customers.mock';

import { getGuestCustomer } from './customers.mock';
import mapToInternalCustomer from './map-to-internal-customer';

describe('mapToInternalCustomer', () => {
    it('maps to internal guest customer', () => {
        expect(mapToInternalCustomer(getGuestCustomer(), { ...getCart(), customerId: 0 }, getBillingAddress()))
            .toEqual(getInternalGuestCustomer());
    });

    it('maps to internal customer', () => {
        const checkout = getCheckout();

        // tslint:disable-next-line:no-non-null-assertion
        expect(mapToInternalCustomer(checkout.customer, checkout.cart, checkout.billingAddress!))
            .toEqual(getInternalCustomer());
    });
});
