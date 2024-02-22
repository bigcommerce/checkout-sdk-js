import {
    HostedInstrument,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentInstrumentPayload,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isPaypalCommerceProviderError } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import {
    ApproveCallbackPayload,
    ClickCallbackActions,
    PayPalCommerceButtons,
    PayPalCommerceButtonsOptions,
    PayPalCommerceInitializationData,
} from '../paypal-commerce-types';

import PayPalCommercePaymentInitializeOptions, {
    WithPayPalCommercePaymentInitializeOptions,
} from './paypal-commerce-payment-initialize-options';

export default class PayPalCommercePaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: PayPalCommerceButtons;
    private paypalcommerce?: PayPalCommercePaymentInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithPayPalCommercePaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerce } = options || {};

        this.paypalcommerce = paypalcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        this.loadingIndicatorContainer = paypalcommerce.container.split('#')[1];

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (paymentMethod.initializationData?.orderId) {
            this.orderId = paymentMethod.initializationData?.orderId;

            return;
        }

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId);

        if (paypalcommerce.onInit && typeof paypalcommerce.onInit === 'function') {
            paypalcommerce.onInit(() => this.renderButton(methodId, paypalcommerce));
        }

        if (
            paypalcommerce.shouldRenderPayPalButtonOnInitialization === undefined ||
            paypalcommerce.shouldRenderPayPalButtonOnInitialization
        ) {
            this.renderButton(methodId, paypalcommerce);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { onError } = this.paypalcommerce || {};
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const shouldHandleInstrumentDeclinedError =
            features && features['PAYPAL-3438.handling_instrument_declined_error_ppc'];

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, paymentData } = payment;

        if (this.isPayPalVaultedInstrumentPaymentData(paymentData)) {
            if (!this.orderId) {
                this.orderId = await this.createOrder();
            }
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        const paymentPayload = this.isPayPalVaultedInstrumentPaymentData(paymentData)
            ? this.prepareVaultedInstrumentPaymentPayload(methodId, this.orderId, paymentData)
            : this.preparePaymentPayload(methodId, this.orderId, paymentData);

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error: unknown) {
            if (this.isProviderError(error) && shouldHandleInstrumentDeclinedError) {
                await this.paypalCommerceIntegrationService.loadPayPalSdk(payment.methodId);

                await new Promise((_resolve, reject) => {
                    if (this.paypalcommerce) {
                        this.paypalButton?.close();
                        this.renderButton(payment.methodId, this.paypalcommerce);
                        this.handleError(new Error('INSTRUMENT_DECLINED'), onError);
                    }

                    reject();
                });
            }

            this.handleError(error, onError);

            return Promise.reject();
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.orderId = undefined;

        this.paypalButton?.close();

        return Promise.resolve();
    }

    private prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        paypalOrderId: string,
        paymentData: VaultedInstrument & HostedInstrument,
    ): Payment {
        const { instrumentId, shouldSetAsDefaultInstrument } = paymentData;

        const shouldConfirmInstrument = !this.isTrustedVaultingFlow(paymentData);

        if (shouldConfirmInstrument) {
            return {
                methodId,
                paymentData: {
                    shouldSaveInstrument: shouldConfirmInstrument,
                    shouldSetAsDefaultInstrument,
                    formattedPayload: {
                        paypal_account: {
                            order_id: paypalOrderId,
                        },
                    },
                },
            };
        }

        return {
            methodId,
            paymentData: {
                instrumentId,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_account: {
                        order_id: paypalOrderId,
                    },
                },
            },
        };
    }

    private preparePaymentPayload(
        methodId: string,
        paypalOrderId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Payment {
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        return {
            methodId,
            paymentData: {
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_account: {
                        order_id: paypalOrderId,
                    },
                },
            },
        };
    }

    /**
     *
     * Button methods/callbacks
     *
     * */
    private renderButton(
        methodId: string,
        paypalcommerce: PayPalCommercePaymentInitializeOptions,
    ): void {
        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};
        const { container, onError, onRenderButton, onValidate, submitForm } = paypalcommerce;

        const buttonOptions: PayPalCommerceButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalCommerceIntegrationService.getValidButtonStyle(
                checkoutPaymentButtonStyles,
            ),
            createOrder: () => this.createOrder(),
            onClick: (_, actions) => this.handleClick(actions, onValidate),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onError: (error) => this.handleError(error, onError),
            onCancel: () => this.toggleLoadingIndicator(false),
        };

        this.paypalButton = paypalSdk.Buttons(buttonOptions);

        if (!this.paypalButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.paypalButton.render(container);
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: PayPalCommercePaymentInitializeOptions['onValidate'],
    ): Promise<void> {
        const { resolve, reject } = actions;

        const onValidationPassed = () => {
            this.toggleLoadingIndicator(true);

            return resolve();
        };

        await onValidate(onValidationPassed, reject);
    }

    private handleApprove(
        { orderID }: ApproveCallbackPayload,
        submitForm: PayPalCommercePaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleError(
        error: unknown,
        onError: PayPalCommercePaymentInitializeOptions['onError'],
    ): void {
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    private async createOrder(): Promise<string> {
        const fieldsValues = this.getFieldsValues();

        return this.paypalCommerceIntegrationService.createOrder('paypalcommercecheckout', {
            shouldSaveInstrument: fieldsValues?.shouldSaveInstrument || false,
        });
    }

    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues() {
        const { getFieldsValues } = this.paypalcommerce || {};

        if (typeof getFieldsValues === 'function') {
            return getFieldsValues();
        }
    }

    private isTrustedVaultingFlow(paymentData?: PaymentInstrumentPayload): boolean {
        if (paymentData && isVaultedInstrument(paymentData)) {
            const state = this.paymentIntegrationService.getState();

            const instruments = state.getInstruments();

            const { trustedShippingAddress } =
                instruments?.find(({ bigpayToken }) => bigpayToken === paymentData.instrumentId) ||
                {};

            return !!trustedShippingAddress;
        }

        return false;
    }

    /**
     *
     * Loading Indicator methods
     *
     * */
    private toggleLoadingIndicator(isLoading: boolean): void {
        if (isLoading && this.loadingIndicatorContainer) {
            this.loadingIndicator.show(this.loadingIndicatorContainer);
        } else {
            this.loadingIndicator.hide();
        }
    }

    /**
     *
     * Guards
     *
     */
    private isPayPalVaultedInstrumentPaymentData(
        paymentData?: PaymentInstrumentPayload,
    ): paymentData is VaultedInstrument & HostedInstrument {
        return (
            !!paymentData && isVaultedInstrument(paymentData) && isHostedInstrumentLike(paymentData)
        );
    }

    private isProviderError(error: unknown): boolean {
        if (isPaypalCommerceProviderError(error)) {
            const paypalProviderError = error?.errors?.filter((e: any) => e.provider_error) || [];

            return paypalProviderError[0].provider_error?.code === 'INSTRUMENT_DECLINED';
        }

        return false;
    }
}
