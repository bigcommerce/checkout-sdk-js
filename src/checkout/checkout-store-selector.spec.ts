import { find, reject } from 'lodash';

import { mapToInternalAddress } from '../address';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { mapToInternalCart } from '../cart';
import { getCustomer } from '../customer/internal-customers.mock';
import { getFormFields } from '../form/form.mocks';
import { getUnitedStates } from '../geography/countries.mock';
import { mapToInternalOrder } from '../order';
import { getBraintree } from '../payment/payment-methods.mock';
import { mapToInternalQuote } from '../quote';
import { getQuote } from '../quote/internal-quotes.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';
import { getAustralia } from '../shipping/shipping-countries.mock';

import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreState from './checkout-store-state';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutStoreSelector', () => {
    let state: CheckoutStoreState;
    let internalSelectors: InternalCheckoutSelectors;
    let selector: CheckoutStoreSelector;

    beforeEach(() => {
        state = getCheckoutStoreStateWithOrder();
        internalSelectors = createInternalCheckoutSelectors(state);
        selector = new CheckoutStoreSelector(internalSelectors);
    });

    it('returns checkout data', () => {
        expect(selector.getCheckout()).toEqual(internalSelectors.checkout.getCheckout());
    });

    it('returns order', () => {
        expect(selector.getOrder()).toEqual(mapToInternalOrder(internalSelectors.order.getOrder()));
    });

    it('returns quote', () => {
        expect(selector.getQuote()).toEqual(mapToInternalQuote(selector.getCheckout()));
    });

    it('returns config', () => {
        expect(selector.getConfig()).toEqual(internalSelectors.config.getStoreConfig());
    });

    it('returns shipping options', () => {
        expect(selector.getShippingOptions()).toEqual(getShippingOptions());
    });

    it('returns shipping countries', () => {
        expect(selector.getShippingCountries()).toEqual(internalSelectors.shippingCountries.getShippingCountries());
    });

    it('returns billing countries', () => {
        expect(selector.getBillingCountries()).toEqual(internalSelectors.countries.getCountries());
    });

    it('returns payment methods', () => {
        expect(selector.getPaymentMethods()).toEqual(internalSelectors.paymentMethods.getPaymentMethods());
    });

    it('returns payment method', () => {
        expect(selector.getPaymentMethod('braintree')).toEqual(internalSelectors.paymentMethods.getPaymentMethod('braintree'));
    });

    it('returns cart', () => {
        expect(selector.getCart()).toEqual(mapToInternalCart(internalSelectors.checkout.getCheckout()));
    });

    it('returns customer', () => {
        expect(selector.getCustomer()).toEqual(getCustomer()) ;
    });

    it('returns billing address', () => {
        expect(selector.getBillingAddress()).toEqual(mapToInternalAddress(internalSelectors.billingAddress.getBillingAddress()));
    });

    it('returns shipping address', () => {
        expect(selector.getShippingAddress()).toEqual(mapToInternalAddress(internalSelectors.shippingAddress.getShippingAddress()));
    });

    it('returns instruments', () => {
        expect(selector.getInstruments()).toEqual(internalSelectors.instruments.getInstruments());
    });

    it('returns flag indicating if payment is submitted', () => {
        expect(selector.isPaymentDataSubmitted('braintree')).toEqual(true);
    });

    it('returns shipping address fields', () => {
        const results = selector.getShippingAddressFields('AU');
        const predicate = ({ name }) => name === 'stateOrProvince' || name === 'stateOrProvinceCode' || name === 'countryCode';

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(find(results, { name: 'stateOrProvinceCode' }).options.items)
            .toEqual(getAustralia().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });

    it('returns billing address fields', () => {
        const results = selector.getBillingAddressFields('US');
        const predicate = ({ name }) => name === 'stateOrProvince' || name === 'stateOrProvinceCode' || name === 'countryCode';

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(find(results, { name: 'stateOrProvinceCode' }).options.items)
            .toEqual(getUnitedStates().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });
});
