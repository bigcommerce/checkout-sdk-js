import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalSdkCreatorConfig,
    isBraintreeError,
    PaypalAuthorizeData,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreePaypalWalletInitializeOptions, {
    WithBraintreePaypalWalletInitializeOptions,
} from './braintree-paypal-wallet-initialize-options';
import BraintreePaypalWalletService from './braintree-paypal-wallet-service';

export default class BraintreePaypalWalletStrategy implements CheckoutButtonStrategy {
    constructor(
        private braintreePaypalWalletService: BraintreePaypalWalletService,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreePaypalWalletInitializeOptions,
    ): Promise<void> {
        const { braintreepaypal, containerId, methodId } = options;

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

        if (!braintreepaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypal" argument is not provided.`,
            );
        }

        const parsedPaymentMethod: PaymentMethod<BraintreeInitializationData> = JSON.parse(
            atob(braintreepaypal.initializationData),
        );

        const { initializationData, config } = parsedPaymentMethod;

        if (!braintreepaypal.clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions: Partial<BraintreePaypalSdkCreatorConfig> = {
            currency: braintreepaypal.currency.code,
            intent: 'authorize',
            isCreditEnabled: initializationData.isCreditEnabled,
            commit: false,
        };

        this.braintreePaypalWalletService.initialize(braintreepaypal.clientToken);

        await this.braintreePaypalWalletService.loadPaypalCheckout(
            paypalCheckoutOptions,
            containerId,
            braintreepaypal.onError,
        );

        this.renderButton(braintreepaypal, containerId, methodId, !!config.testMode);
    }

    async deinitialize(): Promise<void> {
        await this.braintreePaypalWalletService.teardown();
    }

    private renderButton(
        braintreepaypal: BraintreePaypalWalletInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { style, onEligibilityFailure } = braintreepaypal;
        const { paypal } = this.braintreeHostWindow;

        if (paypal) {
            const paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                fundingSource: paypal.FUNDING.PAYPAL,
                style: this.braintreePaypalWalletService.getValidButtonStyle(style),
                createOrder: () => this.setupPayment(braintreepaypal),
                onApprove: (authorizeData: PaypalAuthorizeData) =>
                    this.tokenizePayment(
                        authorizeData,
                        methodId,
                        braintreepaypal.cartId,
                        braintreepaypal.onAuthorizeError,
                    ),
            });

            if (paypalButtonRender.isEligible()) {
                paypalButtonRender.render(`#${containerId}`);
            } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
                onEligibilityFailure();
            }
        } else {
            this.braintreePaypalWalletService.removeElement(containerId);
        }
    }

    private async setupPayment(
        braintreepaypal: BraintreePaypalWalletInitializeOptions,
    ): Promise<string | void> {
        const { onPaymentError, amount, currency } = braintreepaypal;

        const braintreePaypalCheckout =
            this.braintreePaypalWalletService.getBraintreePaypalCheckoutOrThrow();

        try {
            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                amount,
                currency: currency.code,
                offerCredit: false,
            });
        } catch (error: unknown) {
            if (onPaymentError) {
                if (isBraintreeError(error) || error instanceof StandardError) {
                    onPaymentError(error);
                }
            }

            throw error;
        }
    }

    private async tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        methodId: string,
        cartId: string,
        onError?: (error: BraintreeError | StandardError) => void,
    ): Promise<void> {
        try {
            await this.braintreePaypalWalletService.proxyTokenizationPayment(
                authorizeData,
                methodId,
                cartId,
            );
        } catch (error) {
            if (onError) {
                if (isBraintreeError(error) || error instanceof StandardError) {
                    onError(error);
                }
            }

            throw error;
        }
    }
}
