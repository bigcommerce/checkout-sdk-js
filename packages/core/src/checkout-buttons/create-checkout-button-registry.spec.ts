import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonStrategy } from './strategies';
// import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import {
    BraintreePaypalButtonStrategy,
    BraintreePaypalCreditButtonStrategy,
} from './strategies/braintree';

describe('createCheckoutButtonRegistry', () => {
    let registry: Registry<CheckoutButtonStrategy>;

    beforeEach(() => {
        const store = createCheckoutStore();

        registry = createCheckoutButtonRegistry(
            store,
            createRequestSender(),
            createFormPoster(),
            'en',
        );
    });

    // it('returns registry with AmazonPayV2 registered', () => {
    //     expect(registry.get('amazonpay')).toEqual(expect.any(AmazonPayV2ButtonStrategy));
    // });

    it('returns registry with Braintree PayPal registered', () => {
        expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with Braintree PayPal Credit registered', () => {
        expect(registry.get('braintreepaypalcredit')).toEqual(
            expect.any(BraintreePaypalCreditButtonStrategy),
        );
    });
});
