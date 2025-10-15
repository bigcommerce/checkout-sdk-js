import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { StripeAppearanceOptions } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeAppearanceValues } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeCustomFont } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeElementUpdateOptions } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeIntegrationService } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripePaymentInitializeOptions } from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeScriptLoader } from '@bigcommerce/checkout-sdk/stripe-utils';

declare class StripeLinkV2CustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private loadingIndicator;
    private _stripeClient?;
    private _stripeElements?;
    private _linkV2Element?;
    private _amountTransformer?;
    private _onComplete?;
    private _loadingIndicatorContainer?;
    private _captureMethod?;
    private _currencyCode?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options: CustomerInitializeOptions & WithStripeOCSCustomerInitializeOptions): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(): Promise<void>;
    deinitialize(): Promise<void>;
    private _mountExpressCheckoutElement;
    /** Events * */
    private _initializeEvents;
    private _onShippingAddressChange;
    private _onCancel;
    private _onShippingRateChange;
    /** Confirm methods * */
    private _onConfirm;
    private _updateShippingAndBillingAddress;
    private _mapShippingAddress;
    private _mapBillingAddress;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _completeCheckoutFlow;
    private _getPaymentPayload;
    /** Utils * */
    private _shouldRequireShippingAddress;
    private _updateDisplayedPrice;
    private _getCurrency;
    private _getTotalPrice;
    private _getAvailableCountries;
    private _getAvailableShippingOptions;
    private _getStripeShippingOption;
    private _handleShippingOptionChange;
    private _getAmountTransformer;
    private _toCents;
    private _toggleLoadingIndicator;
}

declare interface StripeOCSCustomerInitializeOptions {
    buttonHeight?: number;
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    gatewayId: string;
    onComplete?: (orderId?: number) => Promise<never>;
    loadingContainerId?: string;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gateway: 'stripeocs',
 *     id: 'optimized_checkout',
 *     stripeocs {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeOCSPaymentInitializeOptions extends StripePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Checkout styles from store theme
     */
    style?: Record<string, StripeAppearanceValues>;
    /**
     * Stripe OCS layout options
     */
    layout?: Record<string, string | number | boolean>;
    /**
     * Stripe OCS appearance options for styling the accordion.
     */
    appearance?: StripeAppearanceOptions;
    /**
     * Stripe OCS fonts options for styling the accordion.
     */
    fonts?: StripeCustomFont[];
    onError?(error?: Error): void;
    render(): void;
    paymentMethodSelect?(id: string): void;
    handleClosePaymentMethod?(collapseElement: () => void): void;
    togglePreloader?(showLoader: boolean): void;
}

declare class StripeOCSPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private stripeClient?;
    private stripeElements?;
    private selectedMethodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeOCSPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _initializeStripeElement;
    private _loadStripeJs;
    private _collapseStripeElement;
    private _getPaymentPayload;
    private _processAdditionalAction;
    private _confirmStripePaymentOrThrow;
    private _onStripeElementChange;
    private _shouldSaveInstrument;
    private _getTokenizedOptions;
}

declare interface StripeUPECustomerInitializeOptions {
    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container: string;
    /**
     * The identifier of the payment method.
     */
    methodId: string;
    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Stripeupe and Klarna.
     */
    gatewayId: string;
    /**
     * A callback that gets called whenever the Stripe Link Authentication Element's value changes.
     *
     * @param authenticated - if the email is authenticated on Stripe.
     * @param email - The new value of the email.
     */
    onEmailChange(authenticated: boolean, email: string): void;
    /**
     * A callback that gets called when Stripe Link Authentication Element is Loaded.
     */
    isLoading(mounted: boolean): void;
    /**
     * get styles from store theme
     */
    getStyles?(): {
        [key: string]: string;
    } | undefined;
}

declare class StripeUPECustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private _stripeElements?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader);
    initialize(options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
}

/**
 * A set of options that are required to initialize the Stripe payment method.
 *
 * Once Stripe payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'stripeupe',
 *     stripeupe {
 *         containerId: 'container',
 *     },
 * });
 * ```
 */
declare interface StripeUPEPaymentInitializeOptions extends StripePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    containerId: string;
    /**
     * Checkout styles from store theme
     */
    style?: Record<string, StripeAppearanceValues>;
    onError?(error?: Error): void;
    render(): void;
    initStripeElementUpdateTrigger?(updateTriggerFn: (payload: StripeElementUpdateOptions) => void): void;
}

declare class StripeUPEPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private scriptLoader;
    private stripeIntegrationService;
    private _stripeUPEClient?;
    private _stripeElements?;
    private _isStripeElementUpdateEnabled?;
    private _allowRedisplayForStoredInstruments?;
    constructor(paymentIntegrationService: PaymentIntegrationService, scriptLoader: StripeScriptLoader, stripeIntegrationService: StripeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithStripeUPEPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _executeWithStripeConfirmation;
    private _executeWithVaulted;
    private _loadStripeElement;
    private _processAdditionalActionWithStripeConfirmation;
    private _confirmStripePaymentOrThrow;
    private _processVaultedAdditionalAction;
    private _loadStripeJs;
    private _getPaymentPayload;
    private _updateStripeElement;
    private _getStripeElementTerms;
    private _updateStripeLinkStateByElementType;
}

declare interface WithStripeOCSCustomerInitializeOptions {
    stripeocs?: StripeOCSCustomerInitializeOptions;
}

declare interface WithStripeOCSPaymentInitializeOptions {
    stripeocs?: StripeOCSPaymentInitializeOptions;
}

declare interface WithStripeUPECustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using StripeUPE.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
}

declare interface WithStripeUPEPaymentInitializeOptions {
    stripeupe?: StripeUPEPaymentInitializeOptions;
}

export declare const createStripeLinkV2CustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeLinkV2CustomerStrategy>, {
    id: string;
}>;

export declare const createStripeOCSPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeOCSPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createStripeUPECustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<StripeUPECustomerStrategy>, {
    id: string;
}>;

export declare const createStripeUPEPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<StripeUPEPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    gateway: string;
    id: string;
}>;

export declare const createStripeV3PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<any>, {
    gateway: string;
}>;
