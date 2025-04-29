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

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    BigCommerceButtonsOptions,
    BigCommerceInitializationData,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../big-commerce-types';

import BigCommerceCreditCustomerInitializeOptions, {
    WithBigCommerceCreditCustomerInitializeOptions,
} from './big-commerce-credit-customer-initialize-options';

export default class BigCommerceCreditCustomerStrategy implements CustomerStrategy {
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBigCommerceCreditCustomerInitializeOptions,
    ): Promise<void> {
        const { bigcommercecredit, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommercecredit) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercecredit" argument is not provided.',
            );
        }

        if (!bigcommercecredit.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercecredit.container" argument is not provided.',
            );
        }

        if (bigcommercecredit.onClick && typeof bigcommercecredit.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommercecredit.onClick" argument is not a function.',
            );
        }

        this.onError = bigcommercecredit.onError || noop;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const bigcommerceSdk = await this.bigCommerceIntegrationService.loadBigCommerceSdk(
            methodId,
        );

        if (
            !bigcommerceSdk ||
            !bigcommerceSdk.Buttons ||
            typeof bigcommerceSdk.Buttons !== 'function'
        ) {
            console.error(
                '[BC BigCommerce]: BigCommerce Button could not be rendered, due to issues with loading BigCommerce SDK',
            );

            return;
        }

        this.renderButton(methodId, bigcommercecredit);
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
        bigCommerceCredit: BigCommerceCreditCustomerInitializeOptions,
    ): void {
        const { container, onComplete, onClick } = bigCommerceCredit;

        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled, paymentButtonStyles } =
            paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const defaultCallbacks = {
            createOrder: () => this.bigCommerceIntegrationService.createOrder('bigcommercecredit'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommerceIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick && { onClick: () => onClick() }),
        };

        const hostedCheckoutCallbacks = {
            onShippingAddressChange: (data: ShippingAddressChangeCallbackPayload) =>
                this.onShippingAddressChange(data),
            onShippingOptionsChange: (data: ShippingOptionChangeCallbackPayload) =>
                this.onShippingOptionsChange(data),
            onApprove: (data: ApproveCallbackPayload, actions: ApproveCallbackActions) =>
                this.onHostedCheckoutApprove(data, actions, methodId, onComplete),
        };

        const fundingSources = [bigcommerceSdk.FUNDING.PAYLATER, bigcommerceSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: BigCommerceButtonsOptions = {
                    fundingSource,
                    style: this.bigCommerceIntegrationService.getValidButtonStyle({
                        ...checkoutTopButtonStyles,
                        height: DefaultCheckoutButtonHeight,
                    }),
                    ...defaultCallbacks,
                    ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
                };

                const bigcommerceButton = bigcommerceSdk.Buttons(buttonRenderOptions);

                if (bigcommerceButton.isEligible()) {
                    bigcommerceButton.render(`#${container}`);
                    hasRenderedSmartButton = true;
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.bigCommerceIntegrationService.removeElement(container);
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
        } catch (error) {
            this.handleError(error);
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
            // on this stage we don't have access to valid customer's address except shipping data
            await this.paymentIntegrationService.updateBillingAddress(address);
            await this.paymentIntegrationService.updateShippingAddress(address);

            const shippingOption = this.bigCommerceIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.bigCommerceIntegrationService.updateOrder();
        } catch (error) {
            this.handleError(error);
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
