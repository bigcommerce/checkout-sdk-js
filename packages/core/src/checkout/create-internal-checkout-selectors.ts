import { createBillingAddressSelectorFactory } from '../billing';
import { createCartSelectorFactory } from '../cart';
import { createCheckoutButtonSelectorFactory } from '../checkout-buttons';
import { createFreezeProxies } from '../common/utility';
import { createConfigSelectorFactory } from '../config';
import { createCouponSelectorFactory, createGiftCertificateSelectorFactory } from '../coupon';
import { createCustomerSelectorFactory, createCustomerStrategySelectorFactory } from '../customer';
import { createExtensionSelectorFactory } from '../extension';
import { createFormSelectorFactory } from '../form';
import { createCountrySelectorFactory } from '../geography';
import { createOrderSelectorFactory } from '../order';
import { createOrderBillingAddressSelectorFactory } from '../order-billing-address';
import {
    createPaymentMethodSelectorFactory,
    createPaymentSelectorFactory,
    createPaymentStrategySelectorFactory,
} from '../payment';
import { createPaymentProviderCustomerSelectorFactory } from '../payment-provider-customer';
import { createInstrumentSelectorFactory } from '../payment/instrument';
import { createRemoteCheckoutSelectorFactory } from '../remote-checkout';
import {
    createConsignmentSelectorFactory,
    createPickupOptionSelectorFactory,
    createShippingAddressSelectorFactory,
    createShippingCountrySelectorFactory,
    createShippingStrategySelectorFactory,
} from '../shipping';
import { createSignInEmailSelectorFactory } from '../signin-email';
import { createStoreCreditSelectorFactory } from '../store-credit';
import { createSubscriptionsSelectorFactory } from '../subscription';

import { createCheckoutSelectorFactory } from './checkout-selector';
import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export type InternalCheckoutSelectorsFactory = (
    state: CheckoutStoreState,
    options?: CheckoutStoreOptions,
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
    const createPickupOptionSelector = createPickupOptionSelectorFactory();
    const createPaymentProviderCustomerSelector = createPaymentProviderCustomerSelectorFactory();
    const createRemoteCheckoutSelector = createRemoteCheckoutSelectorFactory();
    const createShippingAddressSelector = createShippingAddressSelectorFactory();
    const createShippingCountrySelector = createShippingCountrySelectorFactory();
    const createShippingStrategySelector = createShippingStrategySelectorFactory();
    const createConsignmentSelector = createConsignmentSelectorFactory();
    const createCheckoutSelector = createCheckoutSelectorFactory();
    const createOrderSelector = createOrderSelectorFactory();
    const createOrderBillingAddressSelector = createOrderBillingAddressSelectorFactory();
    const createPaymentSelector = createPaymentSelectorFactory();
    const createStoreCreditSelector = createStoreCreditSelectorFactory();
    const createSubscriptionsSelector = createSubscriptionsSelectorFactory();
    const createSignInEmailSelector = createSignInEmailSelectorFactory();
    const createExtensionSelector = createExtensionSelectorFactory();

    return (state, options = {}) => {
        const billingAddress = createBillingAddressSelector(state.billingAddress);
        const cart = createCartSelector(state.cart);
        const checkoutButton = createCheckoutButtonSelector(state.checkoutButton);
        const countries = createCountrySelector(state.countries);
        const coupons = createCouponSelector(state.coupons);
        const customer = createCustomerSelector(state.customer);
        const customerStrategies = createCustomerStrategySelector(state.customerStrategies);
        const extensions = createExtensionSelector(state.extensions);
        const form = createFormSelector(state.formFields);
        const giftCertificates = createGiftCertificateSelector(state.giftCertificates);
        const instruments = createInstrumentSelector(state.instruments);
        const orderBillingAddress = createOrderBillingAddressSelector(state.orderBillingAddress);
        const paymentMethods = createPaymentMethodSelector(state.paymentMethods);
        const paymentProviderCustomer = createPaymentProviderCustomerSelector(
            state.paymentProviderCustomer,
        );
        const paymentStrategies = createPaymentStrategySelector(state.paymentStrategies);
        const pickupOptions = createPickupOptionSelector(state.pickupOptions);
        const remoteCheckout = createRemoteCheckoutSelector(state.remoteCheckout);
        const shippingAddress = createShippingAddressSelector(state.consignments);
        const shippingCountries = createShippingCountrySelector(state.shippingCountries);
        const shippingStrategies = createShippingStrategySelector(state.shippingStrategies);
        const subscriptions = createSubscriptionsSelector(state.subscriptions);
        const storeCredit = createStoreCreditSelector(state.storeCredit);
        const signInEmail = createSignInEmailSelector(state.signInEmail);

        // Compose selectors
        const consignments = createConsignmentSelector(state.consignments, cart);
        const checkout = createCheckoutSelector(
            state.checkout,
            billingAddress,
            cart,
            consignments,
            coupons,
            customer,
            giftCertificates,
        );
        const order = createOrderSelector(state.order, orderBillingAddress, coupons);
        const payment = createPaymentSelector(checkout, order);
        const config = createConfigSelector(state.config, state.formFields);

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
            extensions,
            form,
            giftCertificates,
            instruments,
            order,
            orderBillingAddress,
            payment,
            paymentMethods,
            paymentProviderCustomer,
            paymentStrategies,
            pickupOptions,
            remoteCheckout,
            shippingAddress,
            shippingCountries,
            shippingStrategies,
            signInEmail,
            subscriptions,
            storeCredit,
        };

        return options.shouldWarnMutation ? createFreezeProxies(selectors) : selectors;
    };
}

export default function createInternalCheckoutSelectors(
    state: CheckoutStoreState,
    options?: CheckoutStoreOptions,
): InternalCheckoutSelectors {
    return createInternalCheckoutSelectorsFactory()(state, options);
}
