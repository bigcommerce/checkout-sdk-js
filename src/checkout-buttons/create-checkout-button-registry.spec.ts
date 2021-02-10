import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { BraintreePaypalButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';

describe('createCheckoutButtonRegistry', () => {
    let registry: Registry<CheckoutButtonStrategy>;

    beforeEach(() => {
        registry = createCheckoutButtonRegistry(createCheckoutStore(), createRequestSender(), createFormPoster());
    });

    it('returns registry with Braintree PayPal registered', () => {
        expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with Braintree PayPal Credit registered', () => {
        expect(registry.get('braintreepaypalcredit')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with GooglePay on Adyen Credit registered', () => {
        expect(registry.get('googlepayadyenv2')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Authorize.Net Credit registered', () => {
        expect(registry.get('googlepayauthorizenet')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Braintree Credit registered', () => {
        expect(registry.get('googlepaybraintree')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on CybersourceV2 Credit registered', () => {
        expect(registry.get('googlepaycybersourcev2')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Stripe Credit registered', () => {
        expect(registry.get('googlepaystripe')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with AmazonPayV2 registered', () => {
        expect(registry.get('amazonpay')).toEqual(expect.any(AmazonPayV2ButtonStrategy));
    });
});
