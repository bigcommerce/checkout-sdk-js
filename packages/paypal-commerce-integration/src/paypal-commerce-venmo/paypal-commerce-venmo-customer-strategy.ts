import { FormPoster } from '@bigcommerce/form-poster';

import {
    CheckoutButtonInitializeOptions,
    CustomerCredentials,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from '../paypal-commerce-script-loader';
import {
    ApproveCallbackPayload,
    PayPalCommerceButtonsOptions,
    PayPalSDK,
} from '../paypal-commerce-types';

import { WithPayPalCommerceVenmoCustomerInitializeOptions } from './paypal-commerce-venmo-customer-initialize-options';

export default class PayPalCommerceVenmoCustomerStrategy implements CustomerStrategy {
    private paypalSdk?: PayPalSDK;

    constructor(
        private formPoster: FormPoster,
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceVenmoCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommercevenmo, methodId } = options;
        const { container } = paypalcommercevenmo || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "paypalcommercevenmo.containerId" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            cart.currency.code,
        );

        this.renderButton(container, methodId);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderButton(containerId: string, methodId: string): void {
        const paypalSdk = this.getPayPalSdkOrThrow();
        const fundingSource = paypalSdk.FUNDING.VENMO;

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource,
            style: {
                height: 40,
            },
            createOrder: () => this.createOrder(),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.tokenizePayment(methodId, orderID),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else {
            this.removeElement(containerId);
        }
    }

    private async createOrder(): Promise<string> {
        const cartId = this.paymentIntegrationService.getState().getCartOrThrow().id;

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(
            'paypalcommercevenmo',
            { cartId },
        );

        return orderId;
    }

    private tokenizePayment(methodId: string, orderId?: string): void {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this.formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
        });
    }

    private getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }

    private removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
