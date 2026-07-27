import {
    BraintreeInitializationData,
    BraintreePaypalWalletService,
    getBraintreeVenmoButtonStyle,
    isBraintreeError,
    PaypalButtonStyleColorOption,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    StandardError,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeVenmoWalletInitializeOptions, {
    WithBraintreeVenmoWalletInitializeOptions,
} from './braintree-venmo-wallet-initialize-options';

const venmoButtonStyleHover = {
    backgroundColor: '#0a7fc2',
};

export default class BraintreeVenmoWalletStrategy implements CheckoutButtonStrategy {
    constructor(private braintreePaypalWalletService: BraintreePaypalWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreeVenmoWalletInitializeOptions,
    ): Promise<void> {
        const { braintreevenmo, containerId, methodId } = options;

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

        if (!braintreevenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreevenmo" argument is not provided.`,
            );
        }

        let parsedPaymentMethod: PaymentMethod<BraintreeInitializationData>;

        try {
            parsedPaymentMethod = JSON.parse(atob(braintreevenmo.initializationData));
        } catch (error) {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const { initializationData, config } = parsedPaymentMethod;

        if (!braintreevenmo.clientToken || !initializationData || !config) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.braintreePaypalWalletService.initialize(braintreevenmo.clientToken);

        try {
            await this.braintreePaypalWalletService.loadVenmoCheckout(containerId);
        } catch (error) {
            this.handleInitializationError(error, braintreevenmo);

            return;
        }

        this.renderButton(braintreevenmo, containerId, methodId, initializationData);
    }

    async deinitialize(): Promise<void> {
        await this.braintreePaypalWalletService.teardown();
    }

    private handleInitializationError(
        error: unknown,
        braintreevenmo: BraintreeVenmoWalletInitializeOptions,
    ): void {
        const { onError, onEligibilityFailure } = braintreevenmo;

        if (error instanceof UnsupportedBrowserError) {
            onEligibilityFailure?.();

            return;
        }

        if (isBraintreeError(error) || error instanceof StandardError) {
            onError?.(error);
        }
    }

    private renderButton(
        braintreevenmo: BraintreeVenmoWalletInitializeOptions,
        containerId: string,
        methodId: string,
        initializationData: BraintreeInitializationData,
    ): void {
        const { style, onEligibilityFailure } = braintreevenmo;
        const { cartButtonStyles } = initializationData.paymentButtonStyles || {};
        const buttonStyles = style || cartButtonStyles || {};
        const { color } = buttonStyles;

        const venmoButton = document.getElementById(containerId);

        if (!venmoButton) {
            this.braintreePaypalWalletService.removeElement(containerId);

            onEligibilityFailure?.();

            return;
        }

        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, getBraintreeVenmoButtonStyle(buttonStyles));

        venmoButton.addEventListener('click', async () => {
            venmoButton.setAttribute('disabled', 'true');

            try {
                await this.braintreePaypalWalletService.proxyVenmoTokenizationPayment(
                    methodId,
                    braintreevenmo.cartId,
                );
            } catch (error) {
                if (isBraintreeError(error) || error instanceof StandardError) {
                    braintreevenmo.onAuthorizeError?.(error);
                }
            } finally {
                venmoButton.removeAttribute('disabled');
            }
        });

        if (color === PaypalButtonStyleColorOption.BLUE) {
            venmoButton.addEventListener('mouseenter', () => {
                venmoButton.style.backgroundColor = venmoButtonStyleHover.backgroundColor;
            });

            venmoButton.addEventListener('mouseleave', () => {
                venmoButton.style.backgroundColor =
                    getBraintreeVenmoButtonStyle(buttonStyles).backgroundColor;
            });
        }
    }
}
