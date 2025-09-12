import { AmazonPayV2ButtonConfig } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { AmazonPayV2ButtonParameters } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { AmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
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
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';

/**
 * The required config to render the AmazonPayV2 button.
 */
declare type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParameters | WithBuyNowFeature;

declare class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private paymentIntegrationService;
    private amazonPayV2PaymentProcessor;
    private amazonPayV2ConfigRequestSender;
    private _buyNowInitializeOptions;
    constructor(paymentIntegrationService: PaymentIntegrationService, amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor, amazonPayV2ConfigRequestSender: AmazonPayV2RequestSender);
    initialize(options: CheckoutButtonInitializeOptions & WithAmazonPayV2ButtonInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private _createBuyNowCartOrThrow;
    private _createCheckoutConfig;
    private _getCheckoutCreationRequestConfig;
}

/**
 * A set of options that are required to initialize the customer step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 *
 * ```html
 * <!-- This is where the Amazon Pay button will be inserted -->
 * <div id="signInButton"></div>
 * ```
 *
 * ```js
 * service.initializeCustomer({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         container: 'signInButton',
 *     },
 * });
 * ```
 */
declare interface AmazonPayV2CustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;
}

declare class AmazonPayV2CustomerStrategy implements CustomerStrategy {
    private paymentIntegrationService;
    private amazonPayV2PaymentProcessor;
    constructor(paymentIntegrationService: PaymentIntegrationService, amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor);
    initialize(options: CustomerInitializeOptions & WithAmazonPayV2CustomerInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    signIn(): Promise<void>;
    signOut(options?: RequestOptions): Promise<void>;
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void>;
}

/**
 * A set of options that are required to initialize the payment step of
 * checkout in order to support AmazonPayV2.
 *
 * When AmazonPayV2 is initialized, a change payment button will be bound.
 * When the customer clicks on it, they will be redirected to Amazon to
 * select a different payment method.
 *
 * ```html
 * <!-- This is the change payment button that will be bound -->
 * <button id="edit-button">Change card</button>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'amazonpay',
 *     amazonpay: {
 *         editButtonId: 'edit-button',
 *     },
 * });
 * ```
 */
declare interface AmazonPayV2PaymentInitializeOptions {
    /**
     * This editButtonId is used to set an event listener, provide an element ID
     * if you want users to be able to select a different payment method by
     * clicking on a button. It should be an HTML element.
     */
    editButtonId?: string;
}

declare class AmazonPayV2PaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private amazonPayV2PaymentProcessor;
    private _amazonPayButton?;
    constructor(paymentIntegrationService: PaymentIntegrationService, amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor);
    initialize(options: PaymentInitializeOptions & WithAmazonPayV2PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _bindEditButton;
    private _isModalFlow;
    private _showLoadingSpinner;
    private _createContainer;
    private _getAmazonPayButton;
    private _isOneTimeTransaction;
    private _isReadyToPay;
}

declare class AmazonPayV2RequestSender {
    private _requestSender;
    constructor(_requestSender: RequestSender);
    createCheckoutConfig(cartId: string): Promise<Response<CheckoutConfig>>;
}

declare interface CheckoutConfig {
    payload: string;
    signature: string;
    public_key: string;
}

declare interface WithAmazonPayV2ButtonInitializeOptions {
    amazonpay?: AmazonPayV2ButtonInitializeOptions;
}

declare interface WithAmazonPayV2CustomerInitializeOptions {
    amazonpay?: AmazonPayV2CustomerInitializeOptions;
}

declare interface WithAmazonPayV2PaymentInitializeOptions {
    amazonpay?: AmazonPayV2PaymentInitializeOptions;
}

declare interface WithBuyNowFeature extends AmazonPayV2ButtonConfig {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

export declare const createAmazonPayV2ButtonStrategy: import("../../payment-integration-api/src/resolvable-module").default<CheckoutButtonStrategyFactory<AmazonPayV2ButtonStrategy>, {
    id: string;
}>;

export declare const createAmazonPayV2CustomerStrategy: import("../../payment-integration-api/src/resolvable-module").default<CustomerStrategyFactory<AmazonPayV2CustomerStrategy>, {
    id: string;
}>;

export declare const createAmazonPayV2PaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AmazonPayV2PaymentStrategy>, {
    id: string;
}>;
