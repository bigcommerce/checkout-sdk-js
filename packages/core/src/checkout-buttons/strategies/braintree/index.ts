// Braintree PayPal Old Button Strategy
// TODO: This strategy should be removed right after braintree button strategies separation
// TODO: Should be removed after BraintreePaypalButtonStrategy, BraintreePaypalCreditButtonStrategy and BraintreeVenmoButtonStrategy strategies creation
export { default as BraintreePaypalV1ButtonStrategy } from './braintree-paypal-v1-button-strategy';
export { BraintreePaypalV1ButtonInitializeOptions } from './braintree-paypal-v1-button-options';

// Braintree PayPal Credit (Credit / PayLater)
export { default as BraintreePaypalCreditButtonStrategy } from './braintree-paypal-credit-button-strategy';
export { BraintreePaypalCreditButtonInitializeOptions } from './braintree-paypal-credit-button-options';
