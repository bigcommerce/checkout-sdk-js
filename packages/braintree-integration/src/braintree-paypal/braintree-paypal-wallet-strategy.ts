import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalSdkCreatorConfig,
    isBraintreeError,
    PaypalAuthorizeData,
    BraintreePaypalWalletService,
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

        const paypalCheckoutOptions: BraintreePaypalSdkCreatorConfig = {
            currency: braintreepaypal.currency.code,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
            commit: false,
        };

        this.braintreePaypalWalletService.initialize(braintreepaypal.clientToken);

        await this.braintreePaypalWalletService.loadPaypalCheckout(
            paypalCheckoutOptions,
            containerId,
            braintreepaypal.onError,
        );

        this.renderButton(
            braintreepaypal,
            containerId,
            methodId,
            !!config.testMode,
            initializationData.intent,
        );
    }

    async deinitialize(): Promise<void> {
        await this.braintreePaypalWalletService.teardown();
    }

    private renderButton(
        braintreepaypal: BraintreePaypalWalletInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
        intent?: BraintreeInitializationData['intent'],
    ): void {
        const { style, onEligibilityFailure } = braintreepaypal;
        const { paypal } = this.braintreeHostWindow;

        if (paypal) {
            const paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                fundingSource: paypal.FUNDING.PAYPAL,
                style: this.braintreePaypalWalletService.getValidButtonStyle(style),
                createOrder: () => this.setupPayment(braintreepaypal, intent),
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
        intent?: BraintreeInitializationData['intent'],
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
                intent,
            });
        } catch (error: unknown) {
            if (isBraintreeError(error) || error instanceof StandardError) {
                onPaymentError?.(error);
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
            if (isBraintreeError(error) || error instanceof StandardError) {
                onError?.(error);
            }

            throw error;
        }
    }
}
