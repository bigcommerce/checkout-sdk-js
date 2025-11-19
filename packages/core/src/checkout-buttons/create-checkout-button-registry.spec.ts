import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonStrategy } from './strategies';
import { PaypalButtonStrategy } from './strategies/paypal';

describe('createCheckoutButtonRegistry', () => {
    let registry: Registry<CheckoutButtonStrategy>;

    beforeEach(() => {
        const store = createCheckoutStore();

        registry = createCheckoutButtonRegistry(store, createRequestSender(), createFormPoster());
    });

    it('returns registry with PayPal Express registered', () => {
        expect(registry.get('paypalexpress')).toEqual(expect.any(PaypalButtonStrategy));
    });
});
