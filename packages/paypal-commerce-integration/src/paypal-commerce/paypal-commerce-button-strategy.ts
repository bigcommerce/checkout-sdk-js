import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalBuyNowInitializeOptions,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../paypal-commerce-types';

import PayPalCommerceButtonInitializeOptions, {
    WithPayPalCommerceButtonInitializeOptions,
} from './paypal-commerce-button-initialize-options';

export default class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommerce, containerId, methodId } = options;

        const isBuyNowFlow = Boolean(paypalcommerce?.buyNowInitializeOptions);

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

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !paypalcommerce.currencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof paypalcommerce.buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
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
            ? paypalcommerce.currencyCode
            : this.paymentIntegrationService.getState().getCartOrThrow().currency.code;

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommerce: PayPalCommerceButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } = paypalcommerce;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled } = paymentMethod.initializationData || {};

        const defaultCallbacks = {
            appSwitchWhenAvailable: true, // Need an indicator to trigger App Switch
            createOrder: () => this.createPayPalOrder(),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
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

        const buttonRenderOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        console.log('BUTTON RENDER OPTIONS', buttonRenderOptions);

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            console.log('PAYPAL BUTTONS', paypalButton);
            // AppSwitch Flow
            if (paypalButton?.hasReturned && paypalButton.hasReturned()) {
                console.log('HAS RETURNED');
                if (paypalButton.resume) {
                    paypalButton?.resume();
                }
            } else {
                console.log('RENDER');
                paypalButton.render(`#${containerId}`);
            }
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.paypalCommerceIntegrationService.removeElement(containerId);
        }
    }

    ///---------------------------
    private async getAccessToken() {
        const clientId =
            'AVQ8E5FI-dz2P6q3ZZHrTSSl3GjmOReS_ni2lo7AuRX3LlL0DZgZlb_Q8dOjd4CBxjLYNLM8SqzaNY7u';
        const clientSecret =
            'EK2LjzZDR2up6pOYKT-UbqHvWpJnOw1zWQVTU8QAmw5hj5IAXkHBaONwXQgXCJBDz9dw3HWMv6n0224U';

        const credentials = btoa(`${clientId}:${clientSecret}`);

        const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                // eslint-disable-next-line prettier/prettier
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error fetching token: ${JSON.stringify(data)}`);
        }

        return data.access_token;
    }

    private async createPayPalOrder() {
        try {
            const accessToken = await this.getAccessToken();
            const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'PayPal-Request-Id': 'YOUR_PAYPAL_REQUEST_ID', // Optional
                    // eslint-disable-next-line prettier/prettier, @typescript-eslint/restrict-template-expressions
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    payment_source: {
                        paypal: {
                            email_address: 'sb-r43m3y28875053@business.example.com',
                            experience_context: {
                                user_action: 'PAY_NOW',
                                return_url: 'https://example.com/merchant_app_universal_link',
                                cancel_url: 'https://example.com/merchant_app_universal_link',
                                app_switch_preference: {
                                    launch_paypal_app: true,
                                },
                            },
                        },
                    },
                    purchase_units: [
                        {
                            amount: {
                                currency_code: 'USD',
                                value: '64.00',
                            },
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayPal order creation failed: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Order created:', data);
            return data;
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        } catch (error) {
            console.log('Error', error);
        }
    }
    ///---------------------------

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalCommerceIntegrationService.createBuyNowCartOrThrow(
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
                this.paypalCommerceIntegrationService.getBillingAddressFromOrderDetails(
                    orderDetails,
                );

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.paypalCommerceIntegrationService.getShippingAddressFromOrderDetails(
                        orderDetails,
                    );

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalCommerceIntegrationService.updateOrder();
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalCommerceIntegrationService.submitPayment(methodId, data.orderID);

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
        const address = this.paypalCommerceIntegrationService.getAddress({
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

            const shippingOption = this.paypalCommerceIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceIntegrationService.updateOrder();
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
        const shippingOption = this.paypalCommerceIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceIntegrationService.updateOrder();
        } catch (error) {
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }
}
