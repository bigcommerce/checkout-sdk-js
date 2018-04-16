import { createDataStore, Action, DataStore } from '@bigcommerce/data-store';

import { BillingAddressSelector } from '../billing';
import { cartReducer, CartSelector } from '../cart';
import { CheckoutErrorSelector, CheckoutSelector, CheckoutSelectors, CheckoutStatusSelector } from '../checkout';
import { createRequestErrorFactory } from '../common/error';
import { createFreezeProxy } from '../common/utility';
import { configReducer, ConfigSelector } from '../config';
import { couponReducer, giftCertificateReducer, CouponSelector, GiftCertificateSelector } from '../coupon';
import { customerReducer, customerStrategyReducer, CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { countryReducer, CountrySelector } from '../geography';
import { orderReducer, OrderSelector } from '../order';
import { paymentMethodReducer, paymentReducer, paymentStrategyReducer, PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { instrumentReducer, InstrumentSelector } from '../payment/instrument';
import { quoteReducer, QuoteSelector } from '../quote';
import { remoteCheckoutReducer, RemoteCheckoutSelector } from '../remote-checkout';
import {
    shippingCountryReducer,
    shippingOptionReducer,
    shippingStrategyReducer,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
    ShippingStrategySelector,
} from '../shipping';

import createActionTransformer from './create-action-transformer';

/**
 * @todo Convert this file into TypeScript properly
 * @param {Object} [initialState={}]
 * @param {CheckoutStoreOptions} [options={}]
 * @return {DataStore}
 */
export default function createCheckoutStore(initialState = {}, options?: CheckoutStoreOptions): DataStore<any, Action, CheckoutSelectors> {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const stateTransformer = (state: any) => createCheckoutSelectors(state, options);

    return createDataStore(
        createCheckoutReducers() as any,
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}

/**
 * @private
 * @return {CheckoutReducers}
 */
function createCheckoutReducers(): any {
    return {
        cart: cartReducer,
        config: configReducer,
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
 * @param {CheckoutState} state
 * @param {Object} [options={}]
 * @param {boolean} [options.shouldWarnMutation=true]
 * @return {CheckoutSelectors}
 */
function createCheckoutSelectors(state: any, options: CheckoutStoreOptions = {}): CheckoutSelectors {
    const billingAddress = new BillingAddressSelector(state.quote);
    const cart = new CartSelector(state.cart);
    const config = new ConfigSelector(state.config);
    const countries = new CountrySelector(state.countries);
    const coupon = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const customerStrategy = new CustomerStrategySelector(state.customerStrategy);
    const form = new FormSelector(state.config);
    const giftCertificate = new GiftCertificateSelector(state.giftCertificates);
    const instruments = new InstrumentSelector(state.instruments);
    const order = new OrderSelector(state.order, state.customer, state.cart);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods, state.order);
    const paymentStrategy = new PaymentStrategySelector(state.paymentStrategy);
    const quote = new QuoteSelector(state.quote);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout);
    const shippingAddress = new ShippingAddressSelector(state.quote);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingOptions = new ShippingOptionSelector(state.shippingOptions, state.quote);
    const shippingStrategy = new ShippingStrategySelector(state.shippingStrategy);

    const checkout = new CheckoutSelector(
        billingAddress,
        cart,
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

    const errors = new CheckoutErrorSelector(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customerStrategy,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        paymentStrategy,
        quote,
        shippingCountries,
        shippingOptions,
        shippingStrategy
    );

    const statuses = new CheckoutStatusSelector(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customerStrategy,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        paymentStrategy,
        quote,
        shippingCountries,
        shippingOptions,
        shippingStrategy
    );

    return {
        checkout: options.shouldWarnMutation ? createFreezeProxy(checkout) : checkout,
        errors: options.shouldWarnMutation ? createFreezeProxy(errors) : errors,
        statuses: options.shouldWarnMutation ? createFreezeProxy(statuses) : statuses,
    };
}

export interface CheckoutStoreOptions {
    shouldWarnMutation?: boolean;
}
