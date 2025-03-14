import { FormPoster } from '@bigcommerce/form-poster';

import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreeIntegrationService,
    BraintreeMessages,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizePayload,
    isBraintreeError,
    MessagingPlacements,
    PaypalAuthorizeData,
    PaypalButtonStyleLabelOption,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    BuyNowCartCreationError,
    BuyNowCartRequestBody,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import getValidButtonStyle from '../get-valid-button-style';
import mapToBraintreeShippingAddressOverride from '../map-to-braintree-shipping-address-override';

import BraintreePaypalCreditButtonInitializeOptions, {
    WithBraintreePaypalCreditButtonInitializeOptions,
} from './braintree-paypal-credit-button-initialize-options';

export default class BraintreePaypalCreditButtonStrategy implements CheckoutButtonStrategy {
    private buyNowCartId: string | undefined;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private braintreeMessages: BraintreeMessages,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBraintreePaypalCreditButtonInitializeOptions,
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

        let state = this.paymentIntegrationService.getState();
        let currencyCode: string;

        if (braintreepaypalcredit.buyNowInitializeOptions) {
            if (!braintreepaypalcredit.currencyCode) {
                throw new InvalidArgumentError(
                    `Unable to initialize payment because "options.braintreepaypalcredit.currencyCode" argument is not provided.`,
                );
            }

            currencyCode = braintreepaypalcredit.currencyCode;
        } else {
            await this.paymentIntegrationService.loadDefaultCheckout();

            state = this.paymentIntegrationService.getState();
            currencyCode = state.getCartOrThrow().currency.code;
        }

        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);
        const { clientToken, config, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalCheckoutOptions: Partial<BraintreePaypalSdkCreatorConfig> = {
            currency: currencyCode,
            intent: initializationData.intent,
            isCreditEnabled: initializationData.isCreditEnabled,
        };

        const paypalCheckoutSuccessCallback = (
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            if (braintreepaypalcredit.messagingContainerId) {
                this.renderPayPalMessages(methodId, braintreepaypalcredit.messagingContainerId);
            }

            this.renderPayPalButton(
                braintreePaypalCheckout,
                braintreepaypalcredit,
                containerId,
                methodId,
                !!config.testMode,
            );
        };
        const paypalCheckoutErrorCallback = (error: BraintreeError) =>
            this.handleError(error, containerId, braintreepaypalcredit.onError);

        this.braintreeIntegrationService.initialize(clientToken);
        await this.braintreeIntegrationService.getPaypalCheckout(
            paypalCheckoutOptions,
            paypalCheckoutSuccessCallback,
            paypalCheckoutErrorCallback,
        );
    }

    async deinitialize(): Promise<void> {
        await this.braintreeIntegrationService.teardown();
    }

    private renderPayPalMessages(methodId: string, messagingContainerId: string): void {
        this.braintreeMessages.render(methodId, messagingContainerId, MessagingPlacements.CART);
    }

    private renderPayPalButton(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean,
    ): void {
        const { style, shouldProcessPayment, onAuthorizeError, onEligibilityFailure } =
            braintreepaypalcredit;
        const { paypal } = this.braintreeHostWindow;

        let hasRenderedSmartButton = false;

        if (paypal) {
            const fundingSources = [paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT];
            const commonButtonStyle = style ? getValidButtonStyle(style) : {};

            fundingSources.forEach((fundingSource) => {
                const buttonStyle =
                    fundingSource === paypal.FUNDING.CREDIT
                        ? { label: PaypalButtonStyleLabelOption.CREDIT, ...commonButtonStyle }
                        : commonButtonStyle;

                if (!hasRenderedSmartButton) {
                    const paypalButtonRender = paypal.Buttons({
                        env: testMode ? 'sandbox' : 'production',
                        fundingSource,
                        style: buttonStyle,
                        createOrder: () =>
                            this.setupPayment(
                                braintreePaypalCheckout,
                                braintreepaypalcredit,
                                methodId,
                            ),
                        onApprove: (authorizeData: PaypalAuthorizeData) =>
                            this.tokenizePayment(
                                authorizeData,
                                braintreePaypalCheckout,
                                methodId,
                                shouldProcessPayment,
                                onAuthorizeError,
                            ),
                    });

                    if (paypalButtonRender.isEligible()) {
                        paypalButtonRender.render(`#${containerId}`);
                        hasRenderedSmartButton = true;
                    } else if (
                        paypal.FUNDING.CREDIT &&
                        onEligibilityFailure &&
                        typeof onEligibilityFailure === 'function'
                    ) {
                        // the condition is related to paypal.FUNDING.CREDIT because when paypal.FUNDING.PAYLATER is not eligible then
                        // CREDIT button should be configured and triggered to render with eligibility check
                        // and if it is not eligible, then onEligibilityFailure callback should be called
                        onEligibilityFailure();
                    }
                }
            });
        }

        if (!paypal || !hasRenderedSmartButton) {
            this.braintreeIntegrationService.removeElement(containerId);
        }
    }

    private async setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        braintreepaypalcredit: BraintreePaypalCreditButtonInitializeOptions,
        methodId: string,
    ): Promise<string | void> {
        const { onPaymentError, shippingAddress, buyNowInitializeOptions } = braintreepaypalcredit;

        try {
            const buyNowCart =
                typeof buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function'
                    ? await this.createBuyNowCart(
                          buyNowInitializeOptions.getBuyNowCartRequestBody(),
                      )
                    : undefined;

            this.buyNowCartId = buyNowCart?.id;

            const state = this.paymentIntegrationService.getState();
            const customer = state.getCustomer();
            const paymentMethod: PaymentMethod<BraintreeInitializationData> =
                state.getPaymentMethodOrThrow(methodId);

            const amount = buyNowCart ? buyNowCart.cartAmount : state.getCartOrThrow().cartAmount; // state.getCheckoutOrThrow().outstandingBalance
            const currencyCode = buyNowCart
                ? braintreepaypalcredit.currencyCode
                : state.getCartOrThrow().currency.code;

            const address = shippingAddress || customer?.addresses[0];

            const shippingAddressOverride = address
                ? mapToBraintreeShippingAddressOverride(address)
                : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount,
                currency: currencyCode,
                offerCredit: true,
                intent: paymentMethod.initializationData?.intent,
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
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void,
    ): Promise<BraintreeTokenizePayload | void> {
        try {
            const { deviceData } = await this.braintreeIntegrationService.getDataCollector({
                paypal: true,
            });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;
            const billingAddress =
                this.braintreeIntegrationService.mapToLegacyBillingAddress(details);
            const shippingAddress =
                this.braintreeIntegrationService.mapToLegacyShippingAddress(details);

            this.formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(billingAddress),
                shipping_address: JSON.stringify(shippingAddress),
                ...(this.buyNowCartId && { cart_id: this.buyNowCartId }),
            });

            return tokenizePayload;
        } catch (error) {
            if (onError) {
                if (isBraintreeError(error) || error instanceof StandardError) {
                    onError(error);
                }
            }

            throw error;
        }
    }

    private async createBuyNowCart(buyNowCardRequestBody?: BuyNowCartRequestBody | void) {
        if (!buyNowCardRequestBody) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        try {
            return await this.paymentIntegrationService.createBuyNowCart(buyNowCardRequestBody);
        } catch (error) {
            throw new BuyNowCartCreationError();
        }
    }

    private handleError(
        error: unknown,
        buttonContainerId: string,
        onErrorCallback?: (error: BraintreeError | StandardError) => void,
    ): void {
        this.braintreeIntegrationService.removeElement(buttonContainerId);

        if (onErrorCallback && isBraintreeError(error)) {
            onErrorCallback(error);
        } else {
            throw error;
        }
    }
}
