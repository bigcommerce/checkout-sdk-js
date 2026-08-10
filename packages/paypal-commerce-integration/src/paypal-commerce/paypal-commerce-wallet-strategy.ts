import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceInitializationData } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
} from '../paypal-commerce-types';

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

        let parsedInitializationData: PaymentMethod<PayPalCommerceInitializationData>;

        try {
            parsedInitializationData = JSON.parse(atob(paypalcommercepaypal.initializationData));
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        await this.paypalCommerceHeadlessWalletButtonService.loadPayPalSdk(
            parsedInitializationData,
            paypalcommercepaypal.currency.code,
            false,
        );

        this.renderButton(
            containerId,
            'paypalcommerce.paypal',
            paypalcommercepaypal.cartId,
            buttonStyle,
        );
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        providerId: string,
        cartId: string,
        buttonStyle?: PayPalButtonStyleOptions,
    ): void {
        const paypalSdk = this.paypalCommerceHeadlessWalletButtonService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceHeadlessWalletButtonService.createPaymentOrderIntent(
                    providerId,
                    cartId,
                ),
            onApprove: async (
                { orderID }: ApproveCallbackPayload,
                actions: ApproveCallbackActions,
            ) => {
                const orderDetails = await actions.order.get();
                const billingAddress =
                    this.paypalCommerceHeadlessWalletButtonService.mapOrderDetailsToBillingAddress(
                        orderDetails,
                    );

                await this.paypalCommerceHeadlessWalletButtonService.addBillingAddress(
                    cartId,
                    billingAddress,
                );
                await this.paypalCommerceHeadlessWalletButtonService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'paypalcommerce',
                    orderID,
                );
            },
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceHeadlessWalletButtonService.getValidButtonStyle(buttonStyle),
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
