import { OptionsResponse } from './digitalriver';

/**
 * A set of options that are required to initialize the DigitalRiver payment method.
 *
 * When DigitalRiver is initialized, a widget will be inserted into the DOM. The widget has a list of payment options for the customer to choose from.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *   methodId: 'digitalriver',
 *   digitalriver: {
 *       containerId: 'digitalriver-component-field',
 *       // Callback for submitting payment form that gets called when a buyer approves DR payment
 *       onSubmitForm: () => {
 *           // Example function
 *           this.submitOrder(
 *               {
 *                   payment: {methodId: 'digitalriver',}
 *               }
 *           );
 *       },
 *       onError: (error) => {
 *           console.log(error);
 *       },
 *   }
 * });
 * ```
 *
 * Additional options can be passed in to customize the components and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *   methodId: 'digitalriver',
 *   digitalriver: {
 *       containerId: 'digitalriver-component-field',
 *       configuration: {
 *           flow: 'checkout',
 *           showSavePaymentAgreement: false,
 *           showComplianceSection: true,
 *           button: {
 *               type: 'submitOrder',
 *           },
 *           usage: 'unscheduled',
 *           showTermsOfSaleDisclosure: true,
 *           paymentMethodConfiguration: {
 *               classes: {
 *                   // these classes are to control styles on BC side
 *                   base: 'form-input optimizedCheckout-form-input'
 *               },
 *           },
 *       },
 *       // Callback for submitting payment form that gets called when a buyer approves DR payment
 *      onSubmitForm: () => {
 *           // Example function
 *           this.submitOrder(
 *               {
 *                   payment: {methodId: 'digitalriver',}
 *               }
 *           );
 *       },
 *       onError: (error) => {
 *           console.log(error);
 *       },
 *   }
 * });
 * ```
 */

export default interface DigitalRiverPaymentInitializeOptions {
    /**
     * The ID of a container which the Digital River drop in component should be mounted
     */
    containerId: string;

    /**
     * Create a Configuration object for Drop-in that contains both required and optional values.
     * https://docs.digitalriver.com/digital-river-api/payment-integrations-1/drop-in/drop-in-integration-guide#step-5-configure-hydrate
     */
    configuration: OptionsResponse;

    /**
     * Callback for submitting payment form that gets called
     * when buyer pay with DigitalRiver.
     */
    onSubmitForm(): void;

    /**
     * Callback used to hide the standard submit button which is rendered right after the payment providers.
     */
    onRenderButton?(): void;

    /**
     * Callback that gets triggered when an error happens when submitting payment form and contains an object with codes and error messages
     */
    onError?(error: Error): void;
}

export interface WithDigitalRiverPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    digitalriver?: DigitalRiverPaymentInitializeOptions;
}
