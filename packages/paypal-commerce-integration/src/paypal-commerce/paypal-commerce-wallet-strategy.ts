import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceInitializationData } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { ApproveCallbackPayload, PayPalCommerceButtonsOptions } from '../paypal-commerce-types';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import { WithPayPalCommerceWalletInitializeOptions } from './paypal-commerce-wallet-initialize-options';

export default class PaypalCommerceWalletStrategy implements CheckoutButtonStrategy {
    constructor(private paypalCommerceHeadlessWalletButtonService: PaypalCommerceWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceWalletInitializeOptions,
    ): Promise<void> {
        const { paypalcommercepaypal, containerId, methodId } = options;

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

        if (!paypalcommercepaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercepaypal" argument is not provided.`,
            );
        }

        const parsedInitializationData: PaymentMethod<PayPalCommerceInitializationData> =
            JSON.parse(atob(paypalcommercepaypal.initializationData));

        await this.paypalCommerceHeadlessWalletButtonService.loadPayPalSdk(
            parsedInitializationData,
            paypalcommercepaypal.currency.code,
            false,
        );

        this.renderButton(containerId, 'paypalcommerce.paypal', paypalcommercepaypal.cartId);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(containerId: string, methodId: string, cartId: string): void {
        const paypalSdk = this.paypalCommerceHeadlessWalletButtonService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceHeadlessWalletButtonService.createPaymentOrderIntent(
                    methodId,
                    cartId,
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceHeadlessWalletButtonService.proxyTokenizationPayment(
                    cartId,
                    orderID,
                ),
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceHeadlessWalletButtonService.getValidButtonStyle(),
            ...defaultCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.paypalCommerceHeadlessWalletButtonService.removeElement(containerId);
        }
    }
}
