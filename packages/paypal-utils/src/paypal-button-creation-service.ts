import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalIntegrationService from './paypal-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalButtonOptions,
    PayPalButtons,
    PayPalBuyNowInitializeOptions,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from './paypal-types';

class PaypalButtonCreationService {
    private onError?: PayPalButtonOptions['onError'];

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
    ) {}

    createPayPalButton(
        providerId: string,
        methodId: string,
        buttonOptions: PayPalButtonOptions,
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): PayPalButtons {
        const {
            style,
            fundingSource,
            isServerSideShippingCallbacksEnabled,
            isHostedCheckoutEnabled,
            onClick,
            onCancel,
            onPaymentComplete,
            onError,
        } = buttonOptions;

        this.onError = onError;
        console.log('CREATE PAYPAL Button');

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const isAvailableFundingSource = Object.values(paypalSdk.FUNDING).includes(fundingSource);

        if (!isAvailableFundingSource) {
            throw new InvalidArgumentError(
                `Unable to initialize PayPal button because "fundingSource" argument is not valid funding source.`,
            );
        }

        const hostedCheckoutCallbacks = {
            ...(!isServerSideShippingCallbacksEnabled && {
                onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                    this.onShippingAddressChange(data, providerId),
                onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                    this.onShippingOptionsChange(data, providerId),
            }),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(
                    data,
                    actions,
                    methodId,
                    providerId,
                    onPaymentComplete,
                    isServerSideShippingCallbacksEnabled,
                ),
        };

        return paypalSdk.Buttons({
            fundingSource,
            style: this.paypalIntegrationService.getValidButtonStyle(style),
            createOrder: async () => {
                if (buyNowInitializeOptions) {
                    const buyNowCart = await this.paypalIntegrationService.createBuyNowCartOrThrow(
                        buyNowInitializeOptions,
                    );

                    await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
                }

                return this.paypalIntegrationService.createOrder(providerId);
            },
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick ? { onClick } : {}),
            ...(onCancel ? { onCancel } : {}),
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        });
    }

    private async onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        providerId: string,
        onComplete?: () => void,
        isServerSideShippingCallbacksEnabled?: boolean,
    ): Promise<void> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }
        console.log('ON HOSTED');

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const orderDetails = await actions.order.get();
        let shippingAddress;
        try {
            const billingAddress =
                this.paypalIntegrationService.getBillingAddressFromOrderDetails(orderDetails);

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                //TODO: NEW LOGIC HERE
                if (isServerSideShippingCallbacksEnabled) {
                    await this.paymentIntegrationService.loadCheckout(cart.id);

                    const refreshedState = this.paymentIntegrationService.getState();
                    const consignment = refreshedState.getConsignmentsOrThrow()[0];
                    console.log('CONSIGNMENT', consignment);
                    const selectedShippingOptionId = consignment.selectedShippingOption?.id;
                    const quoteShippingAddress = consignment.shippingAddress;
                    shippingAddress = {
                        ...this.paypalIntegrationService.getShippingAddressFromOrderDetails(
                            orderDetails,
                        ),
                        ...quoteShippingAddress,
                    };

                    console.log('SHIPPING ADDRESS', shippingAddress);

                    if (selectedShippingOptionId) {
                        await this.paymentIntegrationService.selectShippingOption(
                            selectedShippingOptionId,
                        );
                    }
                } else {
                    shippingAddress =
                        this.paypalIntegrationService.getShippingAddressFromOrderDetails(
                            orderDetails,
                        );
                }

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalIntegrationService.updateOrder(providerId);
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalIntegrationService.submitPayment(methodId, data.orderID);

            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    private async onShippingAddressChange(
        data: ShippingAddressChangeCallbackPayload,
        providerId: string,
    ): Promise<void> {
        const address = this.paypalIntegrationService.getAddress({
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

            const shippingOption = this.paypalIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalIntegrationService.updateOrder(providerId);
        } catch (error) {
            this.handleError(error);
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
        providerId: string,
    ): Promise<void> {
        const shippingOption = this.paypalIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalIntegrationService.updateOrder(providerId);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown) {
        if (typeof this.onError === 'function') {
            this.onError(error);
        } else {
            throw error;
        }
    }
}

export default PaypalButtonCreationService;
