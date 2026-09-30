import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithGooglePayWalletInitializeOptions } from './google-pay-wallet-initialize-options';
import GooglePayWalletService from './google-pay-wallet-service';
import { GooglePayInitializationData, TotalPriceStatusType } from './types';

export default class GooglePayWalletStrategy implements CheckoutButtonStrategy {
    constructor(private googlePayWalletService: GooglePayWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithGooglePayWalletInitializeOptions,
    ): Promise<void> {
        const { containerId, methodId, bigcommerce_paymentsgooglepay } = options;

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

        if (!bigcommerce_paymentsgooglepay) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentsgooglepay" argument is not provided.`,
            );
        }

        const {
            cartId,
            currency,
            amount,
            initializationData: encodedInitializationData,
            buttonColor,
            buttonType,
        } = bigcommerce_paymentsgooglepay;

        let parsedPaymentMethod: PaymentMethod<GooglePayInitializationData>;

        try {
            parsedPaymentMethod = JSON.parse(atob(encodedInitializationData));
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const initializationData = parsedPaymentMethod.initializationData as
            | (GooglePayInitializationData & { buyerCountry?: string })
            | undefined;
        const storeCountry = initializationData?.storeCountry || initializationData?.buyerCountry;

        await this.googlePayWalletService.initialize(
            parsedPaymentMethod,
            currency.code,
            !!parsedPaymentMethod.config?.testMode,
            {
                ...(storeCountry && { countryCode: storeCountry }),
                currencyCode: currency.code,
                totalPrice: Number(amount).toFixed(2),
                totalPriceStatus: TotalPriceStatusType.ESTIMATED,
            },
        );

        this.googlePayWalletService.renderButton(containerId, {
            buttonColor: buttonColor ?? 'default',
            buttonType: buttonType ?? 'plain',
            onClick: this.handleClick(cartId),
        });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private handleClick(cartId: string): (event: MouseEvent) => Promise<void> {
        return async (event: MouseEvent) => {
            event.preventDefault();

            const response = await this.googlePayWalletService.showPaymentSheet();

            const orderId = await this.googlePayWalletService.createPaymentOrderIntent(cartId);
            const billingAddress = this.googlePayWalletService.mapToBillingAddress(response);

            await this.googlePayWalletService.addBillingAddress(cartId, billingAddress);
            await this.googlePayWalletService.proxyTokenizationPayment(cartId, orderId, response);
        };
    }
}
