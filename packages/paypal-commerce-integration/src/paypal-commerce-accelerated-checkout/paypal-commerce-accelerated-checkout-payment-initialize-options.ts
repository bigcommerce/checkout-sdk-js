import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceConnectStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

/**
 * A set of options that are required to initialize the PayPalCommerce Accelerated Checkout payment
 * method for presenting on the page.
 *
 *
 * Also, PayPalCommerce requires specific options to initialize PayPalCommerce Accelerated Checkout Credit Card Component
 * ```html
 * <!-- This is where the PayPalCommerce Credit Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerceacceleratedcheckout',
 *     paypalcommerceacceleratedcheckout: {
 *         onInit: (renderPayPalComponentMethod) => renderPayPalComponentMethod('#container-id'),
 *         onChange: (showPayPalConnectCardSelector) => showPayPalConnectCardSelector(),
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
export default interface PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the PayPal Connect form should be inserted into.
     */
    onInit?: (renderPayPalConnectCardComponent: (container: string) => void) => void;

    /**
     * Is a callback that shows PayPal stored instruments
     * when get triggered
     */
    onChange?: (showPayPalConnectCardSelector: () => Promise<CardInstrument | undefined>) => void;

    /**
     * Is a stylisation options for customizing PayPal Connect components
     *
     * Note: the styles for all PayPalCommerce Accelerated Checkout strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalCommerceConnectStylesOption;
}

export interface WithPayPalCommerceAcceleratedCheckoutPaymentInitializeOptions {
    paypalcommerceacceleratedcheckout?: PayPalCommerceAcceleratedCheckoutPaymentInitializeOptions;
}
