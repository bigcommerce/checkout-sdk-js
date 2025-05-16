import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    DefaultCheckoutButtonHeight,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsVenmoCustomerInitializeOptions, {
    WithBigCommercePaymentsVenmoCustomerInitializeOptions,
} from './bigcommerce-payments-venmo-customer-initialize-options';

export default class BigCommercePaymentsVenmoCustomerStrategy implements CustomerStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBigCommercePaymentsVenmoCustomerInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_venmo, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_venmo) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo" argument is not provided.',
            );
        }

        if (!bigcommerce_payments_venmo.container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo.container" argument is not provided.',
            );
        }

        if (
            bigcommerce_payments_venmo.onClick &&
            typeof bigcommerce_payments_venmo.onClick !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_venmo.onClick" argument is not a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethod(methodId);

        if (!paymentMethod) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        const paypalSdk = await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(methodId);

        if (!paypalSdk || !paypalSdk.Buttons || typeof paypalSdk.Buttons !== 'function') {
            // eslint-disable-next-line no-console
            console.error(
                '[BC PayPal]: PayPal Button could not be rendered, due to issues with loading PayPal SDK',
            );

            return;
        }

        this.renderButton(methodId, bigcommerce_payments_venmo);
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
        bigcommerce_payments_venmo: BigCommercePaymentsVenmoCustomerInitializeOptions,
    ): void {
        const { container, onClick } = bigcommerce_payments_venmo;

        const paypalSdk = this.bigCommercePaymentsIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutTopButtonStyles } = paymentButtonStyles || {};

        const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.VENMO,
            style: this.bigCommercePaymentsIntegrationService.getValidButtonStyle({
                ...checkoutTopButtonStyles,
                height: DefaultCheckoutButtonHeight,
            }),
            createOrder: () =>
                this.bigCommercePaymentsIntegrationService.createOrder(
                    'bigcommerce_payments_venmo',
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommercePaymentsIntegrationService.tokenizePayment(methodId, orderID),
            ...(onClick && { onClick: () => onClick() }),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${container}`);
        } else {
            this.bigCommercePaymentsIntegrationService.removeElement(container);
        }
    }
}
