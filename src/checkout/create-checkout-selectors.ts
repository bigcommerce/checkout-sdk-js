import { CheckoutErrorSelector, CheckoutSelector, CheckoutSelectors, CheckoutStatusSelector, InternalCheckoutSelectors } from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
    const checkout = new CheckoutSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.country,
        selectors.customer,
        selectors.form,
        selectors.instrument,
        selectors.order,
        selectors.paymentMethod,
        selectors.quote,
        selectors.remoteCheckout,
        selectors.shippingAddress,
        selectors.shippingCountry,
        selectors.shippingOption
    );

    const errors = new CheckoutErrorSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.country,
        selectors.coupon,
        selectors.customerStrategy,
        selectors.giftCertificate,
        selectors.instrument,
        selectors.order,
        selectors.paymentMethod,
        selectors.paymentStrategy,
        selectors.quote,
        selectors.shippingCountry,
        selectors.shippingOption,
        selectors.shippingStrategy
    );

    const statuses = new CheckoutStatusSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.country,
        selectors.coupon,
        selectors.customerStrategy,
        selectors.giftCertificate,
        selectors.instrument,
        selectors.order,
        selectors.paymentMethod,
        selectors.paymentStrategy,
        selectors.quote,
        selectors.shippingCountry,
        selectors.shippingOption,
        selectors.shippingStrategy
    );

    return {
        checkout,
        errors,
        statuses,
    };
}
