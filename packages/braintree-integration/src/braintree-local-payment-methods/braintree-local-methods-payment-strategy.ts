import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentStrategy
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import BraintreeIntegrationService from "../braintree-integration-service";
import {PayPalCommerceInitializationData} from "../../../paypal-commerce-integration/src/paypal-commerce-types";

export default class BraintreeLocalMethodsPaymentStrategy implements PaymentStrategy {
    private orderId?: string;
    private localPaymentInstance?: any;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
    ) {}


    async initialize(
        options: PaymentInitializeOptions
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
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(
            methodId,
            gatewayId,
        );
        const { orderId } = paymentMethod.initializationData || {};

        if (orderId) {
            this.orderId = orderId;

            return;
        }
        await this.braintreeIntegrationService.loadBraintreeLocalMethods(this.startPaymentCallback);

        this.renderButton(methodId, braintreelocalmethods);
    }

    private startPaymentCallback(localPaymentInstance: any) {
        console.log('START PAYMENT');
        console.log('LOCAL', localPaymentInstance);
        this.localPaymentInstance = localPaymentInstance;
    }

    private renderButton(methodId: string, braintreelocalmethods: any) {
        const { container, onRenderButton } = braintreelocalmethods;
        const localMethodButton = this.createButtonElement(methodId);
        const buttonContainerElement = document.getElementById(container);

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        buttonContainerElement?.appendChild(localMethodButton);
    }

    private createButtonElement(methodId: string) {
        const localMethodButtonElement = document.createElement('div');
        localMethodButtonElement.setAttribute('id', methodId);
        localMethodButtonElement.addEventListener('click', () => this.handleClick(methodId));

        return localMethodButtonElement;
    }

    private handleClick(methodId: string) {
        console.log('CLICK', methodId);
        return  (event: any) => {
            event.preventDefault();

            this.localPaymentInstance.startPayment({
                paymentType: methodId,
                amount: '10.67',
                fallback: { // see Fallback section for details on these params
                    url: 'https://your-domain.com/page-to-complete-checkout',
                    buttonText: 'Complete Payment'
                },
                currencyCode: 'EUR',
                shippingAddressRequired: false,
                email: 'joe@getbraintree.com',
                phone: '5101231234',
                givenName: 'Joe',
                surname: 'Doe',
                address: {
                    countryCode: 'NL'
                },
                onPaymentStart: function (data: any, start: any) {
                    // NOTE: It is critical here to store data.paymentId on your server
                    //       so it can be mapped to a webhook sent by Braintree once the
                    //       buyer completes their payment. See Start the payment
                    //       section for details.

                    // Call start to initiate the popup
                    console.log('ON PAYMENT START DATA', data);
                    start();
                }
            }, function (startPaymentError: any, payload: any) {
                if (startPaymentError) {
                    if (startPaymentError.code === 'LOCAL_PAYMENT_POPUP_CLOSED') {
                        console.error('Customer closed Local Payment popup.');
                    } else {
                        console.error('Error!', startPaymentError);
                    }
                } else {
                    // Send the nonce to your server to create a transaction
                    console.log(payload.nonce);
                }
            });
        };

    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }


    async deinitialize(): Promise<void> {
        this.orderId = undefined;

        return Promise.resolve();
    }


    async execute(payload: OrderRequestBody): Promise<void> {
        const { payment } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        // await this.braintreeIntegrationService.submitPayment(payment.methodId, this.orderId); // TODO: FIX
    }
}
