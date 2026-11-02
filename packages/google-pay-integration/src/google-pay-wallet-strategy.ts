import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import formatGooglePayTotalPrice from './format-google-pay-total-price';
import GooglePayWalletInitializeOptions, {
    WithGooglePayWalletInitializeOptions,
} from './google-pay-wallet-initialize-options';
import GooglePayWalletService from './google-pay-wallet-service';
import isGooglePayErrorObject from './guards/is-google-pay-error-object';
import {
    GooglePayInitializationData,
    GooglePayTransactionInfo,
    TotalPriceStatusType,
} from './types';

export default class GooglePayWalletStrategy implements CheckoutButtonStrategy {
    private isPaymentInProgress = false;

    constructor(private googlePayWalletService: GooglePayWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithGooglePayWalletInitializeOptions,
    ): Promise<void> {
        const { containerId, methodId } = options;

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

        const googlePayOptions = options[methodId as keyof WithGooglePayWalletInitializeOptions];

        if (!googlePayOptions) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.${methodId}" argument is not provided.`,
            );
        }

        const paymentMethod = this.parsePaymentMethod(googlePayOptions);

        try {
            await this.googlePayWalletService.initialize(
                paymentMethod,
                this.getTransactionInfo(googlePayOptions, paymentMethod),
            );
        } catch (error) {
            if (error instanceof Error) {
                googlePayOptions.onError?.(error);
            }

            return;
        }

        if (!(await this.googlePayWalletService.isReadyToPay())) {
            googlePayOptions.onEligibilityFailure?.();

            return;
        }

        this.googlePayWalletService.renderButton(containerId, {
            buttonColor: googlePayOptions.buttonColor ?? 'default',
            buttonType: googlePayOptions.buttonType ?? 'plain',
            onClick: this.handleClick(googlePayOptions),
        });
    }

    deinitialize(): Promise<void> {
        return this.googlePayWalletService.deinitialize();
    }

    private handleClick(
        googlePayOptions: GooglePayWalletInitializeOptions,
    ): (event: MouseEvent) => Promise<void> {
        return async (event: MouseEvent) => {
            event.preventDefault();

            if (this.isPaymentInProgress) {
                return;
            }

            this.isPaymentInProgress = true;

            const { cartId, onAuthorizeError } = googlePayOptions;

            try {
                const response = await this.googlePayWalletService.showPaymentSheet();

                await this.googlePayWalletService.addBillingAddress(cartId, response);
                await this.googlePayWalletService.redirectToCheckout(cartId, response);
            } catch (error) {
                if (isGooglePayErrorObject(error)) {
                    if (error.statusCode === 'CANCELED') {
                        return;
                    }

                    onAuthorizeError?.(new PaymentMethodFailedError(JSON.stringify(error)));

                    return;
                }

                if (error instanceof Error) {
                    onAuthorizeError?.(error);
                }
            } finally {
                this.isPaymentInProgress = false;
            }
        };
    }

    private parsePaymentMethod(
        googlePayOptions: GooglePayWalletInitializeOptions,
    ): PaymentMethod<GooglePayInitializationData> {
        let paymentMethod: PaymentMethod<GooglePayInitializationData>;

        try {
            paymentMethod = JSON.parse(atob(googlePayOptions.initializationData));
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        if (!paymentMethod.initializationData || !paymentMethod.config) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return {
            ...paymentMethod,
            clientToken: googlePayOptions.clientToken || paymentMethod.clientToken,
        };
    }

    private getTransactionInfo(
        { amount, currency }: GooglePayWalletInitializeOptions,
        { initializationData }: PaymentMethod<GooglePayInitializationData>,
    ): GooglePayTransactionInfo {
        const countryCode = initializationData?.storeCountry || initializationData?.buyerCountry;

        return {
            ...(countryCode && { countryCode }),
            currencyCode: currency.code,
            totalPrice: formatGooglePayTotalPrice(Number(amount), currency.decimalPlaces),
            totalPriceStatus: TotalPriceStatusType.ESTIMATED,
        };
    }
}
