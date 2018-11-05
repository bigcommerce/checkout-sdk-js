import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { BraintreePaypalButtonStrategy, CheckoutButtonStrategy } from './strategies';

describe('createCheckoutButtonRegistry', () => {
    let registry: Registry<CheckoutButtonStrategy>;

    beforeEach(() => {
        registry = createCheckoutButtonRegistry(createCheckoutStore(), createRequestSender(), 'https://example.com');
    });

    it('returns registry with Braintree PayPal registered', () => {
        expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with Braintree PayPal Credit registered', () => {
        expect(registry.get('braintreepaypalcredit')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    describe('without a provided host', () => {
        beforeEach(() => {
            registry = createCheckoutButtonRegistry(createCheckoutStore(), createRequestSender());
        });

        it('returns registry with Braintree PayPal registered', () => {
            expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
        });

        it('returns registry with Braintree PayPal Credit registered', () => {
            expect(registry.get('braintreepaypalcredit')).toEqual(expect.any(BraintreePaypalButtonStrategy));
        });
    });
});
