import { Address } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BraintreeClient } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlane } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFastlaneVaultedInstrument } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeFormOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeHostWindow } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeHostedFields } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeHostedFieldsCreatorConfig } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeIntegrationService } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeMessages } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeOrderStatusData } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeSDKVersionManager } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeScriptLoader } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BraintreeThreeDSecureOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { FormPoster } from '@bigcommerce/form-poster';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalStyleOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { TokenizationPayload } from '@bigcommerce/checkout-sdk/braintree-utils';

declare interface BraintreeAchInitializeOptions {
    /**
     * A callback that returns text that should be displayed to the customer in UI for proof of authorization
     */
    getMandateText: () => string;
}

declare class BraintreeAchPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeSdk;
    private usBankAccount?;
    private getMandateText?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeSdk: BraintreeSdk);
    initialize(options: PaymentInitializeOptions & WithBraintreeAchPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private tokenizePayment;
    private tokenizePaymentForVaultedInstrument;
    private preparePaymentData;
    private preparePaymentDataForVaultedInstrument;
    private getBankDetails;
    private getUsBankAccountOrThrow;
    private handleBraintreeError;
}

declare interface BraintreeCreditCardPaymentInitializeOptions {
    /**
     * A list of card brands that are not supported by the merchant.
     *
     * List of supported brands by braintree can be found here: https://braintree.github.io/braintree-web/current/module-braintree-web_hosted-fields.html#~field
     * search for `supportedCardBrands` property.
     *
     * List of credit cards brands:
     * 'visa',
     * 'mastercard',
     * 'american-express',
     * 'diners-club',
     * 'discover',
     * 'jcb',
     * 'union-pay',
     * 'maestro',
     * 'elo',
     * 'mir',
     * 'hiper',
     * 'hipercard'
     *
     * */
    unsupportedCardBrands?: string[];
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    containerId?: string;
    threeDSecure?: BraintreeThreeDSecureOptions;
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

declare class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeHostedForm;
    private is3dsEnabled?;
    private isHostedFormInitialized?;
    private deviceSessionId?;
    private paymentMethod?;
    private threeDSecure?;
    private onPaymentError?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostedForm: BraintreeHostedForm);
    initialize(options: PaymentInitializeOptions & WithBraintreeCreditCardPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private handleError;
    private preparePaymentData;
    private prepareHostedPaymentData;
    private verifyCardWithHostedForm;
    private processAdditionalAction;
    private isHostedPaymentFormEnabled;
    private isSubmittingWithStoredCard;
    private shouldPerform3DSVerification;
    private shouldInitializeBraintreeFastlane;
    private initializeBraintreeFastlaneOrThrow;
}

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
declare interface BraintreeFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
}

declare class BraintreeFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private braintreeFastlaneUtils;
    private isAcceleratedCheckoutEnabled;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeFastlaneUtils: BraintreeFastlaneUtils);
    initialize({ methodId, braintreefastlane, }: CustomerInitializeOptions & WithBraintreeFastlaneCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private shouldRunAuthenticationFlow;
    private getValidPaymentMethodOrThrow;
}

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
declare interface BraintreeFastlanePaymentInitializeOptions {
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
    onError?: (error: Error) => void;
}

declare class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeFastlaneUtils;
    private braintreeSdk;
    private braintreeCardComponent?;
    private is3DSEnabled?;
    private onError?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeFastlaneUtils: BraintreeFastlaneUtils, braintreeSdk: BraintreeSdk);
    /**
     *
     * Default methods
     *
     */
    initialize(options: PaymentInitializeOptions & WithBraintreeFastlanePaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Braintree Fastlane Component rendering method
     *
     */
    private initializeCardComponent;
    private renderBraintreeCardComponent;
    /**
     *
     * Payment Payload preparation methods
     *
     */
    private preparePaymentPayload;
    /**
     * 3DS
     */
    private get3DS;
    /**
     *
     * Mapper methods
     *
     */
    private mapToPayPalAddress;
    /**
     *
     * Other methods
     *
     */
    private shouldRunAuthenticationFlow;
    private getBraintreeCardComponentOrThrow;
    private getPayPalInstruments;
    /**
     *
     * Braintree Fastlane instrument change
     *
     */
    private handleBraintreeStoredInstrumentChange;
}

declare class BraintreeFastlaneUtils {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeFastlane?;
    private methodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService);
    getDeviceSessionId(): Promise<string | undefined>;
    /**
     *
     * Initialization method
     *
     */
    initializeBraintreeFastlaneOrThrow(methodId: string, styles?: BraintreeFastlaneStylesOption): Promise<void>;
    getBraintreeFastlaneOrThrow(): BraintreeFastlane;
    getBraintreeFastlaneComponentOrThrow(): BraintreeFastlane['FastlaneCardComponent'];
    /**
     *
     * Authentication methods
     *
     * */
    runPayPalAuthenticationFlowOrThrow(email?: string, shouldSetShippingOption?: boolean): Promise<void>;
    /**
     *
     * Session id management
     *
     */
    getSessionIdFromCookies(): string;
    saveSessionIdToCookies(sessionId: string): void;
    removeSessionIdFromCookies(): void;
    /**
     *
     * PayPal to BC data mappers
     *
     * */
    mapPayPalToBcInstrument(methodId: string, instruments?: BraintreeFastlaneVaultedInstrument[]): CardInstrument[] | undefined;
    private mapPayPalToBcAddress;
    /**
     *
     * Get PayPal billing addresses from stored braintree instruments info
     *
     * */
    private getPayPalBillingAddresses;
    private normalizeAddress;
    private mergeShippingAndBillingAddresses;
    /**
     *
     * Other
     *
     * */
    private getMethodIdOrThrow;
    private setShippingOption;
}

declare class BraintreeHostedForm {
    private braintreeScriptLoader;
    private braintreeSDKVersionManager;
    private cardFields?;
    private formOptions?;
    private type?;
    private client?;
    private clientToken?;
    private isInitializedHostedForm;
    constructor(braintreeScriptLoader: BraintreeScriptLoader, braintreeSDKVersionManager: BraintreeSDKVersionManager);
    initialize(options: BraintreeFormOptions, unsupportedCardBrands?: string[], clientToken?: string): Promise<void>;
    isInitialized(): boolean;
    deinitialize(): Promise<void>;
    validate(): void;
    tokenize(billingAddress: Address): Promise<TokenizationPayload>;
    tokenizeForStoredCardVerification(): Promise<TokenizationPayload>;
    createHostedFields(options: Pick<BraintreeHostedFieldsCreatorConfig, 'fields' | 'styles'>): Promise<BraintreeHostedFields>;
    getClient(): Promise<BraintreeClient>;
    private mapBillingAddress;
    private mapFieldOptions;
    private mapStyleOptions;
    private mapFieldType;
    private mapErrors;
    private mapValidationErrors;
    private mapTokenizeError;
    private createRequiredError;
    private createInvalidError;
    private handleBlur;
    private handleFocus;
    private handleCardTypeChange;
    private handleInputSubmitRequest;
    private handleValidityChange;
    private isValidForm;
    private isValidParam;
}

declare interface BraintreeLocalMethodsPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * Text that will be displayed on lpm button
     */
    buttonText: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError(error: unknown): void;
}

declare class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeSdk;
    private braintreeRequestSender;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private braintreelocalmethods?;
    private braintreeLocalPayment?;
    private loadingIndicatorContainer?;
    private orderId?;
    private gatewayId?;
    private isLPMsUpdateExperimentEnabled;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeSdk: BraintreeSdk, braintreeRequestSender: BraintreeRequestSender, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private executeWithNotInstantLPM;
    private executeWithInstantLPM;
    private getLPMsBasicPaymentData;
    private getInstantLPMConfig;
    private getInstantLPMCallback;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    private handleError;
    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod;
    private isBraintreeRedirectError;
    private isBraintreeOrderSavedResponse;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    private reinitializeStrategy;
}

declare interface BraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class BraintreePaypalButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeHostWindow;
    private buyNowCartId;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CheckoutButtonInitializeOptions & WithBraintreePaypalButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private createBuyNowCart;
    private handleError;
}

declare interface BraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The ID of a container where the messaging component should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;
    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class BraintreePaypalCreditButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeMessages;
    private braintreeHostWindow;
    private buyNowCartId;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeMessages: BraintreeMessages, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CheckoutButtonInitializeOptions & WithBraintreePaypalCreditButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderPayPalMessages;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private createBuyNowCart;
    private handleError;
}

declare interface BraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    buttonHeight?: number;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare class BraintreePaypalCreditCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CustomerInitializeOptions & WithBraintreePaypalCreditCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private handleError;
}

declare interface BraintreePaypalCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    buttonHeight?: number;
    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare class BraintreePaypalCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeIntegrationService;
    private braintreeHostWindow;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeIntegrationService: BraintreeIntegrationService, braintreeHostWindow: BraintreeHostWindow);
    initialize(options: CustomerInitializeOptions & WithBraintreePaypalCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePayment;
    private handleError;
}

declare interface BraintreePaypalPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    containerId?: string;
    threeDSecure?: BraintreeThreeDSecureOptions;
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

declare class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeMessages;
    private loadingIndicator;
    private paymentMethod?;
    private braintreeHostWindow;
    private braintree?;
    private braintreeTokenizePayload?;
    private paypalButtonRender?;
    private loadingIndicatorContainer?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService, braintreeMessages: BraintreeMessages, loadingIndicator: LoadingIndicator);
    initialize(options: PaymentInitializeOptions & WithBraintreePaypalPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private preparePaymentData;
    private formattedPayload;
    private loadPaypalCheckoutInstance;
    private renderPayPalMessages;
    private renderPayPalButton;
    private setupPayment;
    private tokenizePaymentOrThrow;
    private loadPaypal;
    private handleError;
    private isProviderError;
    private removeElement;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare class BraintreeRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<BraintreeOrderStatusData>;
}

declare interface BraintreeVenmoButtonInitializeOptions {
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BuyNowInitializeOptions;
    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PaypalStyleOptions, 'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'>;
    /**
     * A callback that gets called on any error.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
}

declare class BraintreeVenmoButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeSdk;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeSdk: BraintreeSdk);
    initialize(options: CheckoutButtonInitializeOptions & WithBraintreeVenmoInitializeOptions_2): Promise<void>;
    deinitialize(): Promise<void>;
    private handleError;
    private createBuyNowCart;
    private handleInitializationVenmoError;
    private removeVenmoContainer;
    private renderVenmoButton;
    private handlePostForm;
}

declare class BraintreeVenmoPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private braintreeIntegrationService;
    private braintreeVenmoCheckout?;
    private venmoOptions?;
    constructor(paymentIntegrationService: PaymentIntegrationService, braintreeIntegrationService: BraintreeIntegrationService);
    initialize(options: PaymentInitializeOptions & WithBraintreeVenmoInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private handleError;
    private initializeBraintreeVenmo;
    private preparePaymentData;
    private formattedPayload;
    private braintreeVenmoTokenize;
}

declare interface BraintreeVenmoPaymentStrategyInitializeOptions {
    /**
     * An option that can provide different payment authorization methods, for more information use the following link: https://developer.paypal.com/braintree/docs/guides/venmo/client-side/javascript/v3/#desktop-qr-code
     * If no value is specified, it will be true
     */
    allowDesktop?: boolean;
}

declare class BraintreeVisaCheckoutButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeSdk;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeSdk: BraintreeSdk);
    initialize(options: CheckoutButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private paymentSuccess;
    private postForm;
    private toVisaCheckoutAddress;
    private getAddress;
    private createSignInButton;
    private insertVisaCheckoutButton;
}

declare interface BraintreeVisaCheckoutCustomerInitializeOptions {
    container: string;
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

declare class BraintreeVisaCheckoutCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeSdk;
    private buttonClassName;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeSdk: BraintreeSdk);
    initialize(options: CustomerInitializeOptions & WithBraintreeVisaCheckoutCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private tokenizePayment;
    private postForm;
    private mapToVisaCheckoutAddress;
    private getAddress;
    private createSignInButton;
    private insertVisaCheckoutButton;
    private handleError;
}

declare interface BraintreeVisaCheckoutPaymentInitializeOptions {
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}

declare class BraintreeVisaCheckoutPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private formPoster;
    private braintreeSdk;
    private paymentMethod?;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster, braintreeSdk: BraintreeSdk);
    initialize(options: PaymentInitializeOptions & WithBraintreeVisaCheckoutPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<any>;
    deinitialize(): Promise<void>;
    private tokenizePayment;
    private mapToVisaCheckoutAddress;
    private postForm;
    private getAddress;
    private handleError;
}

declare interface BuyNowInitializeOptions {
    getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
}

declare interface WithBraintreeAchPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Braintree ACH payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    braintreeach?: BraintreeAchInitializeOptions;
}

declare interface WithBraintreeCreditCardPaymentInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintree?: BraintreeCreditCardPaymentInitializeOptions;
}

declare interface WithBraintreeFastlaneCustomerInitializeOptions {
    braintreefastlane?: BraintreeFastlaneCustomerInitializeOptions;
}

declare interface WithBraintreeFastlanePaymentInitializeOptions {
    braintreefastlane?: BraintreeFastlanePaymentInitializeOptions;
}

declare interface WithBraintreeLocalMethodsPaymentInitializeOptions {
    braintreelocalmethods?: BraintreeLocalMethodsPaymentInitializeOptions;
}

declare interface WithBraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
}

declare interface WithBraintreePaypalCreditButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal Credit wallet button on Product and Cart page.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;
}

declare interface WithBraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypalcredit?: BraintreePaypalCreditCustomerInitializeOptions;
}

declare interface WithBraintreePaypalCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalCustomerInitializeOptions;
}

declare interface WithBraintreePaypalPaymentInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintree?: BraintreePaypalPaymentInitializeOptions;
}

declare interface WithBraintreeVenmoInitializeOptions {
    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoPaymentStrategyInitializeOptions;
}

declare interface WithBraintreeVenmoInitializeOptions_2 {
    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoButtonInitializeOptions;
}

declare interface WithBraintreeVisaCheckoutCustomerInitializeOptions {
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;
}

declare interface WithBraintreeVisaCheckoutPaymentInitializeOptions {
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;
}

export declare const createBraintreeAchPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeAchPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeCreditCardPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeCreditCardPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreeFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreeFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeLocalMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeLocalMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createBraintreePaypalButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BraintreePaypalButtonStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalCreditButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BraintreePaypalCreditButtonStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalCreditCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreePaypalCreditCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreePaypalCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreePaypalPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreePaypalPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeVenmoButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BraintreeVenmoButtonStrategy>, {
    id: string;
}>;

export declare const createBraintreeVenmoPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BraintreeVenmoPaymentStrategy>, {
    id: string;
}>;

export declare const createBraintreeVisaCheckoutButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BraintreeVisaCheckoutButtonStrategy>, {
    id: string;
}>;

export declare const createBraintreeVisaCheckoutCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BraintreeVisaCheckoutCustomerStrategy>, {
    id: string;
}>;

export declare const createBraintreeVisaCheckoutPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BraintreeVisaCheckoutPaymentStrategy>, {
    id: string;
}>;
