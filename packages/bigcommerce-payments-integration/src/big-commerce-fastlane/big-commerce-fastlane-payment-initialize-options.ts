import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

/**
 * A set of options that are required to initialize the PayPalCommerce Accelerated Checkout payment
 * method for presenting on the page.
 *
 *
 * Also, PayPalCommerce requires specific options to initialize PayPal Fastlane Card Component
 * ```html
 * <!-- This is where the PayPal Fastlane Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerceacceleratedcheckout', // PayPal Fastlane has 'paypalcommerceacceleratedcheckout' method id
 *     paypalcommercefastlane: {
 *         onInit: (renderPayPalCardComponent) => renderPayPalCardComponent('#container-id'),
 *         onChange: (showPayPalCardSelector) => showPayPalCardSelector(),
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
export default interface BigCommerceFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the BigCommerce Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalCardComponent: (container: string) => void) => void;

    /**
     * Is a callback that shows BigCommerce stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;

    /**
     * Is a stylisation options for customizing BigCommerce Fastlane components
     *
     * Note: the styles for all PayPalCommerceFastlane strategies should be the same,
     * because they will be provided to BigCommerce library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

export interface WithBigCommerceFastlanePaymentInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommerceFastlanePaymentInitializeOptions;
}
