import { BigCommercePaymentsFastlaneUtils } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { PayPalSdkHelper } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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

declare interface BigCommercePaymentsAlternativeMethodsButtonInitializeOptions {
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

declare class BigCommercePaymentsAlternativeMethodsButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
}

/**
 * A set of options that are required to initialize the BigCommercePayments payment
 * method for presenting its PayPal button.
 *
 *
 * Also, BCP (also known as BigCommercePayments) requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the APM button will be inserted -->
 * <div id="container"></div>
 * <!-- This is where the alternative payment methods fields will be inserted.  -->
 * <div id="apm-fields-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     gatewayId: 'bigcommerce_payments_apms',
 *     methodId: 'sepa',
 *     bigcommerce_payments_apms: {
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
 * // Callback for submitting payment form that gets called when a buyer approves payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_apms', }
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
declare interface BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions {
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
    apmFieldsStyles?: BigCommercePaymentsFieldsStyleOptions;
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

declare class BigCommercePaymentsAlternativeMethodsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private bigCommercePaymentsSdkHelper;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private loadingIndicatorContainer?;
    private orderId?;
    private bigCommercePaymentsButton?;
    private paypalApms?;
    private pollingTimer;
    private stopPolling;
    private isPollingEnabled;
    private bigCommercePaymentsAlternativeMethods?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, bigCommercePaymentsSdkHelper: PayPalSdkHelper, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions): Promise<void>;
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
    private deInitializePollingMechanism;
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
 * A set of options that are required to initialize BigCommercePaymentsButtonStrategy in cart or product details page.
 *
 * When BigCommercePayments is initialized, an BigCommercePayments PayPal button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger PayPal flow.
 */
declare interface BigCommercePaymentsButtonInitializeOptions {
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

declare class BigCommercePaymentsButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithBigCommercePaymentsButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
}

/**
 *
 * BigCommerce Payments Buttons
 *
 */
declare interface BigCommercePaymentsButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

declare interface BigCommercePaymentsButtonsOptions {
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

declare interface BigCommercePaymentsCardFields {
    isEligible(): boolean;
    CVVField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    ExpiryField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NameField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    NumberField(config?: BigCommercePaymentsFieldsInitializationData): BigCommercePaymentsFields;
    submit(config?: BigCommercePaymentsCardFieldsSubmitConfig): Promise<void>;
    getState(): Promise<BigCommercePaymentsCardFieldsState>;
}

declare type BigCommercePaymentsCardFieldsCard = BigCommercePaymentsHostedFieldsCard;

/**
 *
 * BigCommerce Payments SDK
 *
 */
declare interface BigCommercePaymentsCardFieldsConfig {
    inputEvents: {
        onChange(data: BigCommercePaymentsCardFieldsState): void;
        onFocus(data: BigCommercePaymentsCardFieldsState): void;
        onBlur(data: BigCommercePaymentsCardFieldsState): void;
        onInputSubmitRequest(data: BigCommercePaymentsCardFieldsState): void;
    };
    createVaultSetupToken?: (data: BigCommercePaymentsCardFieldsState) => void;
    createOrder?: () => Promise<string>;
    style: BigCommercePaymentsHostedFieldsRenderOptions['styles'];
    onApprove(data: BigCommercePaymentsCardFieldsOnApproveData): void;
    onError(): void;
}

declare interface BigCommercePaymentsCardFieldsFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

declare interface BigCommercePaymentsCardFieldsOnApproveData {
    vaultSetupToken?: string;
    orderID: string;
    liabilityShift?: LiabilityShiftEnum;
}

declare interface BigCommercePaymentsCardFieldsState {
    cards: BigCommercePaymentsCardFieldsCard[];
    emittedBy: string;
    isFormValid: boolean;
    errors: string[];
    fields: {
        cardCvvField: BigCommercePaymentsCardFieldsFieldData;
        cardNumberField: BigCommercePaymentsCardFieldsFieldData;
        cardNameField?: BigCommercePaymentsCardFieldsFieldData;
        cardExpiryField: BigCommercePaymentsCardFieldsFieldData;
    };
}

declare interface BigCommercePaymentsCardFieldsSubmitConfig {
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

/**
 * A set of options that are required to initialize the BigCommercePayments Credit Card payment
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
 *     methodId: 'bigcommerce_payments_creditcards',
 *     bigcommerce_payments_creditcards: {
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
 *     methodId: 'bigcommerce_payments_creditcards',
 *     bigcommerce_payments_creditcards: {
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
declare interface BigCommercePaymentsCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;
    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

declare class BigCommercePaymentsCreditCardsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
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
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsCreditCardsPaymentInitializeOptions): Promise<void>;
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
     *
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
     * BigCommercePayments Accelerated checkout related methods
     *
     */
    private shouldInitializePayPalFastlane;
    private initializePayPalFastlaneOrThrow;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support BigCommercePayments.
 */
declare interface BigCommercePaymentsCustomerInitializeOptions {
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

declare class BigCommercePaymentsCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsCustomerInitializeOptions): Promise<void>;
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
 * A set of options that are optional to initialize the BigCommercePayments Fastlane customer strategy
 * that are responsible for BigCommercePayments Fastlane components styling and initialization
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'bigcommerce_payments_fastlane',
 *     bigcommerce_payments_fastlane: {
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
declare interface BigCommercePaymentsFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

declare class BigCommercePaymentsFastlaneCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsFastlaneCustomerInitializeOptions): Promise<void>;
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
 * A set of options that are required to initialize the BigCommercePayments Fastlane payment
 * method for presenting on the page.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize BigCommercePayments Fastlane Card Component
 * ```html
 * <!-- This is where the BigCommercePayments Fastlane Card Component will be inserted -->
 * <div id="container"></div>
 * ```
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_fastlane',
 *     bigcommerce_payments_fastlane: {
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
declare interface BigCommercePaymentsFastlanePaymentInitializeOptions {
    /**
     * Is a callback that takes the CSS selector of a container
     * where the BigCommercePayments Fastlane form should be inserted into.
     */
    onInit?: (renderPayPalCardComponent: (container: string) => void) => void;
    /**
     * Is a callback that shows fastlane stored instruments
     * when get triggered
     */
    onChange?: (showPayPalCardSelector: () => Promise<CardInstrument | undefined>) => void;
    /**
     * Callback that handles errors
     */
    onError?: (error: unknown) => void;
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePaymentsFastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

declare class BigCommercePaymentsFastlanePaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsRequestSender;
    private bigCommercePaymentsSdk;
    private bigCommercePaymentsFastlaneUtils;
    private paypalComponentMethods?;
    private threeDSVerificationMethod?;
    private paypalFastlaneSdk?;
    private bigcommerce_payments_fastlane?;
    private methodId?;
    private orderId?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender, bigCommercePaymentsSdk: PayPalSdkHelper, bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils);
    /**
     *
     * Default methods
     *
     * */
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsFastlanePaymentInitializeOptions): Promise<void>;
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
     * BigCommercePayments Fastlane Card Component rendering method
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
     * BigCommercePayments Fastlane instrument change
     *
     */
    private handlePayPalStoredInstrumentChange;
    /**
     *
     * Bigcommerce Payments Fastlane experiments handling
     *
     */
    private isBigcommercePaymentsFastlaneThreeDSAvailable;
    private handleError;
}

declare interface BigCommercePaymentsFields {
    render(container: HTMLElement | string): Promise<void>;
    clear(): void;
    removeClass(className: string): Promise<void>;
    close(): Promise<void>;
}

declare interface BigCommercePaymentsFieldsInitializationData {
    placeholder?: string;
}

declare interface BigCommercePaymentsFieldsStyleOptions {
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

declare interface BigCommercePaymentsHostedFieldOption {
    selector: string;
    placeholder?: string;
}

declare interface BigCommercePaymentsHostedFields {
    submit(options?: BigCommercePaymentsHostedFieldsSubmitOptions): Promise<BigCommercePaymentsHostedFieldsApprove>;
    getState(): BigCommercePaymentsHostedFieldsState;
    on(eventName: string, callback: (event: BigCommercePaymentsHostedFieldsState) => void): void;
}

declare interface BigCommercePaymentsHostedFieldsApprove {
    orderId: string;
    liabilityShift?: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

declare interface BigCommercePaymentsHostedFieldsCard {
    type: string;
    niceType: string;
    code: {
        name: string;
        size: number;
    };
}

declare interface BigCommercePaymentsHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

/**
 *
 * BigCommerce Payments Hosted Fields
 *
 */
declare interface BigCommercePaymentsHostedFieldsRenderOptions {
    fields?: {
        number?: BigCommercePaymentsHostedFieldOption;
        cvv?: BigCommercePaymentsHostedFieldOption;
        expirationDate?: BigCommercePaymentsHostedFieldOption;
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

declare interface BigCommercePaymentsHostedFieldsState {
    cards: BigCommercePaymentsHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BigCommercePaymentsHostedFieldsFieldData;
        expirationDate?: BigCommercePaymentsHostedFieldsFieldData;
        expirationMonth?: BigCommercePaymentsHostedFieldsFieldData;
        expirationYear?: BigCommercePaymentsHostedFieldsFieldData;
        cvv?: BigCommercePaymentsHostedFieldsFieldData;
        postalCode?: BigCommercePaymentsHostedFieldsFieldData;
    };
}

declare interface BigCommercePaymentsHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
    cardholderName?: string;
}

/**
 *
 * BigCommerce Payments Initialization Data
 *
 */
declare interface BigCommercePaymentsInitializationData {
    attributionId?: string;
    availableAlternativePaymentMethods: FundingType;
    buttonStyle?: PayPalButtonStyleOptions;
    buyerCountry?: string;
    clientId: string;
    clientToken?: string;
    enabledAlternativePaymentMethods: FundingType;
    isDeveloperModeApplicable?: boolean;
    intent?: BigCommercePaymentsIntent;
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
}

declare class BigCommercePaymentsIntegrationService {
    private formPoster;
    private paymentIntegrationService;
    private bigCommercePaymentsRequestSender;
    private bigCommercePaymentsScriptLoader;
    private paypalSdk?;
    constructor(formPoster: FormPoster, paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender, bigCommercePaymentsScriptLoader: BigCommercePaymentsScriptLoader);
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

declare enum BigCommercePaymentsIntent {
    AUTHORIZE = "authorize",
    CAPTURE = "capture"
}

/**
 *
 * BigCommercePayments Messages
 */
declare interface BigCommercePaymentsMessages {
    render(id: string): void;
}

declare interface BigCommercePaymentsMessagesOptions {
    amount: number;
    placement: string;
    style?: BigCommercePaymentsMessagesStyleOptions;
    fundingSource?: string;
}

declare interface BigCommercePaymentsMessagesStyleOptions {
    layout?: string;
}

declare interface BigCommercePaymentsPayLaterButtonInitializeOptions {
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

declare class BigCommercePaymentsPayLaterButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private payPalSdkHelper;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, payPalSdkHelper: PayPalSdkHelper);
    initialize(options: CheckoutButtonInitializeOptions & WithBigCommercePaymentsPayLaterButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private handleClick;
    private onHostedCheckoutApprove;
    private onShippingAddressChange;
    private onShippingOptionsChange;
    private renderMessages;
}

declare interface BigCommercePaymentsPayLaterCustomerInitializeOptions {
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

declare class BigCommercePaymentsPayLaterCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private onError;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsPayLaterCustomerInitializeOptions): Promise<void>;
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
 * A set of options that are required to initialize the BigCommercePayments PayLater payment
 * method for presenting its BigCommercePayments PayLater button.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize the BigCommercePayments Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the BigCommercePayments PayLater button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_paylater',
 *     bigcommerce_payments_paylater: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves BigCommercePayments payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_paylater', }
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
 * // Callback that is called right before render of a Smart Payment Button. It gets called when a buyer is eligible for use of the particular BigCommercePayments method. This callback can be used to hide the standard submit button.
 *         onRenderButton: () => {
 *         // Example function
 *             this.hidePaymentSubmitButton();
 *         }
 *     },
 * });
 * ```
 */
declare interface BigCommercePaymentsPayLaterPaymentInitializeOptions {
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
     * when buyer approved BigCommercePayments account.
     */
    submitForm?(): void;
}

declare class BigCommercePaymentsPayLaterPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private paypalSdkHelper;
    private loadingIndicatorContainer?;
    private orderId?;
    private bigCommercePaymentsButtons?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator, paypalSdkHelper: PayPalSdkHelper);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsPayLaterPaymentInitializeOptions): Promise<void>;
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
 *
 * BigCommerce Payments Payment fields
 *
 */
declare interface BigCommercePaymentsPaymentFields {
    render(id: string): void;
}

declare interface BigCommercePaymentsPaymentFieldsOptions {
    style?: BigCommercePaymentsFieldsStyleOptions;
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
 * A set of options that are required to initialize the BigCommercePayments payment
 * method for presenting its PayPal button.
 *
 * Please note that the minimum version of checkout-sdk is 1.100
 *
 * Also, BigCommercePayments requires specific options to initialize the PayPal Smart Payment Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the BigCommercePayments PayPal button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments',
 *     bigcommerce_payments: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves PayPal payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments', }
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
declare interface BigCommercePaymentsPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    container: string;
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
    onValidate(resolve: () => void, reject: () => void): Promise<void>;
    /**
     * A callback for submitting payment form that gets called
     * when buyer approves PayPal payment.
     */
    submitForm(): void;
}

declare class BigCommercePaymentsPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    private bigcommerce_payments?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsPaymentInitializeOptions): Promise<void>;
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
    private isProviderError;
}

declare interface BigCommercePaymentsRatePayPaymentInitializeOptions {
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

declare class BigCommercePaymentsRatePayPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private pollingInterval;
    private maxPollingIntervalTime;
    private guid?;
    private bigcommerce_payments_ratepay?;
    private loadingIndicatorContainer?;
    private pollingTimer;
    private stopPolling;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator, pollingInterval?: number, maxPollingIntervalTime?: number);
    initialize(options: PaymentInitializeOptions & WithBigCommercePaymentsRatePayPaymentInitializeOptions): Promise<void>;
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

declare class BigCommercePaymentsRequestSender {
    private requestSender;
    constructor(requestSender: RequestSender);
    createOrder(providerId: string, requestBody: Partial<PayPalCreateOrderRequestBody>): Promise<PayPalOrderData>;
    updateOrder(requestBody: PayPalUpdateOrderRequestBody): Promise<PayPalUpdateOrderResponse>;
    getOrderStatus(methodId?: string, options?: RequestOptions): Promise<PayPalOrderStatusData>;
}

declare interface BigCommercePaymentsSDKFunding {
    CARD: string;
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    OXXO: string;
    SEPA: string;
    VENMO: string;
}

declare class BigCommercePaymentsScriptLoader {
    private scriptLoader;
    private window;
    constructor(scriptLoader: ScriptLoader);
    getPayPalSDK(paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>, currencyCode: string, initializesOnCheckoutPage?: boolean, forceLoad?: boolean): Promise<PayPalSDK>;
    private loadPayPalSDK;
    private getPayPalSdkScriptConfigOrThrow;
    private transformConfig;
}

declare interface BigCommercePaymentsVenmoButtonInitializeOptions {
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

declare class BigCommercePaymentsVenmoButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CheckoutButtonInitializeOptions & WithBigCommercePaymentsVenmoButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private renderButton;
    private getValidVenmoButtonStyles;
    private handleClick;
}

declare interface BigCommercePaymentsVenmoCustomerInitializeOptions {
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
     * A callback that gets called when Venmo button clicked.
     */
    onClick?(): void;
}

declare class BigCommercePaymentsVenmoCustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService);
    initialize(options: CustomerInitializeOptions & WithBigCommercePaymentsVenmoCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private renderButton;
}

/**
 * A set of options that are required to initialize the BigCommercePayments Venmo payment
 * method for presenting its Venmo button.
 *
 *
 * Also, BigCommercePayments requires specific options to initialize the Venmo Button on checkout page that substitutes a standard submit button
 * ```html
 * <!-- This is where the Venmo button will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'bigcommerce_payments_venmo',
 *     bigcommerce_payments_venmo: {
 *         container: '#container',
 * // Callback for submitting payment form that gets called when a buyer approves payment
 *         submitForm: () => {
 *         // Example function
 *             this.submitOrder(
 *                {
 *                   payment: { methodId: 'bigcommerce_payments_venmo', }
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
declare interface BigCommercePaymentsVenmoPaymentInitializeOptions {
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

declare class BigCommercePaymentsVenmoPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private bigCommercePaymentsIntegrationService;
    private loadingIndicator;
    private loadingIndicatorContainer?;
    private orderId?;
    private paypalButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService, loadingIndicator: LoadingIndicator);
    initialize(options?: PaymentInitializeOptions & WithBigCommercePaymentsVenmoPaymentInitializeOptions): Promise<void>;
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

/**
 *
 * BigCommerce Payments Funding sources
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

declare interface PayPalButtonStyleOptions {
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: number;
    label?: StyleButtonLabel;
}

/**
 *
 * BigCommerce Payments BuyNow
 *
 */
declare interface PayPalBuyNowInitializeOptions {
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
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
    CardFields: (data: BigCommercePaymentsCardFieldsConfig) => Promise<BigCommercePaymentsCardFields>;
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
    FUNDING: BigCommercePaymentsSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: BigCommercePaymentsHostedFieldsRenderOptions): Promise<BigCommercePaymentsHostedFields>;
    };
    Legal: PayPalLegal & LegalFunding;
    Buttons(options: BigCommercePaymentsButtonsOptions): BigCommercePaymentsButtons;
    PaymentFields(options: BigCommercePaymentsPaymentFieldsOptions): BigCommercePaymentsPaymentFields;
    Messages(options: BigCommercePaymentsMessagesOptions): BigCommercePaymentsMessages;
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

declare interface WithBigCommercePaymentsAlternativeMethodsButtonInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsAlternativeMethodsButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsAlternativeMethodsPaymentInitializeOptions {
    bigcommerce_payments_apms?: BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsButtonInitializeOptions {
    bigcommerce_payments?: BigCommercePaymentsButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsCreditCardsPaymentInitializeOptions {
    bigcommerce_payments_creditcards?: BigCommercePaymentsCreditCardsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using BigCommercePayments.
     */
    bigcommerce_payments?: BigCommercePaymentsCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlaneCustomerInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlaneCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsFastlanePaymentInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommercePaymentsFastlanePaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterButtonInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterCustomerInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsPayLaterPaymentInitializeOptions {
    bigcommerce_payments_paylater?: BigCommercePaymentsPayLaterPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsPaymentInitializeOptions {
    bigcommerce_payments?: BigCommercePaymentsPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsRatePayPaymentInitializeOptions {
    bigcommerce_payments_ratepay?: BigCommercePaymentsRatePayPaymentInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoButtonInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoButtonInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoCustomerInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoCustomerInitializeOptions;
}

declare interface WithBigCommercePaymentsVenmoPaymentInitializeOptions {
    bigcommerce_payments_venmo?: BigCommercePaymentsVenmoPaymentInitializeOptions;
}

export declare const createBigCommercePaymentsAlternativeMethodsButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BigCommercePaymentsAlternativeMethodsButtonStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsAlternativeMethodsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsAlternativeMethodsPaymentStrategy>, {
    gateway: string;
}>;

export declare const createBigCommercePaymentsButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BigCommercePaymentsButtonStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsCreditCardsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsCreditCardsPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsFastlaneCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsFastlaneCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsFastlanePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsFastlanePaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPayLaterButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BigCommercePaymentsPayLaterButtonStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPayLaterCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsPayLaterCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPayLaterPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsPayLaterPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsPaymentStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsRatePayPayPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsRatePayPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createBigCommercePaymentsVenmoButtonStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<BigCommercePaymentsVenmoButtonStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsVenmoCustomerStrategy: import("../../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<BigCommercePaymentsVenmoCustomerStrategy>, {
    id: string;
}>;

export declare const createBigCommercePaymentsVenmoPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<BigCommercePaymentsVenmoPaymentStrategy>, {
    id: string;
}>;
