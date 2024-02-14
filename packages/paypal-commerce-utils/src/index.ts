export * from './paypal-commerce-types';
export * from './mocks';
export * from './utils';

// TODO: this export should be moved to ./utils/index.ts file
export { default as isPaypalCommerceProviderError } from './utils/is-paypal-commerce-provider-error';

/**
 *
 * PayPal Commerce Sdk exports
 *
 * */
export { default as createPayPalCommerceSdk } from './create-paypal-commerce-sdk';
export { default as PayPalCommerceSdk } from './paypal-commerce-sdk';

/**
 *
 * PayPal Commerce Fastlane utils exports
 *
 */
export { default as createPayPalCommerceFastlaneUtils } from './create-paypal-commerce-fastlane-utils';
export { default as PayPalCommerceFastlaneUtils } from './paypal-commerce-fastlane-utils';

// TODO: remove this imports when all PayPal Commerce Accelerated checkout strategies will be updated with Fastlane
export { default as createPayPalCommerceAcceleratedCheckoutUtils } from './create-paypal-commerce-accelerated-checkout-utils';
export { default as PayPalCommerceAcceleratedCheckoutUtils } from './paypal-commerce-accelerated-checkout-utils';
