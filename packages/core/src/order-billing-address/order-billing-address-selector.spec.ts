import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import OrderBillingAddressSelector, {
    createOrderBillingAddressSelectorFactory,
    OrderBillingAddressSelectorFactory,
} from './order-billing-address-selector';

describe('OrderBillingAddressSelector', () => {
    let orderBillingAddressSelector: OrderBillingAddressSelector;
    let createOrderCreateBillingAddressSelector: OrderBillingAddressSelectorFactory;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createOrderCreateBillingAddressSelector = createOrderBillingAddressSelectorFactory();
        state = getCheckoutStoreState();
    });

    it('returns the current billing address from order if present', () => {
        orderBillingAddressSelector = createOrderCreateBillingAddressSelector(
            state.orderBillingAddress,
        );

        expect(orderBillingAddressSelector.getOrderBillingAddress()).toEqual(
            state.orderBillingAddress.data,
        );
    });
});
