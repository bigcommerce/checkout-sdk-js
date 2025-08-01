import { isBigCommercePaymentsProviderError } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';
import { isBaseInstrument } from '@bigcommerce/checkout-sdk/utility';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    ApproveCallbackPayload,
    BigCommercePaymentsButtons,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
    ClickCallbackActions,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsPaymentInitializeOptions, {
    WithBigCommercePaymentsPaymentInitializeOptions,
} from './bigcommerce-payments-payment-initialize-options';

export default class BigCommercePaymentsPaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private paypalButton?: BigCommercePaymentsButtons;
    private bigcommerce_payments?: BigCommercePaymentsPaymentInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithBigCommercePaymentsPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce_payments } = options || {};

        this.bigcommerce_payments = bigcommerce_payments;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce_payments) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);

        this.loadingIndicatorContainer = bigcommerce_payments.container.split('#')[1];

        // Info:
        // The PayPal button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render PayPal button.
        if (paymentMethod.initializationData?.orderId) {
            this.orderId = paymentMethod.initializationData?.orderId;

            return;
        }

        await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(methodId);

        if (bigcommerce_payments.onInit && typeof bigcommerce_payments.onInit === 'function') {
            bigcommerce_payments.onInit(() => this.renderButton(methodId, bigcommerce_payments));
        }

        if (
            bigcommerce_payments.shouldRenderPayPalButtonOnInitialization === undefined ||
            bigcommerce_payments.shouldRenderPayPalButtonOnInitialization
        ) {
            this.renderButton(methodId, bigcommerce_payments);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { onError } = this.bigcommerce_payments || {};
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const shouldHandleInstrumentDeclinedError =
            features && features['PAYPAL-3438.handling_instrument_declined_error_ppc'];

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, paymentData } = payment;

        if (this.isPayPalVaultedInstrumentPaymentData(paymentData) && !this.orderId) {
            this.orderId = await this.createOrder();
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
                await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(payment.methodId);

                await new Promise((_resolve, reject) => {
                    if (this.bigcommerce_payments) {
                        this.paypalButton?.close();
                        this.renderButton(payment.methodId, this.bigcommerce_payments);
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
                    bigpay_token: {
                        token: instrumentId,
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
        bigcommerce_payments: BigCommercePaymentsPaymentInitializeOptions,
    ): void {
        const paypalSdk = this.bigCommercePaymentsIntegrationService.getPayPalSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};
        const { container, onError, onRenderButton, onValidate, submitForm } = bigcommerce_payments;

        const buttonOptions: BigCommercePaymentsButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.bigCommercePaymentsIntegrationService.getValidButtonStyle(
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
        onValidate: BigCommercePaymentsPaymentInitializeOptions['onValidate'],
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
        submitForm: BigCommercePaymentsPaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleError(
        error: unknown,
        onError: BigCommercePaymentsPaymentInitializeOptions['onError'],
    ): void {
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    private async createOrder(): Promise<string> {
        const fieldsValues = this.getFieldsValues();

        return this.bigCommercePaymentsIntegrationService.createOrder(
            'bigcommerce_paymentscheckout',
            {
                shouldSaveInstrument: fieldsValues?.shouldSaveInstrument || false,
            },
        );
    }

    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues(): HostedInstrument | undefined {
        const { getFieldsValues } = this.bigcommerce_payments || {};

        return typeof getFieldsValues === 'function' ? getFieldsValues() : undefined;
    }

    private isTrustedVaultingFlow(paymentData?: PaymentInstrumentPayload): boolean {
        if (paymentData && isVaultedInstrument(paymentData)) {
            const state = this.paymentIntegrationService.getState();

            const instruments = state.getInstruments();

            const findInstrument = instruments?.find(
                (instrument) =>
                    isBaseInstrument(instrument) &&
                    instrument.bigpayToken === paymentData.instrumentId,
            );
            const trustedShippingAddress = isBaseInstrument(findInstrument)
                ? findInstrument.trustedShippingAddress
                : {};

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
        if (isBigCommercePaymentsProviderError(error)) {
            const paypalProviderError = error?.errors?.filter((e) => e.provider_error) || [];

            return paypalProviderError[0]?.provider_error?.code === 'INSTRUMENT_DECLINED';
        }

        return false;
    }
}
