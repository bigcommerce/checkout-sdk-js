import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';

/**
 * A set of options that are optional to initialize the Braintree Fastlane customer strategy
 * that are responsible for Braintree Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'braintreeacceleratedcheckout', // 'braintree' only for A/B testing
 *     braintreefastlane: {
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
export default interface BraintreeFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
}

export interface WithBraintreeFastlaneCustomerInitializeOptions {
    braintreefastlane?: BraintreeFastlaneCustomerInitializeOptions;
}
