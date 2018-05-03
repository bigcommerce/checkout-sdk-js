import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart' ;
import { ConfigSelector } from '../config';
import { CountrySelector } from '../geography';
import { CustomerSelector } from '../customer';
import { FormSelector } from '../form';
import { InstrumentSelector } from '../payment/instrument';
import { OrderSelector } from '../order';
import { PaymentMethodSelector } from '../payment';
import { QuoteSelector } from '../quote';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector } from '../shipping';
import { getCheckoutStoreState } from './checkouts.mock';
import { getCountries } from '../geography/countries.mock';
import { getBraintree } from '../payment/payment-methods.mock';
import { getShippingCountries } from '../shipping/shipping-countries.mock';
import CheckoutSelector from './checkout-selector';

describe('CheckoutSelector', () => {
    let orderSelector;
    let formSelector;
    let selector;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreState();

        orderSelector = new OrderSelector(state.order, state.customer, state.cart);
        formSelector = new FormSelector(state.config);

        selector = new CheckoutSelector(
            new BillingAddressSelector(state.quote),
            new CartSelector(state.cart),
            new ConfigSelector(state.config),
            new CountrySelector(state.countries),
            new CustomerSelector(state.customer, state.customerStrategy),
            formSelector,
            new InstrumentSelector(state.instruments),
            orderSelector,
            new PaymentMethodSelector(state.paymentMethods),
            new QuoteSelector(state.quote),
            new ShippingAddressSelector(state.quote),
            new ShippingCountrySelector(state.shippingCountries),
            new ShippingOptionSelector(state.shippingOptions)
        );
    });

    it('returns order', () => {
        expect(selector.getOrder()).toEqual(state.order.data);
    });

    it('returns quote', () => {
        expect(selector.getQuote()).toEqual(state.quote.data);
    });

    it('returns config', () => {
        expect(selector.getConfig()).toEqual(state.config.data);
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
        jest.spyOn(orderSelector, 'isPaymentDataSubmitted');

        expect(selector.isPaymentDataSubmitted('braintree')).toEqual(true);
        expect(orderSelector.isPaymentDataSubmitted).toHaveBeenCalledWith(getBraintree());
    });

    it('returns shipping address fields', () => {
        jest.spyOn(formSelector, 'getShippingAddressFields').mockImplementation(() => {});
        selector.getShippingAddressFields('AU');
        expect(formSelector.getShippingAddressFields)
            .toHaveBeenCalledWith(getShippingCountries(), 'AU');
    });

    it('returns billing address fields', () => {
        jest.spyOn(formSelector, 'getBillingAddressFields').mockImplementation(() => {});
        selector.getBillingAddressFields('US');
        expect(formSelector.getBillingAddressFields)
            .toHaveBeenCalledWith(getCountries(), 'US');
    });
});
