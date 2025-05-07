import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    BigCommerceButtonsOptions,
    BigCommerceBuyNowInitializeOptions,
    BigCommerceInitializationData,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../big-commerce-types';

import BigCommerceButtonInitializeOptions, {
    WithBigCommerceButtonInitializeOptions,
} from './big-commerce-button-initialize-options';

export default class BigCommerceButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBigCommerceButtonInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_paypal, containerId, methodId } = options;

        const isBuyNowFlow = Boolean(bigcommerce_payments_paypal?.buyNowInitializeOptions);

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

        if (!bigcommerce_payments_paypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_paypal" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !bigcommerce_payments_paypal.currencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_paypal.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof bigcommerce_payments_paypal.buyNowInitializeOptions?.getBuyNowCartRequestBody !==
                'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_paypal.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        // Info: we are using provided currency code for buy now cart,
        // because checkout session is not available before buy now cart creation,
        // hence application will throw an error on getCartOrThrow method call
        const currencyCode = isBuyNowFlow
            ? bigcommerce_payments_paypal.currencyCode
            : this.paymentIntegrationService.getState().getCartOrThrow().currency.code;

        await this.bigCommerceIntegrationService.loadBigCommerceSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, bigcommerce_payments_paypal);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        bigcommerce_payments_paypal: BigCommerceButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } =
            bigcommerce_payments_paypal;

        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData || {};

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommerceIntegrationService.createOrder('bigcommerce_payments_paypal'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const hostedCheckoutCallbacks = {
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this.onShippingAddressChange(data),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this.onShippingOptionsChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const buttonRenderOptions: BigCommerceButtonsOptions = {
            fundingSource: bigcommerceSdk.FUNDING.BIGCOMMERCE,
            style: this.bigCommerceIntegrationService.getValidButtonStyle(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        const bigcommerceButton = bigcommerceSdk.Buttons(buttonRenderOptions);

        if (bigcommerceButton.isEligible()) {
            bigcommerceButton.render(`#${containerId}`);
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.bigCommerceIntegrationService.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: BigCommerceBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.bigCommerceIntegrationService.createBuyNowCartOrThrow(
                buyNowInitializeOptions,
            );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
        }
    }

    private async onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<boolean> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const orderDetails = await actions.order.get();

        try {
            const billingAddress =
                this.bigCommerceIntegrationService.getBillingAddressFromOrderDetails(orderDetails);

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.bigCommerceIntegrationService.getShippingAddressFromOrderDetails(
                        orderDetails,
                    );

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.bigCommerceIntegrationService.updateOrder();
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.bigCommerceIntegrationService.submitPayment(methodId, data.orderID);

            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }

            return true; // FIXME: Do we really need to return true here?
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    private async onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
    ): Promise<void> {
        const address = this.bigCommerceIntegrationService.getAddress({
            city: data.shippingAddress.city,
            countryCode: data.shippingAddress.countryCode,
            postalCode: data.shippingAddress.postalCode,
            stateOrProvinceCode: data.shippingAddress.state,
        });

        try {
            // Info: we use the same address to fill billing and shipping addresses to have valid quota on BE for order updating process
            // on this stage we don't have access to valid customer's address accept shipping data
            await this.paymentIntegrationService.updateBillingAddress(address);
            await this.paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this.bigCommerceIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.bigCommerceIntegrationService.updateOrder();
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this.bigCommerceIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.bigCommerceIntegrationService.updateOrder();
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }
}
