import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { createFreezeProxies } from '../common/utility';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';

import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default function createInternalCheckoutSelectors(state: CheckoutStoreState, options: CheckoutStoreOptions = {}): InternalCheckoutSelectors {
    const billingAddress = new BillingAddressSelector(state.quote);
    const cart = new CartSelector(state.cart);
    const config = new ConfigSelector(state.config);
    const country = new CountrySelector(state.countries);
    const coupon = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const customerStrategy = new CustomerStrategySelector(state.customerStrategy);
    const form = new FormSelector(state.config);
    const giftCertificate = new GiftCertificateSelector(state.giftCertificates);
    const instrument = new InstrumentSelector(state.instruments);
    const order = new OrderSelector(state.order, state.customer, state.cart);
    const paymentMethod = new PaymentMethodSelector(state.paymentMethods, state.order);
    const paymentStrategy = new PaymentStrategySelector(state.paymentStrategy);
    const quote = new QuoteSelector(state.quote);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout, state.customer);
    const shippingAddress = new ShippingAddressSelector(state.quote);
    const shippingCountry = new ShippingCountrySelector(state.shippingCountries);
    const shippingOption = new ShippingOptionSelector(state.shippingOptions, state.quote);
    const shippingStrategy = new ShippingStrategySelector(state.shippingStrategy);

    const selectors = {
        billingAddress,
        cart,
        config,
        country,
        coupon,
        customer,
        customerStrategy,
        form,
        giftCertificate,
        instrument,
        order,
        paymentMethod,
        paymentStrategy,
        quote,
        remoteCheckout,
        shippingAddress,
        shippingCountry,
        shippingOption,
        shippingStrategy,
    };

    return options.shouldWarnMutation ? createFreezeProxies(selectors) : selectors;
}
