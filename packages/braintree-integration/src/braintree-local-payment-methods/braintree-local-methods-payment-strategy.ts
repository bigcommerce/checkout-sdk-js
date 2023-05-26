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
    // private nonce?: string;

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
    }

    private getLocalPaymentInstance(localPaymentInstance: LocalPaymentInstance) {
        if (!this.localPaymentInstance) {
            this.localPaymentInstance = localPaymentInstance;
        }
    }

    private renderButton() {

    }

    private handleClick() {

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
        const consignments = state.getConsignmentsOrThrow();
        const { shippingAddress: { firstName, lastName, countryCode} } = consignments[0];
        const { baseAmount, currency, email } = cart;
        const sessionId = await this.braintreeIntegrationService.getSessionId();
        const isShippingRequired = cart.lineItems.physicalItems.length > 0;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this.localPaymentInstance?.startPayment({
            paymentType: payment.methodId,
            amount: baseAmount,
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

                if (!this.orderId) {
                    throw PaymentMethodInvalidError;
                }

                // this.nonce = payload.nonce;
                const paymentData = {
                    formattedPayload: {
                        device_info: sessionId || null,
                        braintree_local_method_account: {
                            email: cart.email,
                            token: payload.nonce,
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
        });
    }
}
