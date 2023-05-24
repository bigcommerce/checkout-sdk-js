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
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import {
    BraintreeLocalMethods,
    LocalPaymentInstance,
    LocalPaymentsPayload,
    onPaymentStartData, StartPaymentError,
    WithBraintreeLocalMethodsPaymentInitializeOptions
} from './braintree-local-methods-options';

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private localPaymentInstance?: LocalPaymentInstance;
    private loadingIndicatorContainer?: string;
    private braintreeLocalMethods?: BraintreeLocalMethods;
    private nonce?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private loadingIndicator: LoadingIndicator,
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
            await this.braintreeIntegrationService.loadBraintreeLocalMethods(this.getLocalPaymentInstance.bind(this));
        } catch (error) {
            throw new Error(error);
        }

        this.loadingIndicatorContainer = braintreelocalmethods.container.split('#')[1];
        await this.renderButton(methodId);
    }

    private getLocalPaymentInstance(localPaymentInstance: LocalPaymentInstance) {
        if (!this.localPaymentInstance) {
            this.localPaymentInstance = localPaymentInstance;
        }
    }

    private renderButton(methodId: string) {
        const { container, onRenderButton } = this.braintreeLocalMethods || {};
        const buttonContainerId = container?.split('#')[1];
        const localMethodButton = this.createButtonElement(methodId);
        const buttonContainerElement = document.getElementById(buttonContainerId || '');

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        if (buttonContainerElement) {
            buttonContainerElement.innerHTML = '';
        }

        buttonContainerElement?.append(localMethodButton);
    }

    private createButtonElement(methodId: string) {
        const localMethodButtonElement = document.createElement('button');
        localMethodButtonElement.innerText = `CONTINUE WITH ${methodId.toUpperCase()}`;
        localMethodButtonElement.setAttribute('id', methodId);
        localMethodButtonElement.style.backgroundColor = '#4496f6';
        localMethodButtonElement.style.width = '100%';
        localMethodButtonElement.style.height = '50px';
        localMethodButtonElement.style.display = 'flex';
        localMethodButtonElement.style.justifyContent = 'center';
        localMethodButtonElement.style.alignItems = 'center';
        localMethodButtonElement.style.alignContent = 'center';
        localMethodButtonElement.style.color = 'white';
        localMethodButtonElement.style.fontSize = '1.3rem';
        localMethodButtonElement.style.fontWeight = '600';
        localMethodButtonElement.addEventListener('click', (e) => this.handleClick(e, methodId));

        return localMethodButtonElement;
    }

    private handleClick(event: Event, methodId: string) {
        const { submitForm, onValidate } = this.braintreeLocalMethods || {};
        const state = this.paymentIntegrationService.getState();
        const consignments = state.getConsignmentsOrThrow();
        const { shippingAddress: { firstName, lastName, countryCode} } = consignments[0];
        const cart = state.getCartOrThrow();
        const { baseAmount, currency, email } = cart;
        const isShippingRequired = cart.lineItems.physicalItems.length > 0

        event.preventDefault();
        this.localPaymentInstance?.startPayment({
            paymentType: methodId,
            amount: baseAmount,
            fallback: { // see Fallback section for details on these params
                url: 'https://your-domain.com/page-to-complete-checkout',
                buttonText: 'Complete Payment'
            }, // TODO: FIX
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
                this.toggleLoadingIndicator(true);
                start();
            }
        }, async (startPaymentError: StartPaymentError, payload: LocalPaymentsPayload) => {
            if (startPaymentError) {
                this.toggleLoadingIndicator(false);
                this.handleError(startPaymentError);
            } else {
                this.nonce = payload.nonce;
                if (onValidate && typeof onValidate === 'function' && submitForm && typeof submitForm === 'function') {
                    await onValidate();
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

    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
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
        const sessionId = await this.braintreeIntegrationService.getSessionId();
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const { email } = cart;

        const paymentData = {
            formattedPayload: {
                device_info: sessionId || null,
                paypal_account: {
                    email,
                    token: this.nonce,
                },
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                method_id: payment?.methodId,
            },
        };

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
                paymentData,
            });
        } catch (error) {
            this.handleError(error);
        }
        this.toggleLoadingIndicator(false);
    }
}
