import { Cart, StoreConfig } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getCart, getConfig } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import itemsRequireShipping from './items-require-shipping';

describe('itemsRequireShipping()', () => {
    let cart: Cart;
    let config: StoreConfig;

    beforeEach(() => {
        cart = getCart();
        config = getConfig().storeConfig;
        config.checkoutSettings.features['CHECKOUT-4936.enable_custom_item_shipping'] = true;
    });

    it('returns false if there are no physical items or custom items', () => {
        cart.lineItems.physicalItems = [];
        cart.lineItems.customItems = [];

        expect(itemsRequireShipping(cart, config)).toBe(false);
    });

    it('returns false if there is no cart', () => {
        expect(itemsRequireShipping(undefined, config)).toBe(false);
    });

    it('returns true if there are physical items', () => {
        expect(itemsRequireShipping(cart, config)).toBe(true);
    });

    it('returns true if there are only custom items', () => {
        cart.lineItems.physicalItems = [];

        expect(itemsRequireShipping(cart, config)).toBe(true);
    });
});
