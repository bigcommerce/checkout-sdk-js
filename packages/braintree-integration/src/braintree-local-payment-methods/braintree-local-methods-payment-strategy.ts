import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeIntegrationService from '../braintree-integration-service';
import {
    BraintreeLocalMethods,
    LocalPaymentInstance,
    LocalPaymentsPayload,
    onPaymentStartData,
    StartPaymentError,
    WithBraintreeLocalMethodsPaymentInitializeOptions,
} from './braintree-local-methods-options';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private localPaymentInstance?: LocalPaymentInstance;
    private braintreeLocalMethods?: BraintreeLocalMethods;
    private nonce?: string;
    private loadingIndicatorContainer?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions,
    ): Promise<void> {
        const { gatewayId, methodId, braintreelocalmethods } = options;
        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.gatewayId" argument is not provided.',
            );
        }

        if (!braintreelocalmethods) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreelocalmethods" argument is not provided.`,
            );
        }

        this.braintreeLocalMethods = braintreelocalmethods;

        this.loadingIndicatorContainer = braintreelocalmethods.container.split('#')[1];

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(gatewayId);
        const { merchantId } = paymentMethod.config;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(paymentMethod.clientToken);
            await this.braintreeIntegrationService.loadBraintreeLocalMethods(
                this.getLocalPaymentInstance.bind(this),
                merchantId || '',
            );
        } catch (error: unknown) {
            this.handleError(error);
        }

        this.renderButton(methodId);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.orderId = undefined;
        this.toggleLoadingIndicator(false);

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const sessionId = await this.braintreeIntegrationService.getSessionId();

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this.orderId) {
            throw PaymentMethodInvalidError;
        }

        const paymentData = {
            formattedPayload: {
                device_info: sessionId || null,
                [`${payment.methodId}_account`]: {
                    email: cart.email,
                    token: this.nonce,
                    order_id: this.orderId
                },
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
            },
        };

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData,
            });
        } catch (error: unknown) {
            this.handleError(error);
        }
    }

    private getLocalPaymentInstance(localPaymentInstance: LocalPaymentInstance) {
        if (!this.localPaymentInstance) {
            this.localPaymentInstance = localPaymentInstance;
        }
    }

    private renderButton(methodId: string) {
        if (this.braintreeLocalMethods) {
            let buttonContainer;
            const { buttonText, container, onRenderButton } = this.braintreeLocalMethods;
            const buttonContainerId = container.split('#')[1];
            const lpmButton = document.createElement('button');
            buttonContainer = document.getElementById(buttonContainerId);
            const className = buttonContainer?.getAttribute('class');
            lpmButton.setAttribute('class', className || '');
            lpmButton.setAttribute('id', methodId);
            lpmButton.innerText = buttonText;
            lpmButton.addEventListener('click', (e) => this.handleClick(e, methodId));

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            buttonContainer = document.getElementById(buttonContainerId);

            if (buttonContainer) {
                buttonContainer.append(lpmButton);
            }
        }
    }

    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }

    private handleClick(e: Event, methodId: string) {
        e.preventDefault();
        this.toggleLoadingIndicator(true);
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const billing = state.getBillingAddressOrThrow();
        const { firstName, lastName, countryCode } = billing;
        const { baseAmount, currency, email } = cart;
        const isShippingRequired = cart.lineItems.physicalItems.length > 0;
        const { submitForm } = this.braintreeLocalMethods || {};

        this.localPaymentInstance?.startPayment(
            {
                paymentType: methodId,
                amount: baseAmount,
                fallback: {
                    // see Fallback section for details on these params // TODO
                    url: 'https://your-domain.com/page-to-complete-checkout',
                    buttonText: 'Complete Payment',
                },
                currencyCode: currency.code,
                shippingAddressRequired: isShippingRequired,
                email,
                givenName: firstName,
                surname: lastName,
                address: {
                    countryCode,
                },
                onPaymentStart: (data: onPaymentStartData, start: () => void) => {
                    // Call start to initiate the popup
                    this.orderId = data.paymentId;
                    start();
                },
            },
            (startPaymentError: StartPaymentError, payload: LocalPaymentsPayload) => {
                if (startPaymentError && startPaymentError.code !== 'LOCAL_PAYMENT_WINDOW_CLOSED') {
                    this.handleError(startPaymentError.code);
                } else {
                    this.nonce = payload.nonce;

                    if (submitForm && typeof submitForm === 'function') {
                        submitForm();
                    }
                }
            },
        );
    }

    private handleError(error: unknown) {
        const { onError } = this.braintreeLocalMethods || {};
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }
}
