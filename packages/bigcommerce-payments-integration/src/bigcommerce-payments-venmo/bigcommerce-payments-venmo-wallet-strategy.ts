import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import {
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
    PayPalButtonStyleOptions,
    StyleButtonColor,
} from '../bigcommerce-payments-types';

import { WithBigCommercePaymentsVenmoWalletInitializeOptions } from './bigcommerce-payments-venmo-wallet-initialize-options';

export default class BigCommercePaymentsVenmoWalletStrategy implements CheckoutButtonStrategy {
    constructor(private bigCommercePaymentsVenmoWalletService: PaypalCommerceWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsVenmoWalletInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_paymentsvenmo, containerId, methodId } = options;

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

        if (!bigcommerce_paymentsvenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentsvenmo" argument is not provided.`,
            );
        }

        let parsedInitializationData: PaymentMethod<BigCommercePaymentsInitializationData>;

        try {
            parsedInitializationData = JSON.parse(
                atob(bigcommerce_paymentsvenmo.initializationData),
            );
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        await this.bigCommercePaymentsVenmoWalletService.loadPayPalSdk(
            parsedInitializationData,
            bigcommerce_paymentsvenmo.currency.code,
            false,
        );

        this.renderButton(
            containerId,
            'bigcommerce_payments.venmo',
            bigcommerce_paymentsvenmo.cartId,
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
        const paypalSdk = this.bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommercePaymentsVenmoWalletService.createPaymentOrderIntent(
                    providerId,
                    cartId,
                ),
            onApprove: async ({ orderID }: ApproveCallbackPayload) => {
                await this.bigCommercePaymentsVenmoWalletService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'bigcommerce_payments_venmo',
                    orderID,
                );
            },
        };

        const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.getValidVenmoButtonStyles(buttonStyle),
            ...defaultCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.bigCommercePaymentsVenmoWalletService.removeElement(containerId);
        }
    }

    private getValidVenmoButtonStyles(style: PayPalButtonStyleOptions | undefined) {
        const validButtonStyle =
            this.bigCommercePaymentsVenmoWalletService.getValidButtonStyle(style);

        if (validButtonStyle.color === StyleButtonColor.gold) {
            return {
                ...validButtonStyle,
                color: undefined,
            };
        }

        return validButtonStyle;
    }
}
