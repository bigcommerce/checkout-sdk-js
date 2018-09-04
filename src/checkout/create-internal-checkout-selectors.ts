import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { CheckoutButtonSelector } from '../checkout-buttons';
import { createFreezeProxies } from '../common/utility';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentSelector } from '../payment';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ConsignmentSelector, ShippingAddressSelector, ShippingCountrySelector, ShippingStrategySelector } from '../shipping';

import CheckoutSelector from './checkout-selector';
import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default function createInternalCheckoutSelectors(state: CheckoutStoreState, options: CheckoutStoreOptions = {}): InternalCheckoutSelectors {
    const billingAddress = new BillingAddressSelector(state.billingAddress);
    const cart = new CartSelector(state.cart);
    const checkoutButton = new CheckoutButtonSelector(state.checkoutButton);
    const config = new ConfigSelector(state.config);
    const countries = new CountrySelector(state.countries);
    const coupons = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const customerStrategies = new CustomerStrategySelector(state.customerStrategies);
    const form = new FormSelector(state.config);
    const giftCertificates = new GiftCertificateSelector(state.giftCertificates);
    const instruments = new InstrumentSelector(state.instruments);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods);
    const paymentStrategies = new PaymentStrategySelector(state.paymentStrategies);
    const shippingAddress = new ShippingAddressSelector(state.consignments);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingStrategies = new ShippingStrategySelector(state.shippingStrategies);

    // Compose selectors
    const consignments = new ConsignmentSelector(state.consignments, cart);
    const checkout = new CheckoutSelector(state.checkout, billingAddress, cart, consignments, coupons, customer, giftCertificates);
    const order = new OrderSelector(state.order, billingAddress, coupons);
    const payment = new PaymentSelector(checkout, order);

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
    };

    return options.shouldWarnMutation ? createFreezeProxies(selectors) : selectors;
}
