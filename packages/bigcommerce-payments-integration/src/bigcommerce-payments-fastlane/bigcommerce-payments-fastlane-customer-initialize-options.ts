import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';

/**
 * A set of options that are optional to initialize the BigCommercePayments Fastlane customer strategy
 * that are responsible for BigCommercePayments Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'bigcommerce_payments_fastlane',
 *     bigcommerce_payments_fastlane: {
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
export default interface BigCommercePaymentsFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

export interface WithBigCommercePaymentsFastlaneCustomerInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlaneCustomerInitializeOptions;
}
