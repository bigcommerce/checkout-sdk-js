import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalSdkCreatorConfig,
    BraintreePaypalWalletService,
    isBraintreeError,
    PaypalAuthorizeData,
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
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import getValidButtonStyle from '../get-valid-button-style';

import BraintreePaypalCreditWalletInitializeOptions, {
    WithBraintreePaypalCreditWalletInitializeOptions,
} from './braintree-paypal-credit-wallet-initialize-options';

export default class BraintreePaypalCreditWalletStrategy implements CheckoutButtonStrategy {
    constructor(
        private braintreePaypalWalletService: BraintreePaypalWalletService,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreePaypalCreditWalletInitializeOptions,
    ): Promise<void> {
        const { braintreepaypalcredit, containerId, methodId } = options;

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

        if (!braintreepaypalcredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`,
            );
        }

        let parsedPaymentMethod: PaymentMethod<BraintreeInitializationData>;

        try {
            parsedPaymentMethod = JSON.parse(atob(braintreepaypalcredit.initializationData));
        } catch (error) {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const { initializationData, config } = parsedPaymentMethod;

        if (!braintreepaypalcredit.clientToken || !initializationData || !config) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions: BraintreePaypalSdkCreatorConfig = {
            currency: braintreepaypalcredit.currency.code,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
            commit: false,
        };

        this.braintreePaypalWalletService.initialize(braintreepaypalcredit.clientToken);

        await this.braintreePaypalWalletService.loadPaypalCheckout(
            paypalCheckoutOptions,
            containerId,
            braintreepaypalcredit.onError,
        );

        this.renderButton(
            braintreepaypalcredit,
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
        braintreepaypalcredit: BraintreePaypalCreditWalletInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
        intent?: BraintreeInitializationData['intent'],
    ): void {
        const { style, onEligibilityFailure } = braintreepaypalcredit;
        const { paypal } = this.braintreeHostWindow;

        if (!paypal) {
            this.braintreePaypalWalletService.removeElement(containerId);

            return;
        }

        const paypalButtonRender = paypal.Buttons({
            env: testMode ? 'sandbox' : 'production',
            fundingSource: paypal.FUNDING.PAYLATER,
            style: { ...getValidButtonStyle(style), color: PaypalButtonStyleColorOption.GOLD },
            createOrder: () => this.setupPayment(braintreepaypalcredit, intent),
            onApprove: (authorizeData: PaypalAuthorizeData) =>
                this.tokenizePayment(
                    authorizeData,
                    methodId,
                    braintreepaypalcredit.cartId,
                    braintreepaypalcredit.onAuthorizeError,
                ),
        });

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);

            return;
        }

        if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        }
    }

    private async setupPayment(
        braintreepaypalcredit: BraintreePaypalCreditWalletInitializeOptions,
        intent?: BraintreeInitializationData['intent'],
    ): Promise<string | void> {
        const { onPaymentError, amount, currency } = braintreepaypalcredit;

        const braintreePaypalCheckout =
            this.braintreePaypalWalletService.getBraintreePaypalCheckoutOrThrow();

        try {
            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                amount,
                currency: currency.code,
                offerCredit: true,
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
