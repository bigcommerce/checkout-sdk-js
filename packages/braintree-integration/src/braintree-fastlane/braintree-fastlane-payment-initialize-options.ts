import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options that are required to initialize the Braintree Fastlane payment
 * method for presenting on the page.
 *
 *
 * Also, Braintree requires specific options to initialize Braintree Fastlane Credit Card Component
 * ```html
 * <!-- This is where the Braintree Credit Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'braintreeacceleratedcheckout',
 *     braintreefastlane: {
 *         onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
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
export default interface BraintreeFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the Braintree Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalComponentMethod: (container: string) => void) => void;

    /**
     * Is a callback that shows Braintree stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;

    /**
     * Is a stylisation options for customizing Braintree Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
}

export interface WithBraintreeFastlanePaymentInitializeOptions {
    braintreefastlane?: BraintreeFastlanePaymentInitializeOptions;
}
