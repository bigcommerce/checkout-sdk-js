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

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtons,
    BigCommerceButtonsOptions,
    BigCommerceInitializationData,
    ClickCallbackActions,
} from '../big-commerce-types';

import BigCommercePaymentInitializeOptions, {
    WithBigCommercePaymentInitializeOptions,
} from './big-commerce-payment-initialize-options';

export default class BigCommercePaymentStrategy implements PaymentStrategy {
    private loadingIndicatorContainer?: string;
    private orderId?: string;
    private bigcommerceButton?: BigCommerceButtons;
    private bigcommerce?: BigCommercePaymentInitializeOptions;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithBigCommercePaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce } = options || {};

        this.bigcommerce = bigcommerce;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!bigcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce" argument is not provided.`,
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);

        this.loadingIndicatorContainer = bigcommerce.container.split('#')[1];

        // Info:
        // The BigCommerce button and fields should not be rendered when shopper was redirected to Checkout page
        // after using smart payment button on PDP or Cart page. In this case backend returns order id if
        // it is available in checkout session. Therefore, it is not necessary to render BigCommerce button.
        if (paymentMethod.initializationData?.orderId) {
            this.orderId = paymentMethod.initializationData?.orderId;

            return;
        }

        await this.bigCommerceIntegrationService.loadBigCommerceSdk(methodId);

        if (bigcommerce.onInit && typeof bigcommerce.onInit === 'function') {
            bigcommerce.onInit(() => this.renderButton(methodId, bigcommerce));
        }

        if (
            bigcommerce.shouldRenderBigCommerceButtonOnInitialization === undefined ||
            bigcommerce.shouldRenderBigCommerceButtonOnInitialization
        ) {
            this.renderButton(methodId, bigcommerce);
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { onError } = this.bigcommerce || {};
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const shouldHandleInstrumentDeclinedError =
            features && features['PAYPAL-3438.handling_instrument_declined_error_ppc'];

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, paymentData } = payment;

        if (this.isBigCommerceVaultedInstrumentPaymentData(paymentData) && !this.orderId) {
            this.orderId = await this.createOrder();
        }

        if (!this.orderId) {
            throw new PaymentMethodInvalidError();
        }

        const paymentPayload = this.isBigCommerceVaultedInstrumentPaymentData(paymentData)
            ? this.prepareVaultedInstrumentPaymentPayload(methodId, this.orderId, paymentData)
            : this.preparePaymentPayload(methodId, this.orderId, paymentData);

        try {
            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error: unknown) {
            if (this.isProviderError(error) && shouldHandleInstrumentDeclinedError) {
                await this.bigCommerceIntegrationService.loadBigCommerceSdk(payment.methodId);

                await new Promise((_resolve, reject) => {
                    if (this.bigcommerce) {
                        this.bigcommerceButton?.close();
                        this.renderButton(payment.methodId, this.bigcommerce);
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

        this.bigcommerceButton?.close();

        return Promise.resolve();
    }

    private prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        bigcommerceOrderId: string,
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
                        bigcommerce_account: {
                            order_id: bigcommerceOrderId,
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
                    bigcommerce_account: {
                        order_id: bigcommerceOrderId,
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
        bigcommerceOrderId: string,
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
                    bigcommerce_account: {
                        order_id: bigcommerceOrderId,
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
    private renderButton(methodId: string, bigcommerce: BigCommercePaymentInitializeOptions): void {
        const bigCommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommerceInitializationData>(methodId);
        const { paymentButtonStyles } = paymentMethod.initializationData || {};
        const { checkoutPaymentButtonStyles } = paymentButtonStyles || {};
        const { container, onError, onRenderButton, onValidate, submitForm } = bigcommerce;

        const buttonOptions: BigCommerceButtonsOptions = {
            fundingSource: bigCommerceSdk.FUNDING.BIGCOMMERCE,
            style: this.bigCommerceIntegrationService.getValidButtonStyle(
                checkoutPaymentButtonStyles,
            ),
            createOrder: () => this.createOrder(),
            onClick: (_, actions) => this.handleClick(actions, onValidate),
            onApprove: (data) => this.handleApprove(data, submitForm),
            onError: (error) => this.handleError(error, onError),
            onCancel: () => this.toggleLoadingIndicator(false),
        };

        this.bigcommerceButton = bigCommerceSdk.Buttons(buttonOptions);

        if (!this.bigcommerceButton.isEligible()) {
            return;
        }

        if (onRenderButton && typeof onRenderButton === 'function') {
            onRenderButton();
        }

        this.bigcommerceButton.render(container);
    }

    private async handleClick(
        actions: ClickCallbackActions,
        onValidate: BigCommercePaymentInitializeOptions['onValidate'],
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
        submitForm: BigCommercePaymentInitializeOptions['submitForm'],
    ): void {
        this.orderId = orderID;

        submitForm();
    }

    private handleError(
        error: unknown,
        onError: BigCommercePaymentInitializeOptions['onError'],
    ): void {
        this.toggleLoadingIndicator(false);

        if (onError && typeof onError === 'function') {
            onError(error);
        }
    }

    private async createOrder(): Promise<string> {
        const fieldsValues = this.getFieldsValues();

        // TODO: check if we need this naming convention
        return this.bigCommerceIntegrationService.createOrder('paypalcommercecheckout', {
            shouldSaveInstrument: fieldsValues?.shouldSaveInstrument || false,
        });
    }

    /**
     *
     * Vaulting flow methods
     *
     * */
    private getFieldsValues(): HostedInstrument | undefined {
        const { getFieldsValues } = this.bigcommerce || {};

        return typeof getFieldsValues === 'function' ? getFieldsValues() : undefined;
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
    private isBigCommerceVaultedInstrumentPaymentData(
        paymentData?: PaymentInstrumentPayload,
    ): paymentData is VaultedInstrument & HostedInstrument {
        return (
            !!paymentData && isVaultedInstrument(paymentData) && isHostedInstrumentLike(paymentData)
        );
    }

    private isProviderError(error: unknown): boolean {
        if (isPaypalCommerceProviderError(error)) {
            const bigCommerceProviderError = error?.errors?.filter((e) => e.provider_error) || [];

            return bigCommerceProviderError[0]?.provider_error?.code === 'INSTRUMENT_DECLINED';
        }

        return false;
    }
}
