import { createDataStore } from '@bigcommerce/data-store';
import { cartReducer, CartSelector } from '../cart';
import { configReducer, ConfigSelector } from '../config';
import { countryReducer, CountrySelector } from '../geography';
import { createFreezeProxy } from '../common/utility';
import { createRequestErrorFactory } from '../common/error';
import { customerReducer, customerStrategyReducer, CustomerSelector, CustomerStrategySelector } from '../customer';
import { couponReducer, CouponSelector, giftCertificateReducer, GiftCertificateSelector } from '../coupon';
import { FormSelector } from '../form';
import { orderReducer, OrderSelector } from '../order';
import { paymentReducer, paymentMethodReducer, paymentStrategyReducer, PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { remoteCheckoutReducer, RemoteCheckoutSelector } from '../remote-checkout';
import { instrumentReducer, InstrumentSelector } from '../payment/instrument';
import { quoteReducer, QuoteSelector } from '../quote';
import { billingAddressReducer, BillingAddressSelector } from '../billing';
import {
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
    ShippingStrategySelector,
    consignmentReducer,
    shippingCountryReducer,
    shippingOptionReducer,
    shippingStrategyReducer,
} from '../shipping';

import CheckoutSelector from './checkout-selector';
import CheckoutStoreErrorSelector from './checkout-store-error-selector';
import CheckoutStoreSelector from './checkout-store-selector';
import CheckoutStoreStatusSelector from './checkout-store-status-selector';
import checkoutReducer from './checkout-reducer';
import createActionTransformer from './create-action-transformer';

/**
 * @param {Object} [initialState={}]
 * @param {Object} [options={}]
 * @return {DataStore}
 */
export default function createCheckoutStore(initialState = {}, options = {}) {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const stateTransformer = (state) => createCheckoutSelectors(state, options);

    return createDataStore(
        createCheckoutReducers(),
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}

/**
 * @private
 * @return {CheckoutStoreReducers}
 */
function createCheckoutReducers() {
    return {
        billingAddress: billingAddressReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        config: configReducer,
        consignments: consignmentReducer,
        countries: countryReducer,
        coupons: couponReducer,
        customer: customerReducer,
        customerStrategy: customerStrategyReducer,
        giftCertificates: giftCertificateReducer,
        instruments: instrumentReducer,
        order: orderReducer,
        payment: paymentReducer,
        paymentMethods: paymentMethodReducer,
        paymentStrategy: paymentStrategyReducer,
        quote: quoteReducer,
        remoteCheckout: remoteCheckoutReducer,
        shippingCountries: shippingCountryReducer,
        shippingOptions: shippingOptionReducer,
        shippingStrategy: shippingStrategyReducer,
    };
}

/**
 * @private
 * @param {CheckoutStoreState} state
 * @param {Object} [options={}]
 * @param {boolean} [options.shouldWarnMutation=true]
 * @return {CheckoutSelectors}
 */
function createCheckoutSelectors(state, options) {
    const billingAddress = new BillingAddressSelector(state.quote);
    const cart = new CartSelector(state.cart);
    const checkout = new CheckoutSelector(state.checkout);
    const config = new ConfigSelector(state.config);
    const countries = new CountrySelector(state.countries);
    const coupon = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const customerStrategy = new CustomerStrategySelector(state.customerStrategy);
    const form = new FormSelector(state.config);
    const giftCertificate = new GiftCertificateSelector(state.giftCertificates);
    const instruments = new InstrumentSelector(state.instruments);
    const order = new OrderSelector(state.order, state.payment, state.customer, state.cart);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods, state.order);
    const paymentStrategy = new PaymentStrategySelector(state.paymentStrategy);
    const quote = new QuoteSelector(state.quote);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout);
    const shippingAddress = new ShippingAddressSelector(state.quote);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingOptions = new ShippingOptionSelector(state.shippingOptions, state.quote);
    const shippingStrategy = new ShippingStrategySelector(state.shippingStrategy);

    const store = new CheckoutStoreSelector(
        billingAddress,
        cart,
        checkout,
        config,
        countries,
        customer,
        form,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    const storeErrors = new CheckoutStoreErrorSelector(
        billingAddress,
        cart,
        checkout,
        config,
        countries,
        coupon,
        customer,
        customerStrategy,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        paymentStrategy,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions,
        shippingStrategy
    );

    const storeStatuses = new CheckoutStoreStatusSelector(
        billingAddress,
        cart,
        checkout,
        config,
        countries,
        coupon,
        customer,
        customerStrategy,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        paymentStrategy,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions,
        shippingStrategy
    );

    return {
        checkout: options.shouldWarnMutation ? createFreezeProxy(store) : store,
        errors: options.shouldWarnMutation ? createFreezeProxy(storeErrors) : storeErrors,
        statuses: options.shouldWarnMutation ? createFreezeProxy(storeStatuses) : storeStatuses,
    };
}
