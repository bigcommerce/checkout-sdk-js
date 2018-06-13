import { find, reject } from 'lodash';

import { getFormFields } from '../form/form.mocks';
import { getUnitedStates } from '../geography/countries.mock';
import { mapToInternalOrder } from '../order';
import { getBraintree } from '../payment/payment-methods.mock';
import { getAustralia } from '../shipping/shipping-countries.mock';

import { getCheckoutStoreState } from './checkouts.mock';
import CheckoutStoreSelector from './checkout-store-selector';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';

describe('CheckoutStoreSelector', () => {
    let selector;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreState();
        selector = new CheckoutStoreSelector(createInternalCheckoutSelectors(state));
    });

    it('returns checkout data', () => {
        expect(selector.getCheckout()).toEqual(state.checkout.data);
    });

    it('returns order', () => {
        expect(selector.getOrder()).toEqual(mapToInternalOrder(state.order.data));
    });

    it('returns quote', () => {
        expect(selector.getQuote()).toEqual(state.quote.data);
    });

    it('returns config', () => {
        expect(selector.getConfig()).toEqual(state.config.data.storeConfig);
    });

    it('returns shipping options', () => {
        expect(selector.getShippingOptions()).toEqual(getShippingOptions());
    });

    it('returns shipping countries', () => {
        expect(selector.getShippingCountries()).toEqual(state.shippingCountries.data);
    });

    it('returns billing countries', () => {
        expect(selector.getBillingCountries()).toEqual(state.countries.data);
    });

    it('returns payment methods', () => {
        expect(selector.getPaymentMethods()).toEqual(state.paymentMethods.data);
    });

    it('returns payment method', () => {
        expect(selector.getPaymentMethod('braintree')).toEqual(getBraintree());
    });

    it('returns cart', () => {
        expect(selector.getCart()).toEqual(state.cart.data);
    });

    it('returns customer', () => {
        expect(selector.getCustomer()).toEqual(state.customer.data);
    });

    it('returns billing address', () => {
        expect(selector.getBillingAddress()).toEqual(getBillingAddress());
    });

    it('returns shipping address', () => {
        expect(selector.getShippingAddress()).toEqual(state.quote.data.shippingAddress);
    });

    it('returns instruments', () => {
        expect(selector.getInstruments()).toEqual(state.instruments.data);
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
