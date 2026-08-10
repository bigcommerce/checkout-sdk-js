import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceInitializationData } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import {
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
    StyleButtonColor,
} from '../paypal-commerce-types';

import { WithPayPalCommerceVenmoWalletInitializeOptions } from './paypal-commerce-venmo-wallet-initialize-options';

export default class PayPalCommerceVenmoWalletStrategy implements CheckoutButtonStrategy {
    constructor(private paypalCommerceHeadlessWalletButtonService: PaypalCommerceWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceVenmoWalletInitializeOptions,
    ): Promise<void> {
        const { paypalcommercevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            );
        }

        if (!paypalcommercevenmo) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.',
            );
        }

        let parsedInitializationData: PaymentMethod<PayPalCommerceInitializationData>;

        try {
            parsedInitializationData = JSON.parse(atob(paypalcommercevenmo.initializationData));
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        await this.paypalCommerceHeadlessWalletButtonService.loadPayPalSdk(
            parsedInitializationData,
            paypalcommercevenmo.currency.code,
            false,
        );

        this.renderButton(
            containerId,
            'paypalcommerce.venmo',
            paypalcommercevenmo.cartId,
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
            onApprove: async ({ orderID }: ApproveCallbackPayload) => {
                await this.paypalCommerceHeadlessWalletButtonService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'paypalcommercevenmo',
                    orderID,
                );
            },
        };

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.getValidVenmoButtonStyles(buttonStyle),
            ...defaultCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.paypalCommerceHeadlessWalletButtonService.removeElement(containerId);
        }
    }

    private getValidVenmoButtonStyles(style: PayPalButtonStyleOptions | undefined) {
        const validButtonStyle =
            this.paypalCommerceHeadlessWalletButtonService.getValidButtonStyle(style);

        if (validButtonStyle.color === StyleButtonColor.gold) {
            return {
                ...validButtonStyle,
                color: undefined,
            };
        }

        return validButtonStyle;
    }
}
