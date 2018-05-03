import { CheckoutErrorSelector, CheckoutSelector, CheckoutSelectors, CheckoutStatusSelector, InternalCheckoutSelectors } from '../checkout';

export default function createCheckoutSelectors(selectors: InternalCheckoutSelectors): CheckoutSelectors {
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
        selectors.customerStrategies,
        selectors.giftCertificates,
        selectors.instruments,
        selectors.order,
        selectors.paymentMethods,
        selectors.paymentStrategies,
        selectors.quote,
        selectors.shippingCountries,
        selectors.shippingOptions,
        selectors.shippingStrategies
    );

    const statuses = new CheckoutStatusSelector(
        selectors.billingAddress,
        selectors.cart,
        selectors.config,
        selectors.countries,
        selectors.coupons,
        selectors.customerStrategies,
        selectors.giftCertificates,
        selectors.instruments,
        selectors.order,
        selectors.paymentMethods,
        selectors.paymentStrategies,
        selectors.quote,
        selectors.shippingCountries,
        selectors.shippingOptions,
        selectors.shippingStrategies
    );

    return {
        checkout,
        errors,
        statuses,
    };
}
