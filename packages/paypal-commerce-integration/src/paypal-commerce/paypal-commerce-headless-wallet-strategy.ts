import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { ApproveCallbackPayload, PayPalCommerceButtonsOptions } from '../paypal-commerce-types';

import { WithPayPalCommerceHeadlessWalletInitializeOptions } from './paypal-commerce-headless-wallet-initialize-options';

export default class PaypalCommerceHeadlessWalletStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithPayPalCommerceHeadlessWalletInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        const state = await this.paymentIntegrationService.loadCard(paypalcommerce.cartId);

        await this.paypalCommerceIntegrationService.loadPayPalSdk(
            methodId,
            state.getCart()?.currency.code,
            false,
        );

        this.renderButton(containerId, methodId);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(containerId: string, methodId: string): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceIntegrationService.createPaymentOrderIntent(
                    'paypalcommerce.paypal',
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(),
            ...defaultCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.paypalCommerceIntegrationService.removeElement(containerId);
        }
    }
}
