import { PayPalCommerceConnectStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

/**
 * A set of options that are optional to initialize the PayPalCommerce Accelerated Checkout customer strategy
 * that are responsible for PayPalCommerce Accelerated Checkout components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'paypalcommerceacceleratedcheckout',
 *     paypalcommerceacceleratedcheckout: {
 *         styles: {
 *              root: {
 *                  backgroundColorPrimary: 'transparent',
 *                  errorColor: '#C40B0B',
 *                  fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
 *              },
 *              input: {
 *                  borderRadius: '0.25rem',
 *                  borderColor: '#9E9E9E',
 *                  focusBorderColor: '#4496F6',
 *              },
 *              toggle: {
 *                  colorPrimary: '#0F005E',
 *                  colorSecondary: '#ffffff',
 *              },
 *              text: {
 *                  body: {
 *                      color: '#222222',
 *                      fontSize: '1rem',
 *                  },
 *                  caption: {
 *                      color: '#515151',
 *                      fontSize: '0.875rem',
 *                  },
 *              },
 *              branding: 'light',
 *         },
 *     },
 * });
 * ```
 */
export default interface PayPalCommerceAcceleratedCheckoutCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Connect components
     *
     * Note: the styles for all PayPalCommerce Accelerated Checkout strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalCommerceConnectStylesOption;
}

export interface WithPayPalCommerceAcceleratedCheckoutCustomerInitializeOptions {
    paypalcommerceacceleratedcheckout?: PayPalCommerceAcceleratedCheckoutCustomerInitializeOptions;
}
