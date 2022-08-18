import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { createPaymentClient } from '../payment';

import createCheckoutButtonRegistry from './create-checkout-button-registry';
import { CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { ApplePayButtonStrategy } from './strategies/apple-pay';
import { BraintreePaypalButtonStrategy, BraintreePaypalCreditButtonStrategy, BraintreeVenmoButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { PaypalCommerceButtonStrategy, PaypalCommerceV2ButtonStrategy, PaypalCommerceVenmoButtonStrategy } from './strategies/paypal-commerce';

describe('createCheckoutButtonRegistry', () => {
    let registry: Registry<CheckoutButtonStrategy>;

    beforeEach(() => {
        const store = createCheckoutStore();
        const paymentClient = createPaymentClient(store);
        registry = createCheckoutButtonRegistry(store, paymentClient, createRequestSender(), createFormPoster(), 'en');
    });

    it('returns registry with ApplePay registered', () => {
        expect(registry.get('applepay')).toEqual(expect.any(ApplePayButtonStrategy));
    });

    it('returns registry with AmazonPayV2 registered', () => {
        expect(registry.get('amazonpay')).toEqual(expect.any(AmazonPayV2ButtonStrategy));
    });

    it('returns registry with Braintree PayPal registered', () => {
        expect(registry.get('braintreepaypal')).toEqual(expect.any(BraintreePaypalButtonStrategy));
    });

    it('returns registry with Braintree PayPal Credit registered', () => {
        expect(registry.get('braintreepaypalcredit')).toEqual(expect.any(BraintreePaypalCreditButtonStrategy));
    });

    it('returns registry with Braintree Venmo registered', () => {
        expect(registry.get('braintreevenmo')).toEqual(expect.any(BraintreeVenmoButtonStrategy));
    });

    it('returns registry with GooglePay on Adyen Credit registered', () => {
        expect(registry.get('googlepayadyenv2')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Adyenv3 Credit registered', () => {
        expect(registry.get('googlepayadyenv3')).toEqual(expect.any(GooglePayButtonStrategy));
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

    it('returns registry with GooglePay on Orbital Credit registered', () => {
        expect(registry.get('googlepayorbital')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on Stripe Credit registered', () => {
        expect(registry.get('googlepaystripe')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with GooglePay on StripeUPE Credit registered', () => {
        expect(registry.get('googlepaystripeupe')).toEqual(expect.any(GooglePayButtonStrategy));
    });

    it('returns registry with PayPal Commerce registered', () => {
        expect(registry.get('paypalcommerce')).toEqual(expect.any(PaypalCommerceButtonStrategy));
    });

    it('returns registry with PayPal Commerce V2 registered', () => {
        expect(registry.get('paypalcommercev2')).toEqual(expect.any(PaypalCommerceV2ButtonStrategy));
    });

    it('returns registry with PayPal Commerce Venmo registered', () => {
        expect(registry.get('paypalcommercevenmo')).toEqual(expect.any(PaypalCommerceVenmoButtonStrategy));
    });
});
