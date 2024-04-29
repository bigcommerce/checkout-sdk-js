import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import {
    BraintreePaypalButtonStrategy,
    BraintreePaypalCreditButtonStrategy,
    BraintreeVenmoButtonStrategy,
} from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';

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

    it('returns registry with AmazonPayV2 registered', () => {
        expect(registry.get('amazonpay')).toEqual(expect.any(AmazonPayV2ButtonStrategy));
    });

    it('returns registry with Braintree PayPal registered', () => {
        expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with Braintree PayPal Credit registered', () => {
        expect(registry.get('braintreepaypalcredit')).toEqual(
            expect.any(BraintreePaypalCreditButtonStrategy),
        );
    });

    it('returns registry with Braintree Venmo registered', () => {
        expect(registry.get('braintreevenmo')).toEqual(expect.any(BraintreeVenmoButtonStrategy));
    });

    it('returns registry with GooglePay on Authorize.Net Credit registered', () => {
        expect(registry.get('googlepayauthorizenet')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Bank of New Zealand Credit registered', () => {
        expect(registry.get('googlepaybnz')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on CybersourceV2 Credit registered', () => {
        expect(registry.get('googlepaycybersourcev2')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Orbital Credit registered', () => {
        expect(registry.get('googlepayorbital')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Stripe Credit registered', () => {
        expect(registry.get('googlepaystripe')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on StripeUPE Credit registered', () => {
        expect(registry.get('googlepaystripeupe')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on WorldpayAccess Credit registered', () => {
        expect(registry.get('googlepayworldpayaccess')).toEqual(
            expect.any(GooglePayButtonStrategy),
        );
    });
});
