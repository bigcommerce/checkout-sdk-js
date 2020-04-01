import { createBillingAddressSelectorFactory } from '../billing';
import { createCartSelectorFactory } from '../cart';
import { createCheckoutButtonSelectorFactory } from '../checkout-buttons';
import { createFreezeProxies } from '../common/utility';
import { createConfigSelectorFactory } from '../config';
import { createCouponSelectorFactory, createGiftCertificateSelectorFactory } from '../coupon';
import { createCustomerSelectorFactory, createCustomerStrategySelectorFactory } from '../customer';
import { createFormSelectorFactory } from '../form';
import { createCountrySelectorFactory } from '../geography';
import { createOrderSelectorFactory } from '../order';
import { createPaymentMethodSelectorFactory, createPaymentSelectorFactory, createPaymentStrategySelectorFactory } from '../payment';
import { createInstrumentSelectorFactory } from '../payment/instrument';
import { createRemoteCheckoutSelectorFactory } from '../remote-checkout';
import { createConsignmentSelectorFactory, createShippingAddressSelectorFactory, createShippingCountrySelectorFactory, createShippingStrategySelectorFactory } from '../shipping';
import { createStoreCreditSelectorFactory } from '../store-credit';
import { createSubscriptionsSelectorFactory } from '../subscription';

import { createCheckoutSelectorFactory } from './checkout-selector';
import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export type InternalCheckoutSelectorsFactory = (
    state: CheckoutStoreState,
    options?: CheckoutStoreOptions
) => InternalCheckoutSelectors;

export function createInternalCheckoutSelectorsFactory(): InternalCheckoutSelectorsFactory {
    const createBillingAddressSelector = createBillingAddressSelectorFactory();
    const createCartSelector = createCartSelectorFactory();
    const createCheckoutButtonSelector = createCheckoutButtonSelectorFactory();
    const createConfigSelector = createConfigSelectorFactory();
    const createCountrySelector = createCountrySelectorFactory();
    const createCouponSelector = createCouponSelectorFactory();
    const createCustomerSelector = createCustomerSelectorFactory();
    const createCustomerStrategySelector = createCustomerStrategySelectorFactory();
    const createGiftCertificateSelector = createGiftCertificateSelectorFactory();
    const createInstrumentSelector = createInstrumentSelectorFactory();
    const createFormSelector = createFormSelectorFactory();
    const createPaymentMethodSelector = createPaymentMethodSelectorFactory();
    const createPaymentStrategySelector = createPaymentStrategySelectorFactory();
    const createRemoteCheckoutSelector = createRemoteCheckoutSelectorFactory();
    const createShippingAddressSelector = createShippingAddressSelectorFactory();
    const createShippingCountrySelector = createShippingCountrySelectorFactory();
    const createShippingStrategySelector = createShippingStrategySelectorFactory();
    const createConsignmentSelector = createConsignmentSelectorFactory();
    const createCheckoutSelector = createCheckoutSelectorFactory();
    const createOrderSelector = createOrderSelectorFactory();
    const createPaymentSelector = createPaymentSelectorFactory();
    const createStoreCreditSelector = createStoreCreditSelectorFactory();
    const createSubscriptionsSelector = createSubscriptionsSelectorFactory();

    return (state, options = {}) => {
        const billingAddress = createBillingAddressSelector(state.billingAddress);
        const cart = createCartSelector(state.cart);
        const checkoutButton = createCheckoutButtonSelector(state.checkoutButton);
        const config = createConfigSelector(state.config);
        const countries = createCountrySelector(state.countries);
        const coupons = createCouponSelector(state.coupons);
        const customer = createCustomerSelector(state.customer);
        const customerStrategies = createCustomerStrategySelector(state.customerStrategies);
        const form = createFormSelector(state.config);
        const giftCertificates = createGiftCertificateSelector(state.giftCertificates);
        const instruments = createInstrumentSelector(state.instruments);
        const paymentMethods = createPaymentMethodSelector(state.paymentMethods);
        const paymentStrategies = createPaymentStrategySelector(state.paymentStrategies);
        const remoteCheckout = createRemoteCheckoutSelector(state.remoteCheckout);
        const shippingAddress = createShippingAddressSelector(state.consignments);
        const shippingCountries = createShippingCountrySelector(state.shippingCountries);
        const shippingStrategies = createShippingStrategySelector(state.shippingStrategies);
        const subscriptions = createSubscriptionsSelector(state.subscriptions);
        const storeCredit = createStoreCreditSelector(state.storeCredit);

        // Compose selectors
        const consignments = createConsignmentSelector(state.consignments, cart);
        const checkout = createCheckoutSelector(state.checkout, billingAddress, cart, consignments, coupons, customer, giftCertificates);
        const order = createOrderSelector(state.order, billingAddress, coupons);
        const payment = createPaymentSelector(checkout, order);

        const selectors = {
            billingAddress,
            cart,
            checkout,
            checkoutButton,
            config,
            consignments,
            countries,
            coupons,
            customer,
            customerStrategies,
            form,
            giftCertificates,
            instruments,
            order,
            payment,
            paymentMethods,
            paymentStrategies,
            remoteCheckout,
            shippingAddress,
            shippingCountries,
            shippingStrategies,
            subscriptions,
            storeCredit,
        };

        return options.shouldWarnMutation ? createFreezeProxies(selectors) : selectors;
    };
}

export default function createInternalCheckoutSelectors(
    state: CheckoutStoreState,
    options?: CheckoutStoreOptions
): InternalCheckoutSelectors {
    return createInternalCheckoutSelectorsFactory()(state, options);
}
