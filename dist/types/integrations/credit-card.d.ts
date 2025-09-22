import { HostedForm } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options to initialize credit card payment methods, unless those
 * methods require provider-specific configuration. If the initialization is
 * successful, hosted (iframed) credit card fields will be inserted into the the
 * containers specified in the options.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card fields will be inserted -->
 * <div id="card-number"></div>
 * <div id="card-name"></div>
 * <div id="card-expiry"></div>
 * <div id="card-code"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'authorizenet',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'authorizenet',
 *     creditCard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
 *                     fontFamily: 'Arial',
 *                 },
 *                 error: {
 *                     color: '#f00',
 *                 },
 *                 focus: {
 *                     color: '#0f0',
 *                 },
 *             },
 *             onBlur({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onFocus({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onEnter({ fieldType }) {
 *                 console.log(fieldType);
 *             },
 *             onCardTypeChange({ cardType }) {
 *                 console.log(cardType);
 *             },
 *             onValidate({ errors, isValid }) {
 *                 console.log(errors);
 *                 console.log(isValid);
 *             },
 *         },
 *     },
 * });
 * ```
 */
declare interface CreditCardPaymentInitializeOptions {
    form: HostedFormOptions;
    bigpayToken?: string;
}

declare class CreditCardPaymentStrategy implements PaymentStrategy {
    protected _paymentIntegrationService: PaymentIntegrationService;
    protected _hostedForm?: HostedForm;
    protected _shouldRenderHostedForm?: boolean;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    initialize(options?: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean;
    private _isHostedFieldAvailable;
}

declare interface WithCreditCardPaymentInitializeOptions {
    creditCard?: CreditCardPaymentInitializeOptions;
}

export declare const createCreditCardPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CreditCardPaymentStrategy>, {
    default: boolean;
}>;
