import { AnalyticsExtraItemsManager } from '@bigcommerce/checkout-sdk/analytics';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface BoltAuthorization {
    status: string;
    reason: string;
}

declare interface BoltButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BoltBuyNowInitializeOptions;
    style?: BoltButtonStyleOptions;
}

declare class BoltButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private boltScriptLoader;
    boltHostWindow: BoltHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, boltScriptLoader: BoltScriptLoader, boltHostWindow?: BoltHostWindow);
    initialize(options: CheckoutButtonInitializeOptions & WithBoltButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private addButtonContainer;
    private getBoltObjectData;
    private getButtonHeight;
    private getButtonBorderRadius;
}

declare interface BoltButtonStyleOptions {
    shape?: StyleButtonShape;
    size?: StyleButtonSize;
}

declare interface BoltBuyNowInitializeOptions {
    storefrontApiToken?: string;
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

declare interface BoltCallbacks {
    check?(): boolean;
    onCheckoutStart?(): void;
    onPaymentSubmit?(): void;
    success(transaction: BoltTransaction, callback: () => void): void;
    close?(): void;
}

declare interface BoltCart {
    orderToken: string;
}

declare interface BoltCheckout {
    configure(cart: BoltCart, hints: Record<string, never>, callbacks?: BoltCallbacks): BoltClient;
    hasBoltAccount(email: string): Promise<boolean>;
    getTransactionReference(): Promise<string | undefined>;
    openCheckout(email: string, callbacks?: BoltOpenCheckoutCallbacks): Promise<void>;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
    setOrderId(orderId: number): Promise<void>;
}

declare interface BoltClient {
    open(): void;
}

declare interface BoltConnect {
    setupProductPageCheckout?(): void;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Bolt.
 */
declare interface BoltCustomerInitializeOptions {
    /**
     * A callback that gets called on initialize the strategy
     *
     * @param hasBoltAccount - The hasBoltAccount variable handle the result of checking user account availability on Bolt.
     * @param email - Email address which was used for checking user account availability on Bolt.
     */
    onInit?(hasBoltAccount: boolean, email?: string): void;
}

declare class BoltCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private boltScriptLoader;
    private boltHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, boltScriptLoader: BoltScriptLoader);
    initialize(options: CustomerInitializeOptions & WithBoltCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private openBoltCheckoutModalOrThrow;
    private getBoltClientOrThrow;
    private hasBoltAccount;
    private getCustomerEmail;
}

declare enum BoltDeveloperMode {
    SandboxMode = "bolt_sandbox",
    StagingMode = "bolt_staging",
    DevelopmentMode = "bolt_development"
}

declare interface BoltDeveloperModeParams {
    developerMode: BoltDeveloperMode;
    developerDomain: string;
}

declare interface BoltEmbedded {
    create(name: string, options?: BoltEmbeddedOptions): BoltEmbededField;
}

declare interface BoltEmbeddedOptions {
    styles: {
        backgroundColor: string;
    };
    renderSeparateFields?: boolean;
}

declare interface BoltEmbeddedTokenize {
    bin: string;
    expiration: string;
    last4: string;
    postal_code?: string;
    token: string;
    token_type: string;
}

declare interface BoltEmbededField {
    mount(element: string): void;
    unmount(): void;
    tokenize(): Promise<BoltEmbeddedTokenize | Error>;
}

declare interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
    BoltConnect?: BoltConnect;
    Bolt?(publicKey: string): BoltEmbedded;
}

declare interface BoltOpenCheckoutCallbacks {
    close?(): void;
}

/**
 * A set of options that are required to initialize the Bolt payment method with:
 *
 * 1) Bolt Full Checkout:
 *
 * If the customer chooses to pay with Bolt, he will be asked to
 * enter his payment details via Bolt Full Checkout.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 * });
 * ```
 *
 * 2) Bolt Client:
 *
 * If the customer chooses to pay with Bolt in payment section of Checkout page,
 * the Bolt Payment Modal will be shown, and the customer will be asked
 * to enter payment details via Bolt Modal
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 *     bolt: {
 *         useBigCommerceCheckout: true,
 *     }
 * });
 * ```
 *
 * 3) Bolt Embedded:
 *
 * A set of options that are required to initialize the Bolt payment method
 * for presenting its credit card form.
 *
 * ```html
 * <!-- These containers are where the hosted (iframed) credit card field will be inserted -->
 * <div id="bolt-embedded"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bolt',
 *     bolt: {
 *         useBigCommerceCheckout: true,
 *         containerId: 'boltEmbeddedContainerId',
 *     }
 * });
 * ```
 */
declare interface BoltPaymentInitializeOptions {
    useBigCommerceCheckout: boolean;
    /**
     * The CSS selector of a container where the Bolt Embedded payment field should be inserted into.
     */
    containerId?: string;
    /**
     * A callback that gets called when the customer selects Bolt as payment option.
     */
    onPaymentSelect?(hasBoltAccount: boolean): void;
}

declare class BoltPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private boltScriptLoader;
    private analyticsExtraItemsManager;
    private boltClient?;
    private boltEmbedded?;
    private embeddedField?;
    private useBoltClient;
    private useBoltEmbedded;
    constructor(paymentIntegrationService: PaymentIntegrationService, boltScriptLoader: BoltScriptLoader, analyticsExtraItemsManager: AnalyticsExtraItemsManager);
    initialize(options: PaymentInitializeOptions & WithBoltPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    finalize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private getBoltClientPaymentPayload;
    private getBoltEmbeddedPaymentPayload;
    private getBoltFullCheckoutPaymentPayload;
    private getBoltClientOrThrow;
    private getBoltEmbeddedOrThrow;
    private hasBoltAccount;
    private setBoltOrderId;
    private mountBoltEmbeddedField;
    private validateTokenizeResultOrThrow;
    private setExtraItemsForAnalytics;
}

declare class BoltScriptLoader {
    private scriptLoader;
    boltHostWindow: BoltHostWindow;
    constructor(scriptLoader: ScriptLoader, boltHostWindow?: BoltHostWindow);
    loadBoltClient(publishableKey?: string, testMode?: boolean, developerModeParams?: BoltDeveloperModeParams, cartId?: string, storefrontApiToken?: string): Promise<BoltCheckout>;
    loadBoltEmbedded(publishableKey: string, testMode?: boolean, developerModeParams?: BoltDeveloperModeParams): Promise<BoltEmbedded>;
    getDomainURL(testMode: boolean, developerModeParams?: BoltDeveloperModeParams): string;
    private getScriptOptions;
}

declare interface BoltTransaction {
    id: string;
    type: string;
    processor: string;
    date: number;
    reference: string;
    status: string;
    authorization: BoltAuthorization;
}

declare enum StyleButtonShape {
    Pill = "pill",
    Rect = "rect"
}

declare enum StyleButtonSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
}

declare interface WithBoltButtonInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltButtonInitializeOptions;
}

declare interface WithBoltCustomerInitializeOptions {
    bolt?: BoltCustomerInitializeOptions;
}

declare interface WithBoltPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltPaymentInitializeOptions;
}

export declare const createBoltButtonStrategy: import("../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BoltButtonStrategy>, {
    id: string;
}>;

export declare const createBoltCustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BoltCustomerStrategy>, {
    id: string;
}>;

export declare const createBoltPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BoltPaymentStrategy>, {
    id: string;
}>;
