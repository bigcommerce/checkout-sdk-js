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

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
    ShippingAddressChangeCallbackPayload,
    ShippingOptionChangeCallbackPayload,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsPayLaterCustomerInitializeOptions, {
    WithBigCommercePaymentsPayLaterCustomerInitializeOptions,
} from './bigcommerce-payments-paylater-customer-initialize-options';

export default class BigCommercePaymentsPayLaterCustomerStrategy implements CustomerStrategy {
    private onError = noop;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions &
            WithBigCommercePaymentsPayLaterCustomerInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_paylater, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_paylater) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_paylater" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_paylater.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_paylater.container" argument is not provided.',
            );
        }

        if (
            bigcommerce_payments_paylater.onClick &&
            typeof bigcommerce_payments_paylater.onClick !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_paylater.onClick" argument is not a function.',
            );
        }

        this.onError = bigcommerce_payments_paylater.onError || noop;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const paypalSdk = await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(methodId);

        if (!paypalSdk || !paypalSdk.Buttons || typeof paypalSdk.Buttons !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[BC BigCommercePayments]: BigCommercePayments Button could not be rendered, due to issues with loading BigCommercePayments SDK',
            );

            return;
        }

        this.renderButton(methodId, bigcommerce_payments_paylater);
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
        bigCommercePaymentsPayLater: BigCommercePaymentsPayLaterCustomerInitializeOptions,
    ): void {
        const { container, onComplete, onClick } = bigCommercePaymentsPayLater;

        const paypalSdk = this.bigCommercePaymentsIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { isHostedCheckoutEnabled, paymentButtonStyles } =
            paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommercePaymentsIntegrationService.createOrder(
                    'bigcommerce_payments_paylater',
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommercePaymentsIntegrationService.tokenizePayment(methodId, orderID),
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

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
                    fundingSource,
                    style: this.bigCommercePaymentsIntegrationService.getValidButtonStyle({
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
            this.bigCommercePaymentsIntegrationService.removeElement(container);
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
                this.bigCommercePaymentsIntegrationService.getBillingAddressFromOrderDetails(
                    orderDetails,
                );

            await this.paymentIntegrationService.updateBillingAddress(billingAddress);

            if (cart.lineItems.physicalItems.length > 0) {
                const shippingAddress =
                    this.bigCommercePaymentsIntegrationService.getShippingAddressFromOrderDetails(
                        orderDetails,
                    );

                await this.paymentIntegrationService.updateShippingAddress(shippingAddress);
                await this.bigCommercePaymentsIntegrationService.updateOrder();
            }

            await this.paymentIntegrationService.submitOrder({}, { params: { methodId } });
            await this.bigCommercePaymentsIntegrationService.submitPayment(methodId, data.orderID);

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
        const address = this.bigCommercePaymentsIntegrationService.getAddress({
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

            const shippingOption =
                this.bigCommercePaymentsIntegrationService.getShippingOptionOrThrow();

            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.bigCommercePaymentsIntegrationService.updateOrder();
        } catch (error) {
            this.handleError(error);
        }
    }

    private async onShippingOptionsChange(
        data: ShippingOptionChangeCallbackPayload,
    ): Promise<void> {
        const shippingOption = this.bigCommercePaymentsIntegrationService.getShippingOptionOrThrow(
            data.selectedShippingOption.id,
        );

        try {
            await this.paymentIntegrationService.selectShippingOption(shippingOption.id);
            await this.bigCommercePaymentsIntegrationService.updateOrder();
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
