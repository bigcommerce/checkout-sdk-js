import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderPaymentRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface MollieClient {
    createComponent(type: string, options?: object): MollieElement;
    createToken(): Promise<MollieToken>;
}

declare interface MollieElement {
    /**
     * The `element.mount` method attaches your element to the DOM.
     */
    mount(domElement: string | HTMLElement): void;
    /**
     * Unmounts the element from the DOM.
     * Call `element.mount` to re-attach it to the DOM.
     */
    unmount(): void;
    /**
     * Components can listen to several events.
     * The callback receives an object with all the related information.
     * blur | focus | change
     */
    addEventListener(event: 'blur' | 'focus' | 'change', callback: (event: Event) => void): void;
}

/**
 * A set of options that are required to initialize the Mollie payment method.
 *
 * Once Mollie payment is initialized, credit card form fields are provided by the
 * payment provider as IFrames, these will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'mollie',
 *      mollie: {
 *          containerId: 'container',
 *          cardNumberId: '',
 *          cardHolderId: '',
 *          cardCvcId: '',
 *          cardExpiryId: '',
 *          styles : {
 *              base: {
 *                  color: '#fff'
 *              }
 *          }
 *      }
 * });
 * ```
 */
declare interface MolliePaymentInitializeOptions {
    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     */
    containerId?: string;
    /**
     * The location to insert Mollie Component
     */
    cardNumberId: string;
    /**
     * The location to insert Mollie Component
     */
    cardHolderId: string;
    /**
     * The location to insert Mollie Component
     */
    cardCvcId: string;
    /**
     * The location to insert Mollie Component
     */
    cardExpiryId: string;
    /**
     * A set of styles required for the mollie components
     */
    styles: object;
    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
    unsupportedMethodMessage?: string;
    disableButton(disabled: boolean): void;
}

declare class MolliePaymentStrategy implements PaymentStrategy {
    private mollieScriptLoader;
    private paymentIntegrationService;
    private initializeOptions?;
    private mollieClient?;
    private cardHolderElement?;
    private cardNumberElement?;
    private verificationCodeElement?;
    private expiryDateElement?;
    private locale?;
    private hostedForm?;
    private unsubscribe?;
    constructor(mollieScriptLoader: MollieScriptLoader, paymentIntegrationService: PaymentIntegrationService);
    initialize(options: PaymentInitializeOptions & WithMolliePaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(options?: PaymentRequestOptions): Promise<void>;
    protected executeWithCC(payment: OrderPaymentRequestBody): Promise<void>;
    protected executeWithVaulted(payment: OrderPaymentRequestBody): Promise<void>;
    protected executeWithAPM(payment: OrderPaymentRequestBody): Promise<void>;
    private isCreditCard;
    private shouldShowTSVHostedForm;
    private mountCardVerificationfields;
    private isHostedPaymentFormEnabled;
    private isHostedFieldAvailable;
    private processAdditionalAction;
    private getInitializeOptions;
    private loadMollieJs;
    private getMollieClient;
    private getShopperLocale;
    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     *
     * We had to add a settimeout because Mollie sets de tab index after mounting
     * each component, but without a setTimeOut Mollie is not able to find the
     * components as they are hidden so we need to wait until they are shown
     */
    private mountElements;
    private loadPaymentMethodsAllowed;
}

declare class MollieScriptLoader {
    private scriptLoader;
    private mollieHostWindow;
    constructor(scriptLoader: ScriptLoader, mollieHostWindow?: Window);
    load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient>;
}

declare interface MollieToken {
    token: string;
    error?: object;
}

declare interface WithMolliePaymentInitializeOptions {
    /**
     * The options that are required to initialize the Mollie payment
     * method. They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
}

export declare const createMolliePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<MolliePaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    gateway: string;
    id: string;
}>;
