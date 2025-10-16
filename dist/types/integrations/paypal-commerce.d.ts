import { BillingAddressRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerCredentials } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CustomerStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ExecutePaymentMethodCheckoutOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { FormPoster } from '@bigcommerce/form-poster';
import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { HostedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceFastlaneUtils } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PayPalCommerceSdk } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { ShippingOption } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { VaultedInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare interface AllowedPaymentMethods {
    type: string;
    parameters: {
        allowedAuthMethods: string[];
        allowedCardNetworks: string[];
        billingAddressRequired: boolean;
        assuranceDetailsRequired: boolean;
        billingAddressParameters: {
            format: string;
        };
    };
    tokenizationSpecification: {
        type: string;
        parameters: {
            gateway: string;
            gatewayMerchantId: string;
        };
    };
}

declare interface ApproveCallbackActions {
    order: {
        get: () => Promise<PayPalOrderDetails>;
    };
}

declare interface ApproveCallbackPayload {
    orderID?: string;
}

declare interface BirthDate {
    getFullYear(): number;
    getDate(): number;
    getMonth(): number;
}

declare interface ClickCallbackActions {
    reject(): void;
    resolve(): void;
}

declare interface ClickCallbackPayload {
    fundingSource: string;
}

declare interface CompleteCallbackDataPayload {
    intent: string;
    orderID: string;
}

declare interface ConfirmOrderData {
    tokenizationData: {
        type: string;
        token: string;
    };
    info: {
        cardNetwork: string;
        cardDetails: string;
    };
    type: string;
}

declare interface DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form?: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

/**
 *
 * PayPal Commerce Funding sources
 *
 */
declare type FundingType = string[];

declare interface GooglePayConfig {
    allowedPaymentMethods: AllowedPaymentMethods[];
    apiVersion: number;
    apiVersionMinor: number;
    countryCode: string;
    isEligible: boolean;
    merchantInfo: {
        merchantId: string;
        merchantOrigin: string;
    };
}

declare interface InitCallbackActions {
    disable(): void;
    enable(): void;
}

declare interface InitCallbackPayload {
    correlationID: string;
}

declare interface LegalFunding {
    FUNDING: {
        PAY_UPON_INVOICE: string;
    };
}

declare enum LiabilityShiftEnum {
    Possible = "POSSIBLE",
    No = "NO",
    Unknown = "UNKNOWN",
    Yes = "YES"
}

declare interface PayPalAddress {
    city: string;
    countryCode: string;
    postalCode: string;
    state: string;
}

declare interface PayPalBNPLConfigurationItem {
    id: string;
    name: string;
    status: boolean;
    styles: Record<string, string>;
}

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

/**
 *
 * PayPal Commerce BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}

declare interface PayPalCommerceAlternativeMethodsButtonOptions {
    /**
     * Alternative payment method id what used for initialization PayPal button as funding source.
     */
    apm: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class PayPalCommerceAlternativeMethodsButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithPayPalCommerceAlternativeMethodsButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * <!-- This is where the PayPal alternative payment methods fields will be inserted.  -->
 * <div id="apm-fields-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gatewayId: 'paypalcommercealternativemethods',
 *     methodId: 'sepa',
 *     paypalcommercealternativemethods: {
 *         container: '#container',
 *         apmFieldsContainer: '#apm-fields-container',
 *         apmFieldsStyles: {
 *             base: {
 *                 backgroundColor: 'transparent',
 *             },
 *             input: {
 *                 backgroundColor: 'white',
 *                 fontSize: '1rem',
 *                 color: '#333',
 *                 borderColor: '#d9d9d9',
 *                 borderRadius: '4px',
 *                 borderWidth: '1px',
 *                 padding: '1rem',
 *             },
 *             invalid: {
 *                 color: '#ed6a6a',
 *             },
 *             active: {
 *                 color: '#4496f6',
 *             },
 *         },
 *         clientId: 'YOUR_CLIENT_ID',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercealternativemethods', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceAlternativeMethodsPaymentOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * The CSS selector of a container where the alternative payment methods fields widget should be inserted into.
     * It's necessary to specify this parameter when using Alternative Payment Methods.
     * Without it alternative payment methods will not work.
     */
    apmFieldsContainer?: string;
    /**
     * Object with styles to customize alternative payment methods fields.
     */
    apmFieldsStyles?: PayPalCommerceFieldsStyleOptions;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error | unknown): void;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm(): void;
    /**
     * A callback that gets called
     * when Smart Payment Button is initialized.
     */
    onInitButton(actions: InitCallbackActions): Promise<void>;
}

declare class PayPalCommerceAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private paypalApms?;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    private paypalcommercealternativemethods?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
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
    private handleError;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private onCreateOrder;
    private handleApprove;
    private handleFailure;
    /**
     *
     * Fields methods
     *
     * */
    private renderFields;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Utils
     *
     * */
    private isNonInstantPaymentMethod;
    private getPaypalAmpsSdkOrThrow;
}

/**
 * A set of options that are required to initialize PayPalCommerce in cart or product details page.
 *
 * When PayPalCommerce is initialized, an PayPalCommerce button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface PayPalCommerceButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    /**
     *
     * PayPal AppSwitch enabling handling
     *
     */
    private isPaypalCommerceAppSwitchEnabled;
}

/**
 *
 * PayPal Commerce Buttons
 *
 */
declare interface PayPalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
    hasReturned?(): boolean;
    resume?(): void;
}

declare interface PayPalCommerceButtonsOptions {
    experience?: string;
    style?: PayPalButtonStyleOptions;
    fundingSource: string;
    createOrder(): Promise<string>;
    onApprove(data: ApproveCallbackPayload, actions: ApproveCallbackActions): Promise<boolean | void> | void;
    onInit?(data: InitCallbackPayload, actions: InitCallbackActions): Promise<void>;
    onComplete?(data: CompleteCallbackDataPayload): Promise<void>;
    onClick?(data: ClickCallbackPayload, actions: ClickCallbackActions): Promise<void> | void;
    onError?(error: Error): void;
    onCancel?(): void;
    onShippingAddressChange?(data: ShippingAddressChangeCallbackPayload): Promise<void>;
    onShippingOptionsChange?(data: ShippingOptionChangeCallbackPayload): Promise<void>;
}

declare interface PayPalCommerceCardFields {
    isEligible(): boolean;
    CVVField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    ExpiryField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NameField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    NumberField(config?: PayPalCommerceFieldsInitializationData): PayPalCommerceFields;
    submit(config?: PayPalCommerceCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<PayPalCommerceCardFieldsState>;
}

declare type PayPalCommerceCardFieldsCard = PayPalCommerceHostedFieldsCard;

/**
 *
 * PayPal Commerce SDK
 *
 */
declare interface PayPalCommerceCardFieldsConfig {
    inputEvents: {
        onChange(data: PayPalCommerceCardFieldsState): void;
        onFocus(data: PayPalCommerceCardFieldsState): void;
        onBlur(data: PayPalCommerceCardFieldsState): void;
        onInputSubmitRequest(data: PayPalCommerceCardFieldsState): void;
    };
    createVaultSetupToken?: (data: PayPalCommerceCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: PayPalCommerceHostedFieldsRenderOptions['styles'];
    onApprove(data: PayPalCommerceCardFieldsOnApproveData): void;
    onError(): void;
}

declare interface PayPalCommerceCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

declare interface PayPalCommerceCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
    liabilityShift?: LiabilityShiftEnum;
}

declare interface PayPalCommerceCardFieldsState {
    cards: PayPalCommerceCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: PayPalCommerceCardFieldsFieldData;
        cardNumberField: PayPalCommerceCardFieldsFieldData;
        cardNameField?: PayPalCommerceCardFieldsFieldData;
        cardExpiryField: PayPalCommerceCardFieldsFieldData;
    };
}

declare interface PayPalCommerceCardFieldsSubmitConfig {
    billingAddress: {
        company?: string;
        addressLine1: string;
        addressLine2?: string;
        adminArea1: string;
        adminArea2: string;
        postalCode: string;
        countryCode?: string;
    };
}

declare interface PayPalCommerceCreditButtonInitializeOptions {
    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class PayPalCommerceCreditButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk);
    initialize(options: CheckoutButtonInitializeOptions & WithPayPalCommerceCreditButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private renderMessages;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its credit card form.
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
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number' },
 *                 cardName: { containerId: 'card-name' },
 *                 cardExpiry: { containerId: 'card-expiry' },
 *                 cardCode: { containerId: 'card-code' },
 *             },
 *         },
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the fields and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercecreditcard',
 *     paypalcommercecreditcard: {
 *         form: {
 *             fields: {
 *                 cardNumber: { containerId: 'card-number', placeholder: 'Number of card' },
 *                 cardName: { containerId: 'card-name', placeholder: 'Name of card' },
 *                 cardExpiry: { containerId: 'card-expiry', placeholder: 'Expiry of card' },
 *                 cardCode: { containerId: 'card-code', placeholder: 'Code of card' },
 *             },
 *             styles: {
 *                 default: {
 *                     color: '#000',
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
 *         onCreditCardFieldsRenderingError: (error) => handleError(error),
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

declare class PayPalCommerceCreditCardsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    private executionPaymentData?;
    private isCreditCardForm?;
    private isCreditCardVaultedForm?;
    private cardFields?;
    private cvvField?;
    private expiryField?;
    private numberField?;
    private nameField?;
    private hostedFormOptions?;
    private returnedOrderId?;
    private returnedVaultedToken?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceCreditCardsPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Submit Payment Payload preparing method
     *
     * `vaultedToken` is used when we pay with vaulted instrument (with trusted shipping address and untrusted)
     * `setupToken` is used when we pay with vaulted instrument (untrusted shipping address)
     * `orderId` is used in every case (basic card payment, trusted shipping address and untrusted)
     */
    private preparePaymentPayload;
    /**
     *
     * Card fields initialize
     *
     */
    private initializeFields;
    /**
     *
     * Get execute callback method
     * Depends on shipping address is trusted or not we should pass to PP
     * `createVaultSetupToken` callback if address is untrusted or
     * `createOrder` if address is trusted
     *
     */
    private getExecuteCallback;
    private createVaultSetupTokenCallback;
    private createOrderCallback;
    /**
     *
     * onApprove method
     * When submitting a form with a `submitHostedForm` method if there is no error
     * then onApprove callback is triggered and depends on the flow
     * we will receive an `orderID` if it's basic paying and `vaultSetupToken` if we are paying
     * with vaulted instrument and shipping address is untrusted
     *
     */
    private handleApprove;
    /**
     *
     * Rendering Card Fields methods
     *
     */
    private renderFields;
    private renderVaultedFields;
    /**
     *
     * Instrument params method
     *
     */
    private getInstrumentParams;
    private getFieldTypeByEmittedField;
    /**
     *
     * Form submit method
     * Triggers a form submit
     * */
    private submitHostedForm;
    /**
     *
     * Validation and errors
     *
     */
    private validateHostedFormOrThrow;
    private getValidityData;
    private getInvalidErrorByFieldType;
    private mapValidationErrors;
    /**
     *
     * Fields mappers
     *
     */
    private mapFieldType;
    /**
     *
     * Utils
     *
     */
    private getCardFieldsOrThrow;
    private getInputStyles;
    private stylizeInputContainers;
    private hasUndefinedValues;
    /**
     *
     * Input events methods
     *
     */
    private onChangeHandler;
    private onFocusHandler;
    private onBlurHandler;
    private onInputSubmitRequest;
    /**
     *
     * PayPal Commerce Accelerated checkout related methods
     *
     */
    private shouldInitializePayPalFastlane;
    private initializePayPalFastlaneOrThrow;
}

declare interface PayPalCommerceCreditCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

declare class PayPalCommerceCreditCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceCreditCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercecredit',
 *     paypalcommercecredit: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercecredit', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceCreditPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container?: string;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
}

declare class PayPalCommerceCreditPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private paypalCommerceSdk;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator, paypalCommerceSdk: PayPalCommerceSdk);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommerceCreditPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support PayPalCommerce.
 */
declare interface PayPalCommerceCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete?(): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

declare class PayPalCommerceCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private handleError;
    /**
     *
     * PayPal AppSwitch enabling handling
     *
     */
    private isPaypalCommerceAppSwitchEnabled;
}

/**
 * A set of options that are optional to initialize the PayPalCommerce Fastlane customer strategy
 * that are responsible for PayPalCommerce Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'paypalcommerceacceleratedcheckout', // PayPalCommerce Fastlane has 'paypalcommerceacceleratedcheckout' method id
 *     paypalcommercefastlane: {
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
declare interface PayPalCommerceFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPalCommerce Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

declare class PayPalCommerceFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceFastlaneCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private runPayPalAuthenticationFlowOrThrow;
    private updateCustomerDataState;
    /**
     *
     * Fastlane styling methods
     *
     */
    private getFastlaneStyles;
}

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
declare interface PayPalCommerceFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the PayPal Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalCardComponent: (container: string) => void) => void;
    /**
     * Is a callback that shows PayPal stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;
    /**
     * Callback that handles errors
     */
    onError?: (error: unknown) => void;
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPalCommerceFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

declare interface PayPalCommerceFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

declare interface PayPalCommerceFieldsInitializationData {
    placeholder?: string;
}

declare interface PayPalCommerceFieldsStyleOptions {
    variables?: {
        fontFamily?: string;
        fontSizeBase?: string;
        fontSizeSm?: string;
        fontSizeM?: string;
        fontSizeLg?: string;
        textColor?: string;
        colorTextPlaceholder?: string;
        colorBackground?: string;
        colorInfo?: string;
        colorDanger?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        borderFocusColor?: string;
        spacingUnit?: string;
    };
    rules?: {
        [key: string]: any;
    };
}

declare interface PayPalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

declare interface PayPalCommerceHostedFields {
    submit(options?: PayPalCommerceHostedFieldsSubmitOptions): Promise<PayPalCommerceHostedFieldsApprove>;
    getState(): PayPalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PayPalCommerceHostedFieldsState) => void): void;
}

declare interface PayPalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

declare interface PayPalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

declare interface PayPalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * PayPal Commerce Hosted Fields
 *
 */
declare interface PayPalCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: PayPalCommerceHostedFieldOption;
        cvv?: PayPalCommerceHostedFieldOption;
        expirationDate?: PayPalCommerceHostedFieldOption;
    };
    paymentsSDK?: boolean;
    styles?: {
        input?: {
            [key: string]: string;
        };
        '.invalid'?: {
            [key: string]: string;
        };
        '.valid'?: {
            [key: string]: string;
        };
        ':focus'?: {
            [key: string]: string;
        };
    };
    createOrder(): Promise<string>;
}

declare interface PayPalCommerceHostedFieldsState {
    cards: PayPalCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: PayPalCommerceHostedFieldsFieldData;
        expirationDate?: PayPalCommerceHostedFieldsFieldData;
        expirationMonth?: PayPalCommerceHostedFieldsFieldData;
        expirationYear?: PayPalCommerceHostedFieldsFieldData;
        cvv?: PayPalCommerceHostedFieldsFieldData;
        postalCode?: PayPalCommerceHostedFieldsFieldData;
    };
}

declare interface PayPalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

/**
 *
 * PayPal Commerce Initialization Data
 *
 */
declare interface PayPalCommerceInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: PayPalCommerceIntent;
    isAcceleratedCheckoutEnabled?: boolean;
    isHostedCheckoutEnabled?: boolean;
    isPayPalCreditAvailable?: boolean;
    isVenmoEnabled?: boolean;
    isGooglePayEnabled?: boolean;
    merchantId?: string;
    orderId?: string;
    shouldRenderFields?: boolean;
    shouldRunAcceleratedCheckout?: boolean;
    paymentButtonStyles?: Record<string, PayPalButtonStyleOptions>;
    paypalBNPLConfiguration?: PayPalBNPLConfigurationItem[];
    isAppSwitchEnabled?: boolean;
}

declare class PayPalCommerceIntegrationService {
    private formPoster;
    private paymentIntegrationService;
    private paypalCommerceRequestSender;
    private paypalCommerceScriptLoader;
    private paypalSdk?;
    constructor(formPoster: FormPoster, paymentIntegrationService: PaymentIntegrationService, paypalCommerceRequestSender: PayPalCommerceRequestSender, paypalCommerceScriptLoader: PayPalCommerceScriptLoader);
    /**
     *
     * PayPalSDK methods
     *
     */
    loadPayPalSdk(methodId: string, providedCurrencyCode?: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK | undefined>;
    getPayPalSdkOrThrow(): PayPalSDK;
    /**
     *
     * Buy Now cart creation methods
     *
     */
    createBuyNowCartOrThrow(buyNowInitializeOptions: PayPalBuyNowInitializeOptions): Promise<Cart>;
    /**
     *
     * Order methods
     *
     */
    createOrder(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody>): Promise<string>;
    createOrderCardFields(providerId: string, requestBody?: Partial<PayPalCreateOrderRequestBody>): Promise<PayPalCreateOrderCardFieldsResponse>;
    updateOrder(): Promise<void>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatus>;
    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    tokenizePayment(methodId: string, orderId?: string): void;
    submitPayment(methodId: string, orderId: string, gatewayId?: string): Promise<void>;
    /**
     *
     * Shipping options methods
     *
     */
    getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption;
    /**
     *
     * Address transforming methods
     *
     */
    getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody;
    getBillingAddressFromOrderDetails({ payer }: PayPalOrderDetails): BillingAddressRequestBody;
    getShippingAddressFromOrderDetails(orderDetails: PayPalOrderDetails): BillingAddressRequestBody;
    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions): PayPalButtonStyleOptions;
    getValidHeight(height?: number): number;
    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void;
}

declare enum PayPalCommerceIntent {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

/**
 *
 * PayPalCommerce Messages
 */
declare interface PayPalCommerceMessages {
    render(id: string): void;
}

declare interface PayPalCommerceMessagesOptions {
    amount: number;
    placement: string;
    style?: PayPalCommerceMessagesStyleOptions;
    fundingSource?: string;
}

declare interface PayPalCommerceMessagesStyleOptions {
    layout?: string;
}

/**
 *
 * PayPal Commerce Payment fields
 *
 */
declare interface PayPalCommercePaymentFields {
    render(id: string): void;
}

declare interface PayPalCommercePaymentFieldsOptions {
    style?: PayPalCommerceFieldsStyleOptions;
    fundingSource: string;
    fields: {
        name?: {
            value?: string;
        };
        email?: {
            value?: string;
        };
    };
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommerce',
 *     paypalcommerce: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommerce', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface PayPalCommercePaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container?: string;
    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;
    /**
     * If there is no need to initialize the Smart Payment Button, simply pass false as the option value.
     * The default value is true
     */
    shouldRenderPayPalButtonOnInitialization?: boolean;
    /**
     * A callback for getting form fields values.
     */
    getFieldsValues?(): HostedInstrument;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback that gets called when strategy is in the process of initialization before rendering Smart Payment Button.
     *
     * @param callback - A function, that calls the method to render the Smart Payment Button.
     */
    onInit?(callback: () => void): void;
    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate?(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;
}

declare class PayPalCommercePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private paypalCommerceSdk;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private paypalcommerce?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, paypalCommerceSdk: PayPalCommerceSdk, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommercePaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    private createOrder;
    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues;
    private isTrustedVaultingFlow;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
    /**
     *
     * Guards
     *
     */
    private isPayPalVaultedInstrumentPaymentData;
    /**
     *
     * Render Pay Later Messages
     *
     * */
    private renderMessages;
    /**
     *
     * Error handling
     *
     */
    private isProviderError;
    /**
     *
     * PayPal AppSwitch enabling handling
     *
     */
    private isPaypalCommerceAppSwitchEnabled;
}

declare class PayPalCommerceRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    createOrder(providerId: string, requestBody: Partial<PayPalCreateOrderRequestBody>): Promise<PayPalOrderData>;
    updateOrder(requestBody: PayPalUpdateOrderRequestBody): Promise<PayPalUpdateOrderResponse>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatusData>;
}

declare interface PayPalCommerceSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

declare class PayPalCommerceScriptLoader {
    private scriptLoader;
    private window;
    constructor(scriptLoader: ScriptLoader);
    getPayPalSDK(paymentMethod: PaymentMethod<PayPalCommerceInitializationData>, currencyCode: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK>;
    private loadPayPalSDK;
    private getPayPalSdkScriptConfigOrThrow;
    private transformConfig;
}

declare interface PayPalCommerceVenmoButtonInitializeOptions {
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;
    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;
    /**
     * The options that required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: PayPalBuyNowInitializeOptions;
    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

declare class PayPalCommerceVenmoButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithPayPalCommerceVenmoButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private getValidVenmoButtonStyles;
    private handleClick;
}

declare interface PayPalCommerceVenmoCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when paypal button clicked.
     */
    onClick?(): void;
}

declare class PayPalCommerceVenmoCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService);
    initialize(options: CustomerInitializeOptions & WithPayPalCommerceVenmoCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
}

/**
 * A set of options that are required to initialize the PayPal Commerce payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, PayPal (also known as PayPal Commerce Platform) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the PayPal button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'paypalcommercevenmo',
 *     paypalcommercevenmo: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'paypalcommercevenmo', }
 *               }
 *            );
 *         },
 * // Callback is used to define the state of the payment form, validate if it is applicable for submit.
 *         onValidate: (resolve, reject) => {
 *         // Example function
 *             const isValid = this.validatePaymentForm();
 *             if (isValid) {
 *                 return resolve();
 *             }
 *             return reject();
 *         },
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular PayPal method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface PayPalCommerceVenmoPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: Error): void;
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback that gets called when a buyer click on Smart Payment Button
     * and should validate payment form.
     *
     * @param resolve - A function, that gets called if form is valid.
     * @param reject - A function, that gets called if form is not valid.
     *
     * @returns reject() or resolve()
     */
    onValidate(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm(): void;
}

declare class PayPalCommerceVenmoPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithPayPalCommerceVenmoPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton;
    private handleClick;
    private handleApprove;
    private handleError;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare interface PayPalCreateOrderCardFieldsResponse {
    orderId: string;
    setupToken?: string;
}

declare interface PayPalCreateOrderRequestBody extends HostedInstrument, VaultedInstrument {
    cartId: string;
    metadataId?: string;
    setupToken?: boolean;
    fastlaneToken?: string;
}

declare type PayPalLegal = (params: {
    fundingSource: string;
}) => {
    render(container: string): void;
};

declare interface PayPalOrderAddress {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1?: string;
    postal_code: string;
    country_code: string;
}

declare interface PayPalOrderData {
    orderId: string;
    setupToken?: string;
    approveUrl: string;
    fastlaneToken?: string;
}

declare interface PayPalOrderDetails {
    payer: {
        name: {
            given_name: string;
            surname: string;
        };
        email_address: string;
        address: PayPalOrderAddress;
        phone?: {
            phone_number: {
                national_number: string;
            };
        };
    };
    purchase_units: Array<{
        shipping: {
            address: PayPalOrderAddress;
            name: {
                full_name: string;
            };
        };
    }>;
}

declare enum PayPalOrderStatus {
    Approved = "APPROVED",
    Created = "CREATED",
    PayerActionRequired = "PAYER_ACTION_REQUIRED",
    PollingStop = "POLLING_STOP",
    PollingError = "POLLING_ERROR"
}

declare interface PayPalOrderStatusData {
    status: PayPalOrderStatus;
}

declare interface PayPalSDK {
    CardFields: (data: PayPalCommerceCardFieldsConfig) => Promise<PayPalCommerceCardFields>;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{
            status: string;
        }>;
        initiatePayerAction: () => void;
    };
    FUNDING: PayPalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PayPalCommerceHostedFieldsRenderOptions): Promise<PayPalCommerceHostedFields>;
    };
    Legal: PayPalLegal & LegalFunding;
    Buttons(options: PayPalCommerceButtonsOptions): PayPalCommerceButtons;
    PaymentFields(options: PayPalCommercePaymentFieldsOptions): PayPalCommercePaymentFields;
    Messages(options: PayPalCommerceMessagesOptions): PayPalCommerceMessages;
}

declare interface PayPalSelectedShippingOption {
    amount: {
        currency_code: string;
        value: string;
    };
    id: string;
    label: string;
    selected: boolean;
    type: string;
}

declare interface PayPalUpdateOrderRequestBody {
    availableShippingOptions?: ShippingOption[];
    cartId: string;
    selectedShippingOption?: ShippingOption;
}

declare interface PayPalUpdateOrderResponse {
    statusCode: number;
}

declare class PaypalCommerceFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceRequestSender;
    private paypalCommerceSdk;
    private paypalCommerceFastlaneUtils;
    private paypalComponentMethods?;
    private paypalFastlaneSdk?;
    private threeDSVerificationMethod?;
    private paypalcommercefastlane?;
    private orderId?;
    private methodId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceRequestSender: PayPalCommerceRequestSender, paypalCommerceSdk: PayPalCommerceSdk, paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils);
    /**
     *
     * Default methods
     *
     * */
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceFastlanePaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    /**
     *
     * Authentication flow methods
     *
     */
    private shouldRunAuthenticationFlow;
    private runPayPalAuthenticationFlowOrThrow;
    /**
     *
     * PayPal Fastlane Card Component rendering method
     *
     */
    private initializePayPalPaymentComponent;
    private renderPayPalPaymentComponent;
    private getPayPalComponentMethodsOrThrow;
    /**
     *
     * Payment Payload preparation methods
     *
     */
    private prepareVaultedInstrumentPaymentPayload;
    private preparePaymentPayload;
    private createOrder;
    /**
     *
     * 3DSecure methods
     *
     * */
    private get3DSNonce;
    /**
     *
     * PayPal Fastlane instrument change
     *
     */
    private handlePayPalStoredInstrumentChange;
    /**
     *
     * PayPal Fastlane experiments handling
     *
     */
    private isPaypalCommerceFastlaneThreeDSAvailable;
    private handleError;
}

declare interface PaypalCommerceRatePay {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
    /**
     * The CSS selector of a container where the legal text should be inserted into.
     */
    legalTextContainer: string;
    /**
     * The CSS selector of a container where loading indicator should be rendered
     */
    loadingContainerId: string;
    /**
     * A callback that gets form values
     */
    getFieldsValues?(): {
        ratepayBirthDate: BirthDate;
        ratepayPhoneNumber: string;
        ratepayPhoneCountryCode: string;
    };
    /**
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;
    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

declare class PaypalCommerceRatepayPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private paypalCommerceIntegrationService;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private guid?;
    private paypalcommerceratepay?;
    private loadingIndicatorContainer?;
    private pollingTimer;
    private stopPolling;
    constructor(paymentIntegrationService: PaymentIntegrationService, paypalCommerceIntegrationService: PayPalCommerceIntegrationService, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithPayPalCommerceRatePayPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private normalizeDate;
    private formatDate;
    private renderLegalText;
    private handleError;
    private createFraudNetScript;
    private generateGUID;
    private loadFraudnetConfig;
    private reinitializeStrategy;
    /**
     *
     * Polling mechanism
     *
     *
     * */
    private initializePollingMechanism;
    private deinitializePollingMechanism;
    private resetPollingMechanism;
    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator;
}

declare interface ShippingAddressChangeCallbackPayload {
    orderId: string;
    shippingAddress: PayPalAddress;
}

declare interface ShippingOptionChangeCallbackPayload {
    orderId: string;
    selectedShippingOption: PayPalSelectedShippingOption;
}

declare enum StyleButtonColor {
    gold = "gold",
    blue = "blue",
    silver = "silver",
    black = "black",
    white = "white"
}

declare enum StyleButtonLabel {
    paypal = "paypal",
    checkout = "checkout",
    buynow = "buynow",
    pay = "pay",
    installment = "installment"
}

declare enum StyleButtonShape {
    pill = "pill",
    rect = "rect"
}

declare interface WithPayPalCommerceAlternativeMethodsButtonInitializeOptions {
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsButtonOptions;
}

declare interface WithPayPalCommerceAlternativeMethodsPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceAlternativeMethodsPaymentOptions;
    paypalcommercealternativemethods?: PayPalCommerceAlternativeMethodsPaymentOptions;
}

declare interface WithPayPalCommerceButtonInitializeOptions {
    paypalcommerce?: PayPalCommerceButtonInitializeOptions;
}

declare interface WithPayPalCommerceCreditButtonInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditButtonInitializeOptions;
}

declare interface WithPayPalCommerceCreditCardsPaymentInitializeOptions {
    paypalcommercecreditcards?: PayPalCommerceCreditCardsPaymentInitializeOptions;
    paypalcommerce?: DeprecatedPayPalCommerceCreditCardsPaymentInitializeOptions;
}

declare interface WithPayPalCommerceCreditCustomerInitializeOptions {
    paypalcommercecredit?: PayPalCommerceCreditCustomerInitializeOptions;
}

declare interface WithPayPalCommerceCreditPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceCreditPaymentInitializeOptions;
    paypalcommercecredit?: PayPalCommerceCreditPaymentInitializeOptions;
}

declare interface WithPayPalCommerceCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using PayPalCommerce.
     */
    paypalcommerce?: PayPalCommerceCustomerInitializeOptions;
}

declare interface WithPayPalCommerceFastlaneCustomerInitializeOptions {
    paypalcommercefastlane?: PayPalCommerceFastlaneCustomerInitializeOptions;
}

declare interface WithPayPalCommerceFastlanePaymentInitializeOptions {
    paypalcommercefastlane?: PayPalCommerceFastlanePaymentInitializeOptions;
}

declare interface WithPayPalCommercePaymentInitializeOptions {
    paypalcommerce?: PayPalCommercePaymentInitializeOptions;
}

declare interface WithPayPalCommerceRatePayPaymentInitializeOptions {
    paypalcommerceratepay?: PaypalCommerceRatePay;
}

declare interface WithPayPalCommerceVenmoButtonInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoButtonInitializeOptions;
}

declare interface WithPayPalCommerceVenmoCustomerInitializeOptions {
    paypalcommercevenmo?: PayPalCommerceVenmoCustomerInitializeOptions;
}

declare interface WithPayPalCommerceVenmoPaymentInitializeOptions {
    paypalcommerce?: PayPalCommerceVenmoPaymentInitializeOptions;
    paypalcommercevenmo?: PayPalCommerceVenmoPaymentInitializeOptions;
}

export declare const createPayPalCommerceAlternativeMethodsButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PayPalCommerceAlternativeMethodsButtonStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceAlternativeMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceAlternativeMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createPayPalCommerceButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PayPalCommerceButtonStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PayPalCommerceCreditButtonStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditCardsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceCreditCardsPaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceCreditCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCreditPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceCreditPaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaypalCommerceFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommercePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommercePaymentStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceRatePayPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PaypalCommerceRatepayPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createPayPalCommerceVenmoButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<PayPalCommerceVenmoButtonStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceVenmoCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<PayPalCommerceVenmoCustomerStrategy>, {
    id: string;
}>;

export declare const createPayPalCommerceVenmoPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<PayPalCommerceVenmoPaymentStrategy>, {
    id: string;
}>;
