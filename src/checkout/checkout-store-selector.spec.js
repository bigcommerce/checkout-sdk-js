import { find, reject } from 'lodash';
import { getCheckoutStoreState } from './checkouts.mock';
import { getFormFields } from '../form/form.mocks';
import { getUnitedStates } from '../geography/countries.mock';
import { getBraintree } from '../payment/payment-methods.mock';
import { getAustralia } from '../shipping/shipping-countries.mock';
import CheckoutStoreSelector from './checkout-store-selector';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';

describe('CheckoutStoreSelector', () => {
    let selector;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreState();
        selector = new CheckoutStoreSelector(createInternalCheckoutSelectors(state));
    });

    it('returns order', () => {
        expect(selector.getOrder()).toEqual(state.order.data);
    });

    it('returns quote', () => {
        expect(selector.getQuote()).toEqual(state.quote.data);
    });

    it('returns config', () => {
        expect(selector.getConfig()).toEqual(state.config.data.storeConfig);
    });

    it('returns shipping options', () => {
        expect(selector.getShippingOptions()).toEqual(state.shippingOptions.data);
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
        expect(selector.getBillingAddress()).toEqual(state.quote.data.billingAddress);
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
        const predicate = ({ name }) => name === 'province' || name === 'provinceCode' || name === 'countryCode';

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(find(results, { name: 'provinceCode' }).options.items)
            .toEqual(getAustralia().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });

    it('returns billing address fields', () => {
        const results = selector.getBillingAddressFields('US');
        const predicate = ({ name }) => name === 'province' || name === 'provinceCode' || name === 'countryCode';

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(find(results, { name: 'provinceCode' }).options.items)
            .toEqual(getUnitedStates().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });
});
