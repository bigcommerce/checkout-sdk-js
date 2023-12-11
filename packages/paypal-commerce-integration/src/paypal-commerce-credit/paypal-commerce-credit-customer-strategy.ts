import { noop } from 'lodash';

import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    DefaultCheckoutButtonHeight,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
    ShippingChangeCallbackPayload,
} from '../paypal-commerce-types';

import PayPalCommerceCreditCustomerInitializeOptions, {
    WithPayPalCommerceCreditCustomerInitializeOptions,
} from './paypal-commerce-credit-customer-initialize-options';

export default class PayPalCommerceCreditCustomerStrategy implements CustomerStrategy {
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithPayPalCommerceCreditCustomerInitializeOptions,
    ): Promise<void> {
        const { paypalcommercecredit, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommercecredit) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit" argument is not provided.',
            );
        }

        if (!paypalcommercecredit.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit.container" argument is not provided.',
            );
        }

        if (paypalcommercecredit.onClick && typeof paypalcommercecredit.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercecredit.onClick" argument is not a function.',
            );
        }

        this.onError = paypalcommercecredit.onError || noop;

        await this.paymentIntegrationService.loadPaymentMethod(methodId);
        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        this.renderButton(methodId, paypalcommercecredit);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderButton(
        methodId: string,
        paypalCommerceCredit: PayPalCommerceCreditCustomerInitializeOptions,
    ): void {
        const { container, onComplete, onClick } = paypalCommerceCredit;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled, paymentButtonStyles } =
            paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceIntegrationService.createOrder('paypalcommercecredit'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick && { onClick: () => onClick() }),
        };

        const hostedCheckoutCallbacks = {
            onShippingChange: (data: ShippingChangeCallbackPayload) => this.onShippingChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: PayPalCommerceButtonsOptions = {
                    fundingSource,
                    style: this.paypalCommerceIntegrationService.getValidButtonStyle({
                        ...checkoutTopButtonStyles,
                        height: DefaultCheckoutButtonHeight,
                    }),
                    ...defaultCallbacks,
                    ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
                };

                const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${container}`);
                    hasRenderedSmartButton = true;
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalCommerceIntegrationService.removeElement(container);
        }
    }

    private async onHostedCheckoutApprove(
        data: ApproveCallbackPayload,
        actions: ApproveCallbackActions,
        methodId: string,
        onComplete?: () => void,
    ): Promise<void> {
        if (!data.orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const cart = this.paymentIntegrationService.getState().getCartOrThrow();
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
        } catch (error) {
            this.handleError(error);
        }
    }

    private async onShippingChange(data: ShippingChangeCallbackPayload): Promise<void> {
        const address = this.paypalCommerceIntegrationService.getAddress({
            city: data.shipping_address.city,
            countryCode: data.shipping_address.country_code,
            postalCode: data.shipping_address.postal_code,
            stateOrProvinceCode: data.shipping_address.state,
        });

        try {
            await this.paymentIntegrationService.updateBillingAddress(address);
            await this.paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this.paypalCommerceIntegrationService.getShippingOptionOrThrow(
                data.selected_shipping_option?.id,
            );

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.paypalCommerceIntegrationService.updateOrder();
        } catch (error) {
            throw new Error(error);
        }
    }

    private handleError(error: Error) {
        if (typeof this.onError === 'function') {
            this.onError(error);
        } else {
            throw error;
        }
    }
}
