import { CheckoutErrorSelector, CheckoutSelector, CheckoutSelectors, CheckoutStatusSelector, InternalCheckoutSelectors } from '../checkout';
import { createFreezeProxy } from '../common/utility';

import { CheckoutStoreOptions } from './checkout-store';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors, options: CheckoutStoreOptions = {}): CheckoutSelectors {
    const checkout = new CheckoutSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.countries,
        selectors.customer,
        selectors.form,
        selectors.instruments,
        selectors.order,
        selectors.paymentMethods,
        selectors.quote,
        selectors.remoteCheckout,
        selectors.shippingAddress,
        selectors.shippingCountries,
        selectors.shippingOptions
    );

    const errors = new CheckoutErrorSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.countries,
        selectors.coupons,
        selectors.customerStrategy,
        selectors.giftCertificates,
        selectors.instruments,
        selectors.order,
        selectors.paymentMethods,
        selectors.paymentStrategy,
        selectors.quote,
        selectors.shippingCountries,
        selectors.shippingOptions,
        selectors.shippingStrategy
    );

    const statuses = new CheckoutStatusSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.countries,
        selectors.coupons,
        selectors.customerStrategy,
        selectors.giftCertificates,
        selectors.instruments,
        selectors.order,
        selectors.paymentMethods,
        selectors.paymentStrategy,
        selectors.quote,
        selectors.shippingCountries,
        selectors.shippingOptions,
        selectors.shippingStrategy
    );

    return {
        checkout: options.shouldWarnMutation ? createFreezeProxy(checkout) : checkout,
        errors: options.shouldWarnMutation ? createFreezeProxy(errors) : errors,
        statuses: options.shouldWarnMutation ? createFreezeProxy(statuses) : statuses,
    };
}
