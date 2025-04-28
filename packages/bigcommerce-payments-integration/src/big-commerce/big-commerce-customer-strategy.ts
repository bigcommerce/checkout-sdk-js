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

import BigCommerceCustomerInitializeOptions, {
    WithBigCommerceCustomerInitializeOptions,
} from './big-commerce-customer-initialize-options';

export default class BigCommerceCustomerStrategy implements CustomerStrategy {
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBigCommerceCustomerInitializeOptions,
    ): Promise<void> {
        const { bigcommerce, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce" argument is not provided.',
            );
        }

        if (!bigcommerce.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce.container" argument is not provided.',
            );
        }

        if (bigcommerce.onClick && typeof bigcommerce.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce.onClick" argument is not a function.',
            );
        }

        this.onError = bigcommerce.onError || noop;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const bigCommerceSdk = await this.bigCommerceIntegrationService.loadBigCommerceSdk(
            methodId,
        );

        if (
            !bigCommerceSdk ||
            !bigCommerceSdk.Buttons ||
            typeof bigCommerceSdk.Buttons !== 'function'
        ) {
            // eslint-disable-next-line no-console
            console.error(
                '[BC BigCommerce]: BigCommerce Button could not be rendered, due to issues with loading BigCommerce SDK',
            );

            return;
        }

        this.renderButton(methodId, bigcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);

        return Promise.resolve();
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }

    private renderButton(
        methodId: string,
        bigcommerce: BigCommerceCustomerInitializeOptions,
    ): void {
        const { container, onClick, onComplete } = bigcommerce;

        const bigCommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { isHostedCheckoutEnabled, paymentButtonStyles } =
            paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const defaultCallbacks = {
            createOrder: () => this.bigCommerceIntegrationService.createOrder('bigcommerce'),
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

        const buttonRenderOptions: BigCommerceButtonsOptions = {
            fundingSource: bigCommerceSdk.FUNDING.BIGCOMMERCE,
            style: this.bigCommerceIntegrationService.getValidButtonStyle({
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            }),
            ...defaultCallbacks,
            ...(isHostedCheckoutEnabled && hostedCheckoutCallbacks),
        };

        const bigCommerceButton = bigCommerceSdk.Buttons(buttonRenderOptions);

        if (bigCommerceButton.isEligible()) {
            bigCommerceButton.render(`#${container}`);
        } else {
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
