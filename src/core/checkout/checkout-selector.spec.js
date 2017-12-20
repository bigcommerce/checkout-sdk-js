import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart' ;
import { ConfigSelector } from '../config';
import { CountrySelector } from '../geography';
import { CustomerSelector } from '../customer';
import { InstrumentSelector } from '../payment/instrument';
import { OrderSelector } from '../order';
import { PaymentMethodSelector } from '../payment';
import { QuoteSelector } from '../quote';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector } from '../shipping';
import { getCartState } from '../cart/carts.mock';
import { getCompleteOrderState } from '../order/orders.mock';
import { getConfigState } from '../config/configs.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getCustomerState } from '../customer/customers.mock';
import { getInstrumentState } from '../payment/instrument/instrument.mock';
import { getBraintree, getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/quotes.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';
import { getShippingOptionsState } from '../shipping/shipping-options.mock';
import CheckoutSelector from './checkout-selector';

describe('CheckoutSelector', () => {
    let orderSelector;
    let selector;
    let state;

    beforeEach(() => {
        state = {
            cart: getCartState(),
            config: getConfigState(),
            countries: getCountriesState(),
            customer: getCustomerState(),
            instrument: getInstrumentState(),
            order: getCompleteOrderState(),
            paymentMethods: getPaymentMethodsState(),
            quote: getQuoteState(),
            shippingOptions: getShippingOptionsState(),
            shippingCountries: getShippingCountriesState(),
        };

        orderSelector = new OrderSelector(state.order);

        selector = new CheckoutSelector(
            new BillingAddressSelector(state.quote),
            new CartSelector(state.cart),
            new ConfigSelector(state.config),
            new CountrySelector(state.countries),
            new CustomerSelector(state.customer),
            new InstrumentSelector(state.instrument),
            orderSelector,
            new PaymentMethodSelector(state.paymentMethods),
            new QuoteSelector(state.quote),
            new ShippingAddressSelector(state.quote),
            new ShippingCountrySelector(state.shippingCountries),
            new ShippingOptionSelector(state.shippingOptions)
        );
    });

    it('returns checkout meta', () => {
        expect(selector.getCheckoutMeta()).toEqual({
            isCartVerified: false,
            paymentAuthToken: undefined,
            ...state.quote.meta.request,
            ...state.order.meta,
        });
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
});
