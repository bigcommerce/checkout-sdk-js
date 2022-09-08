/**
 * Common PayPal Commerce strategy what contains the logic for all PayPal Commerce modules (paypal, credit, paylater, venmo and all APMs)
 * TODO: this strategy should be removed when PAYPAL-1389.paypal_commerce_button_strategies_update will be turned on for all stores
 */
export { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
export { default as PaypalCommerceButtonStrategy } from './paypal-commerce-button-strategy';

/**
 * PayPal Commerce V2 strategy
 */
export { PaypalCommerceV2ButtonInitializeOptions } from './paypal-commerce-v2-button-options';
export { default as PaypalCommerceV2ButtonStrategy } from './paypal-commerce-v2-button-strategy';

/**
 * PayPal Commerce Credit Payment Methods
 */
export { PaypalCommerceCreditButtonInitializeOptions } from './paypal-commerce-credit-button-options';
export { default as PaypalCommerceCreditButtonStrategy } from './paypal-commerce-credit-button-strategy';

/**
 * PayPal Commerce Alternative Payment Methods
 */
 export { PaypalCommerceAlternativeMethodsButtonOptions } from './paypal-commerce-alternative-methods-button-options';
 export { default as PaypalCommerceAlternativeMethodsButtonStrategy } from './paypal-commerce-alternative-methods-button-strategy';

/**
 * PayPal Commerce Inline Checkout
 */
export { PaypalCommerceInlineCheckoutButtonInitializeOptions } from './paypal-commerce-inline-checkout-button-options';
export { default as PaypalCommerceInlineCheckoutButtonStrategy } from './paypal-commerce-inline-checkout-button-strategy';

/**
 * PayPal Commerce Venmo
 */
export { PaypalCommerceVenmoButtonInitializeOptions } from './paypal-commerce-venmo-button-options';
export { default as PaypalCommerceVenmoButtonStrategy } from './paypal-commerce-venmo-button-strategy';
