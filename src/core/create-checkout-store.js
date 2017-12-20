import { cartReducer, CartSelector } from './cart';
import { CheckoutErrorSelector, CheckoutSelector, CheckoutStatusSelector } from './checkout';
import { configReducer, ConfigSelector } from './config';
import { countryReducer, CountrySelector } from './geography';
import { createDataStore } from '../data-store';
import { customerReducer, CustomerSelector } from './customer';
import { couponReducer, CouponSelector, giftCertificateReducer, GiftCertificateSelector } from './coupon';
import { orderReducer, OrderSelector } from './order';
import { paymentReducer, paymentMethodReducer, PaymentMethodSelector } from './payment';
import { instrumentReducer, InstrumentSelector } from './payment/instrument';
import { quoteReducer, QuoteSelector } from './quote';
import { BillingAddressSelector } from './billing';
import {
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
    shippingCountryReducer,
    shippingOptionReducer,
} from './shipping';

/**
 * @private
 * @return {CheckoutReducers}
 */
function createCheckoutReducers() {
    return {
        cart: cartReducer,
        config: configReducer,
        countries: countryReducer,
        coupons: couponReducer,
        customer: customerReducer,
        giftCertificates: giftCertificateReducer,
        instrument: instrumentReducer,
        order: orderReducer,
        payment: paymentReducer,
        paymentMethods: paymentMethodReducer,
        quote: quoteReducer,
        shippingCountries: shippingCountryReducer,
        shippingOptions: shippingOptionReducer,
    };
}

/**
 * @private
 * @param {CheckoutState} state
 * @return {CheckoutSelectors}
 */
function createCheckoutSelectors(state) {
    const billingAddress = new BillingAddressSelector(state.quote);
    const cart = new CartSelector(state.cart);
    const config = new ConfigSelector(state.config);
    const countries = new CountrySelector(state.countries);
    const coupon = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const giftCertificate = new GiftCertificateSelector(state.giftCertificates);
    const instrument = new InstrumentSelector(state.instrument);
    const order = new OrderSelector(state.order, state.payment, state.customer, state.cart);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods, state.order);
    const quote = new QuoteSelector(state.quote);
    const shippingAddress = new ShippingAddressSelector(state.quote);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingOptions = new ShippingOptionSelector(state.shippingOptions, state.quote);

    const checkout = new CheckoutSelector(
        billingAddress,
        cart,
        config,
        countries,
        customer,
        instrument,
        order,
        paymentMethods,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    const errors = new CheckoutErrorSelector(
        billingAddress,
        cart,
        countries,
        coupon,
        customer,
        giftCertificate,
        instrument,
        order,
        paymentMethods,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    const statuses = new CheckoutStatusSelector(
        billingAddress,
        cart,
        countries,
        coupon,
        customer,
        giftCertificate,
        instrument,
        order,
        paymentMethods,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    return {
        checkout,
        errors,
        statuses,
    };
}

/**
 * @param {Object} [initialState={}]
 * @return {DataStore}
 */
export default function createCheckoutStore(initialState = {}) {
    return createDataStore(
        createCheckoutReducers(),
        initialState,
        createCheckoutSelectors
    );
}
