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
    PaymentStrategy
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeIntegrationService from '../braintree-integration-service';
import {
    BraintreeLocalMethods,
    LocalPaymentInstance,
    LocalPaymentsPayload,
    onPaymentStartData,
    StartPaymentError,
    WithBraintreeLocalMethodsPaymentInitializeOptions
} from './braintree-local-methods-options';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private localPaymentInstance?: LocalPaymentInstance;
    private braintreeLocalMethods?: BraintreeLocalMethods;
    private nonce?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}


    async initialize(
        options: PaymentInitializeOptions & WithBraintreeLocalMethodsPaymentInitializeOptions
    ): Promise<void> {
        const {
            gatewayId,
            methodId,
            braintreelocalmethods,
        } = options;
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

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(gatewayId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            await this.braintreeIntegrationService.initialize(paymentMethod.clientToken);
            await this.braintreeIntegrationService.loadBraintreeLocalMethods(this.getLocalPaymentInstance.bind(this), 'EUR_local');
        } catch (error) {
            throw new Error(error);
        }

        this.renderButton(methodId);
    }

    private getLocalPaymentInstance(localPaymentInstance: LocalPaymentInstance) {
        if (!this.localPaymentInstance) {
            this.localPaymentInstance = localPaymentInstance;
        }
    }

    private renderButton(methodId: string) {
        if (this.braintreeLocalMethods) {
            const { buttonText, container, classNames, onRenderButton } = this.braintreeLocalMethods;
            const buttonContainerId = container.split('#')[1];
            const buttonContainer = document.getElementById(buttonContainerId);
            const lpmButton = document.createElement('button');
            lpmButton.setAttribute('class', classNames);
            lpmButton.setAttribute('id', methodId);
            lpmButton.innerText = buttonText;
            lpmButton.addEventListener('click', (e) => this.handleClick(e, methodId))

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            if (buttonContainer) {
                buttonContainer.innerHTML = '';
                buttonContainer.append(lpmButton);
            }
        }
    }

    private handleClick(e: Event, methodId: string) {
        e.preventDefault();
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const consignments = state.getConsignmentsOrThrow();
        const { shippingAddress: { firstName, lastName, countryCode} } = consignments[0];
        const { baseAmount, currency, email } = cart;
        const isShippingRequired = cart.lineItems.physicalItems.length > 0;
        const { submitForm } = this.braintreeLocalMethods || {};

        this.localPaymentInstance?.startPayment({
            paymentType: methodId,
            amount: baseAmount,
            fallback: { // see Fallback section for details on these params
                url: 'https://your-domain.com/page-to-complete-checkout',
                buttonText: 'Complete Payment'
            },
            currencyCode: currency.code,
            shippingAddressRequired: isShippingRequired,
            email: email,
            givenName: firstName,
            surname: lastName,
            address: {
                countryCode: countryCode,
            },
            onPaymentStart: (data: onPaymentStartData, start: () => void) => {
                // Call start to initiate the popup
                this.orderId = data.paymentId;
                start();
            }
        }, async (startPaymentError: StartPaymentError, payload: LocalPaymentsPayload) => {
            if (startPaymentError) {
                this.handleError(startPaymentError);
            } else {
                this.nonce = payload.nonce;
                console.log('%c NONCE', 'color: magenta', payload.nonce);
                if (submitForm && typeof submitForm === 'function') {
                    submitForm();
                }
            }
        });
    }

    private handleError(error: any) {
        const { onError } = this.braintreeLocalMethods || {};
        if(onError && typeof onError === 'function') {
            onError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.orderId = undefined;

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const {payment, ...order} = payload;
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
                braintree_local_method_account: {
                    email: cart.email,
                    token: this.nonce,
                },
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                local_method_id: payment?.methodId,
            },
        };

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData,
            });
        } catch (error) {
            this.handleError(error);
        }

    }
}
