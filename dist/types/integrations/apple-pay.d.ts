/// <reference types="applepayjs" />
import { BraintreeSdk } from '@bigcommerce/checkout-sdk/braintree-utils';
import { BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
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
import { RequestSender } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
declare interface ApplePayButtonInitializeOptions {
    /**
     * This option indicates if product requires shipping
     */
    requiresShipping?: boolean;
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
}

declare class ApplePayButtonStrategy implements CheckoutButtonStrategy {
    private _requestSender;
    private _paymentIntegrationService;
    private _sessionFactory;
    private _braintreeSdk;
    private _applePayScriptLoader;
    private _paymentMethod?;
    private _applePayButton?;
    private _requiresShipping?;
    private _buyNowInitializeOptions?;
    private _onAuthorizeCallback;
    private _subTotalLabel;
    private _shippingLabel;
    constructor(_requestSender: RequestSender, _paymentIntegrationService: PaymentIntegrationService, _sessionFactory: ApplePaySessionFactory, _braintreeSdk: BraintreeSdk, _applePayScriptLoader: ApplePayScriptLoader);
    initialize(options: CheckoutButtonInitializeOptions & WithApplePayButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private _createButton;
    private _createApplePayButtonElement;
    private _handleWalletButtonClick;
    private _getRequestWithEmptyTotal;
    private _getBaseRequest;
    private _handleApplePayEvents;
    private _createBuyNowCart;
    private _handlePaymentMethodSelected;
    private _handleShippingContactSelected;
    private _handleShippingMethodSelected;
    private _getUpdatedLineItems;
    private _updateShippingOption;
    private _onValidateMerchant;
    private _onPaymentAuthorized;
    private _transformContactToAddress;
    private _getBraintreeDeviceData;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support ApplePay.
 *
 * When ApplePay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, it will trigger apple sheet
 */
declare interface ApplePayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;
    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;
    /**
     * A callback that gets called when a payment is successfully completed.
     */
    onPaymentAuthorize(): void;
    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error?: Error): void;
    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

declare class ApplePayCustomerStrategy implements CustomerStrategy {
    private _requestSender;
    private _paymentIntegrationService;
    private _sessionFactory;
    private _braintreeSdk;
    private _applePayScriptLoader;
    private _paymentMethod?;
    private _applePayButton?;
    private _onAuthorizeCallback;
    private _onError;
    private _onClick;
    private _subTotalLabel;
    private _shippingLabel;
    private _hasApplePaySession;
    constructor(_requestSender: RequestSender, _paymentIntegrationService: PaymentIntegrationService, _sessionFactory: ApplePaySessionFactory, _braintreeSdk: BraintreeSdk, _applePayScriptLoader: ApplePayScriptLoader);
    initialize(options: CustomerInitializeOptions & WithApplePayCustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
    private _createButton;
    private _createApplePayButtonElement;
    private _handleWalletButtonClick;
    private _getBaseRequest;
    private _handleApplePayEvents;
    private _handleShippingContactSelected;
    private _handleShippingMethodSelected;
    private _getUpdatedLineItems;
    private _updateShippingOption;
    private _onValidateMerchant;
    private _onPaymentAuthorized;
    private _transformContactToAddress;
    private _getBraintreeDeviceData;
}

/**
 * A set of options that are required to initialize the Applepay payment method with:
 *
 * 1) ApplePay:
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'applepay',
 *     applepay: {
 *         shippingLabel: 'Shipping',
 *         subtotalLabel: 'Sub total',
 *     }
 * });
 * ```
 */
declare interface ApplePayPaymentInitializeOptions {
    /**
     * Shipping label to be passed to apple sheet.
     */
    shippingLabel?: string;
    /**
     * Store credit label to be passed to apple sheet.
     */
    storeCreditLabel?: string;
    /**
     * Sub total label to be passed to apple sheet.
     */
    subtotalLabel?: string;
}

declare class ApplePayPaymentStrategy implements PaymentStrategy {
    private _requestSender;
    private _paymentIntegrationService;
    private _sessionFactory;
    private _braintreeSdk;
    private _applePayScriptLoader;
    private _shippingLabel;
    private _subTotalLabel;
    private _storeCreditLabel;
    constructor(_requestSender: RequestSender, _paymentIntegrationService: PaymentIntegrationService, _sessionFactory: ApplePaySessionFactory, _braintreeSdk: BraintreeSdk, _applePayScriptLoader: ApplePayScriptLoader);
    initialize(options?: PaymentInitializeOptions & WithApplePayPaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _getBaseRequest;
    private _handleApplePayEvents;
    private _onValidateMerchant;
    private _onPaymentAuthorized;
    private _getBraintreeDeviceData;
}

declare class ApplePayScriptLoader {
    private scriptLoader;
    private sdkVersion;
    constructor(scriptLoader: ScriptLoader);
    loadSdk(): Promise<void>;
}

declare class ApplePaySessionFactory {
    create(request: ApplePayJS.ApplePayPaymentRequest): ApplePaySession;
}

declare interface WithApplePayButtonInitializeOptions {
    applepay?: ApplePayButtonInitializeOptions;
}

declare interface WithApplePayCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using ApplePay.
     */
    applepay?: ApplePayCustomerInitializeOptions;
}

declare interface WithApplePayPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    applepay?: ApplePayPaymentInitializeOptions;
}

export declare const createApplePayButtonStrategy: import("../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<ApplePayButtonStrategy>, {
    id: string;
}>;

export declare const createApplePayCustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<ApplePayCustomerStrategy>, {
    id: string;
}>;

export declare const createApplePayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ApplePayPaymentStrategy>, {
    id: string;
}>;
