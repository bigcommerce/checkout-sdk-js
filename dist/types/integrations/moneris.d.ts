import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';

export declare const createMonerisPaymentStrategy: ResolvableModule<PaymentStrategyFactory<MonerisPaymentStrategy>, {
id: string;
}>;

/**
 * A set of options that are required to initialize the Moneris payment method.
 *
 * Once Moneris payment is initialized, a credit card payment form is provided by the
 * payment provider as an IFrame, it will be inserted into the current page. These
 * options provide a location and styling for the payment form.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'moneris',
 *      moneris: {
 *          containerId: 'container',
 *          style : {
 *              cssBody: 'background:white;',
 *              cssTextbox: 'border-width:2px;',
 *              cssTextboxCardNumber: 'width:140px;',
 *              cssTextboxExpiryDate: 'width:40px;',
 *              cssTextboxCVV: 'width:40px;',
 *              cssInputLabel: 'font-weight:500;',
 *              cssLabelCardNumber: 'grid-column: 1 / 3; grid-row: 1;',
 *              cssLabelExpiryDate: 'grid-column: 1; grid-row: 2;',
 *              cssLabelCVV: 'grid-column: 2; grid-row: 2;',
 *          }
 *      }
 * });
 * ```
 */
declare interface MonerisPaymentInitializeOptions {
    /**
     * The ID of a container where the Moneris iframe component should be mounted
     */
    containerId: string;
    /**
     * The styling props to apply to the iframe component
     */
    style?: MonerisStylingProps;
    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
}

declare class MonerisPaymentStrategy {
    private paymentIntegrationService;
    private iframe?;
    private initializeOptions?;
    private windowEventListener?;
    private hostedForm?;
    constructor(paymentIntegrationService: PaymentIntegrationService);
    initialize(options: PaymentInitializeOptions & WithMonerisPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private executeWithCC;
    private executeWithVaulted;
    private shouldShowTSVHostedForm;
    private isHostedPaymentFormEnabled;
    private isHostedFieldAvailable;
    private getInitializeOptions;
    private mountCardVerificationfields;
    private createIframe;
    private handleMonerisResponse;
    private monerisURL;
}

/**
 * A set of stringified CSS to apply to Moneris' IFrame fields.
 * CSS attributes should be converted to string.
 * Please note that ClassNames are not supported.
 *
 * IE:
 * ```js
 * {
 *      cssBody: 'background:white;';
 *      cssTextbox: 'border-width:2px;';
 *      cssTextboxCardNumber: 'width:140px;';
 *      cssTextboxExpiryDate: 'width:40px;';
 *      cssTextboxCVV: 'width:40px;';
 *      cssInputLabel: 'font-weight:500;';
 *      cssLabelCardNumber: 'grid-column: 1 / 3; grid-row: 1;';
 *      cssLabelExpiryDate: 'grid-column: 1; grid-row: 2;';
 *      cssLabelCVV: 'grid-column: 2; grid-row: 2;';
 * }
 * ```
 *
 * When using several attributes use semicolon to separate each one.
 * IE: 'background:white;width:40px;'
 */
declare interface MonerisStylingProps {
    /**
     * Stringified CSS to apply to the body of the IFrame.
     */
    cssBody?: string;
    /**
     * Stringified CSS to apply to each of input fields.
     */
    cssTextbox?: string;
    /**
     * Stringified CSS to apply to the card's number field.
     */
    cssTextboxCardNumber?: string;
    /**
     * Stringified CSS to apply to the card's expiry field.
     */
    cssTextboxExpiryDate?: string;
    /**
     * Stringified CSS to apply to the card's CVV field.
     */
    cssTextboxCVV?: string;
    /**
     * Stringified CSS to apply to input labels
     */
    cssInputLabel?: string;
    /**
     * Layout CSS for the card number label (`#monerisDataLabel`).
     */
    cssLabelCardNumber?: string;
    /**
     * Layout CSS for the expiry date label (`#monerisExpLabel`).
     */
    cssLabelExpiryDate?: string;
    /**
     * Layout CSS for the CVV label (`#monerisCvdLabel`).
     */
    cssLabelCVV?: string;
}

declare interface WithMonerisPaymentInitializeOptions {
    moneris?: MonerisPaymentInitializeOptions;
}

