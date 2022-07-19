/**
 * Common PayPal Commerce strategy what contains the logic for all PayPal Commerce modules (paypal, credit, paylater, venmo and all APMs)
 * TODO: we should find a way how to separate PayPal Commerce modules with their own strategies
 */
export { PaypalCommerceButtonInitializeOptions } from './paypal-commerce-button-options';
export { default as PaypalCommerceButtonStrategy } from './paypal-commerce-button-strategy';

/**
 * PayPal Commerce Alternative Payment Methods
 */
 export { PaypalCommerceAlternativeMethodsButtonOptions } from './paypal-commerce-alternative-methods-button-options';
 export { default as PaypalCommerceAlternativeMethodsButtonStrategy } from './paypal-commerce-alternative-methods-button-strategy';

/**
 * PayPal Commerce Venmo
 */
export { PaypalCommerceVenmoButtonInitializeOptions } from './paypal-commerce-venmo-button-options';
export { default as PaypalCommerceVenmoButtonStrategy } from './paypal-commerce-venmo-button-strategy';
