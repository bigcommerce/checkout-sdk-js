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
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from './paypal-types';

class PaypalButtonCreationService {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
    ) {}

    createPayPalButton(
        providerId: string,
        methodId: string,
        buttonOptions: PayPalButtonOptions,
        isHostedCheckoutEnabled = false,
    ): PayPalButtons {
        const { style, fundingSource, onClick, onCancel, onPaymentComplete } = buttonOptions;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const isAvailableFundingSource = Object.values(paypalSdk.FUNDING).includes(fundingSource);

        if (!isAvailableFundingSource) {
            throw new InvalidArgumentError(
                `Unable to initialize PayPal button because "fundingSource" argument is not valid funding source.`,
            );
        }

        const hostedCheckoutCallbacks = {
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this.onShippingAddressChange(data, providerId),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this.onShippingOptionsChange(data, providerId),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(
                    data,
                    actions,
                    methodId,
                    providerId,
                    onPaymentComplete,
                ),
        };

        return paypalSdk.Buttons({
            fundingSource,
            style: this.paypalIntegrationService.getValidButtonStyle(style),
            createOrder: () => this.paypalIntegrationService.createOrder(providerId),
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
    ): Promise<boolean> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const orderDetails = await actions.order.get();

        try {
            const billingAddress =
                this.paypalIntegrationService.getBillingAddressFromOrderDetails(orderDetails);

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.paypalIntegrationService.getShippingAddressFromOrderDetails(orderDetails);

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.paypalIntegrationService.updateOrder(providerId);
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.paypalIntegrationService.submitPayment(methodId, data.orderID);

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
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
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
            if (typeof error === 'string') {
                throw new Error(error);
            }

            throw error;
        }
    }
}

export default PaypalButtonCreationService;
