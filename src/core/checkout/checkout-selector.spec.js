import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart' ;
import { ConfigSelector } from '../config';
import { CountrySelector } from '../geography';
import { CustomerSelector } from '../customer';
import { InstrumentSelector } from '../payment/instrument';
import { OrderSelector } from '../order';
import { PaymentMethodSelector } from '../payment';
import { QuoteSelector } from '../quote';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector } from '../shipping';
import { CacheFactory } from '../common/cache';
import { getCartState } from '../cart/carts.mock';
import { getCompleteOrderState } from '../order/orders.mock';
import { getConfigState } from '../config/configs.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getCustomerState } from '../customer/customers.mock';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { getBraintree, getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/quotes.mock';
import { getRemoteCheckoutState } from '../remote-checkout/remote-checkout.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';
import { getShippingOptionsState } from '../shipping/shipping-options.mock';
import CheckoutSelector from './checkout-selector';

describe('CheckoutSelector', () => {
    let cacheFactory;
    let orderSelector;
    let selector;
    let state;

    beforeEach(() => {
        state = {
            cart: getCartState(),
            config: getConfigState(),
            countries: getCountriesState(),
            customer: getCustomerState(),
            instruments: getInstrumentsState(),
            order: getCompleteOrderState(),
            paymentMethods: getPaymentMethodsState(),
            quote: getQuoteState(),
            remoteCheckout: getRemoteCheckoutState(),
            shippingOptions: getShippingOptionsState(),
            shippingCountries: getShippingCountriesState(),
        };

        cacheFactory = new CacheFactory();
        orderSelector = new OrderSelector(state.order, state.payment, state.customer, state.cart, cacheFactory);

        selector = new CheckoutSelector(
            new BillingAddressSelector(state.quote),
            new CartSelector(state.cart),
            new ConfigSelector(state.config),
            new CountrySelector(state.countries),
            new CustomerSelector(state.customer),
            new InstrumentSelector(state.instruments),
            orderSelector,
            new PaymentMethodSelector(state.paymentMethods),
            new QuoteSelector(state.quote),
            new RemoteCheckoutSelector(state.remoteCheckout),
            new ShippingAddressSelector(state.quote),
            new ShippingCountrySelector(state.shippingCountries),
            new ShippingOptionSelector(state.shippingOptions),
            cacheFactory
        );
    });

    it('returns checkout meta', () => {
        expect(selector.getCheckoutMeta()).toEqual({
            isCartVerified: false,
            paymentAuthToken: undefined,
            remoteCheckout: {
                ...state.remoteCheckout.meta,
                ...state.remoteCheckout.data,
            },
            ...state.quote.meta.request,
            ...state.instruments.meta,
            ...state.order.meta,
        });
    });

    it('returns same checkout meta unless changed', () => {
        const meta = selector.getCheckoutMeta();

        expect(selector.getCheckoutMeta()).toBe(meta);
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
