import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare interface WithWorldpayAccessPaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    worldpay?: WorldpayAccessPaymentInitializeOptions;
}

declare class WorldpayAccessOpenBankingPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute({ payment }: OrderRequestBody): Promise<void>;
    initialize(): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _buildOpenBankingSubmitPayment;
    private _isWorldpayAccessRedirectResponse;
}

declare interface WorldpayAccessPaymentInitializeOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param iframe - The iframe element containing the payment web page
     * provided by the strategy.
     * @param cancel - A function, when called, will cancel the payment
     * process and remove the iframe.
     */
    onLoad(iframe: HTMLIFrameElement, cancel: () => void): void;
}

declare class WorldpayAccessPaymentStrategy extends CreditCardPaymentStrategy {
    private _initializeOptions?;
    initialize(options?: PaymentInitializeOptions & WithWorldpayAccessPaymentInitializeOptions): Promise<void>;
    execute(orderRequest: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void>;
    private _processAdditionalAction;
    private _createHiddenIframe;
    private _createIframe;
    private _submitAdditionalAction;
    private _isValidJsonWithSessionId;
}

export declare const createWorldpayAccessOpenBankingPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<WorldpayAccessOpenBankingPaymentStrategy>, {
    id: string;
    gateway: string;
}>;

export declare const createWorldpayAccessPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<WorldpayAccessPaymentStrategy>, {
    gateway: string;
    id: string;
} | {
    id: string;
    gateway?: undefined;
}>;
