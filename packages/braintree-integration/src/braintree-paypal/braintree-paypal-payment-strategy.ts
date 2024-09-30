import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeTokenizePayload,
    PaypalAuthorizeData,
    PaypalButtonRender,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    FormattedPayload,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isHostedVaultedInstrument,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentRequestOptions,
    PaymentStrategy,
    PaypalInstrument,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import isBraintreeError from '../is-braintree-error';
import isBraintreePaypalProviderError from '../is-braintree-paypal-provider-error';
import mapToBraintreeShippingAddressOverride from '../map-to-braintree-shipping-address-override';

import {
    BraintreePaypalPaymentInitializeOptions,
    WithBraintreePaypalPaymentInitializeOptions,
} from './braintree-paypal-payment-initialize-options';

export default class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private paymentMethod?: PaymentMethod;
    private braintreeHostWindow: BraintreeHostWindow = window;
    private braintree?: BraintreePaypalPaymentInitializeOptions;
    private braintreeTokenizePayload?: BraintreeTokenizePayload;
    private paypalButtonRender?: PaypalButtonRender;
    private loadingIndicatorContainer?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private loadingIndicator: LoadingIndicator,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreePaypalPaymentInitializeOptions,
    ) {
        const { braintree: braintreeOptions, methodId } = options;

        this.braintree = braintreeOptions;

        if (!this.paymentMethod || !this.paymentMethod.nonce) {
            this.paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow(methodId);
        }

        if (this.paymentMethod.clientToken && braintreeOptions?.bannerContainerId) {
            await this.loadPaypal();

            return this.loadPaypalCheckoutInstance();
        }

        if (this.paymentMethod.clientToken) {
            return this.loadPaypal();
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);

        this.paymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (braintreeOptions?.bannerContainerId) {
            return this.loadPaypalCheckoutInstance();
        }

        if (!this.paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this.loadPaypal();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        const { onError } = this.braintree || {};
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const shouldHandleInstrumentDeclinedError =
            features && features['PAYPAL-3521.handling_declined_error_braintree'];

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const paymentData = await this.preparePaymentData(payment, order.useStoreCredit);

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(paymentData);
        } catch (error) {
            if (this.isProviderError(error) && shouldHandleInstrumentDeclinedError) {
                await this.loadPaypal();

                this.paypalButtonRender?.close();

                await this.loadPaypalCheckoutInstance();

                await new Promise((_resolve, reject) => {
                    if (onError && typeof onError === 'function') {
                        onError(new Error('INSTRUMENT_DECLINED'));
                    }

                    reject();
                });
            }

            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        this.braintreeTokenizePayload = undefined;

        this.paypalButtonRender?.close();

        return this.braintreeIntegrationService.teardown();
    }

    private async preparePaymentData(
        payment: OrderPaymentRequestBody,
        useStoreCredit?: boolean,
    ): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();

        const grandTotal = state.getOutstandingBalance(useStoreCredit);
        const config = state.getStoreConfig();

        if (!grandTotal) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!this.paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            currency,
            storeProfile: { storeLanguage },
        } = config;
        const {
            nonce,
            config: { isVaultingEnabled },
        } = this.paymentMethod;
        const { methodId, paymentData = {} } = payment;

        const token = this.braintreeTokenizePayload?.nonce || nonce;

        if (token) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);

            this.paymentMethod = state.getPaymentMethod(methodId);

            return {
                ...payment,
                paymentData: this.formattedPayload(token),
            };
        }

        if (isVaultedInstrument(paymentData) || isHostedVaultedInstrument(paymentData)) {
            if (!isVaultingEnabled) {
                throw new InvalidArgumentError(
                    'Vaulting is disabled but a vaulted instrument was being used for this transaction',
                );
            }

            return Promise.resolve(payment);
        }

        if (!isHostedInstrumentLike(paymentData)) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = paymentData;

        if (shouldSaveInstrument && !isVaultingEnabled) {
            throw new InvalidArgumentError(
                'Vaulting is disabled but shouldSaveInstrument is set to true',
            );
        }

        const shippingAddress = state.getShippingAddress();

        const shippingAddressOverride = shippingAddress
            ? mapToBraintreeShippingAddressOverride(shippingAddress)
            : undefined;

        return Promise.all([
            this.braintreeIntegrationService.paypal({
                amount: grandTotal,
                locale: storeLanguage,
                currency: currency.code,
                offerCredit: this.paymentMethod.id === 'braintreepaypalcredit',
                shippingAddressOverride,
                shouldSaveInstrument: shouldSaveInstrument || false,
                shippingAddressEditable: false,
            }),
            this.braintreeIntegrationService.getSessionId(),
        ]).then(([{ nonce, details } = {} as any, sessionId]) => ({
            ...payment,
            paymentData: this.formattedPayload(
                nonce,
                details && details.email,
                sessionId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            ),
        }));
    }

    private formattedPayload(
        token: string,
        email?: string,
        sessionId?: string,
        vaultPaymentInstrument?: boolean,
        shouldSetAsDefaultInstrument?: boolean,
    ): FormattedPayload<PaypalInstrument> {
        return {
            formattedPayload: {
                vault_payment_instrument: vaultPaymentInstrument || null,
                set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                device_info: sessionId || null,
                paypal_account: {
                    token,
                    email: email || null,
                },
            },
        };
    }

    private async loadPaypalCheckoutInstance() {
        const { clientToken, initializationData } = this.paymentMethod || {};

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken);

            const currencyCode = this.paymentIntegrationService.getState().getCartOrThrow()
                .currency.code;

            const paypalCheckoutConfig: Partial<BraintreePaypalSdkCreatorConfig> = {
                currency: currencyCode,
                intent: initializationData?.intent,
                isCreditEnabled: initializationData?.isCreditEnabled,
            };

            await this.braintreeIntegrationService.getPaypalCheckout(
                paypalCheckoutConfig,
                (braintreePaypalCheckout) => {
                    if (initializationData?.enableCheckoutPaywallBanner) {
                        this.renderPayPalMessages();
                    }

                    this.renderPayPalButton(braintreePaypalCheckout);
                },
                this.handleError,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private renderPayPalButton(braintreePaypalCheckout: BraintreePaypalCheckout) {
        const { onPaymentError, submitForm, onRenderButton, containerId, onError } =
            this.braintree || {};

        if (!containerId) {
            return;
        }

        if (!this.paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this.loadingIndicatorContainer = containerId.split('#')[1];

        const {
            id,
            config: { testMode },
        } = this.paymentMethod;

        const { paypal } = this.braintreeHostWindow;
        const fundingSource = paypal?.FUNDING.PAYPAL;

        if (paypal && fundingSource) {
            this.paypalButtonRender = paypal.Buttons({
                env: testMode ? 'sandbox' : 'production',
                commit: false,
                fundingSource,
                onClick: () => {
                    this.toggleLoadingIndicator(true);
                },
                createOrder: () => this.setupPayment(braintreePaypalCheckout, id, onPaymentError),
                onApprove: async (authorizeData: PaypalAuthorizeData) => {
                    this.braintreeTokenizePayload = await this.tokenizePaymentOrThrow(
                        authorizeData,
                        braintreePaypalCheckout,
                    );

                    if (submitForm && typeof submitForm === 'function') {
                        submitForm();
                    }
                },
                onCancel: () => {
                    this.toggleLoadingIndicator(false);
                },
                onError: (error: Error) => {
                    this.toggleLoadingIndicator(false);

                    onError?.(error);
                },
            });

            if (onRenderButton && typeof onRenderButton === 'function') {
                onRenderButton();
            }

            if (this.paypalButtonRender.isEligible()) {
                this.paypalButtonRender.render(`${containerId}`);
            }
        } else {
            this.removeElement(containerId.split('#')[1]);
        }
    }

    private async setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        method: string,
        onPaymentError: BraintreePaypalPaymentInitializeOptions['onPaymentError'],
    ): Promise<string> {
        const state = this.paymentIntegrationService.getState();

        try {
            const customer = state.getCustomer();

            const paymentMethod: PaymentMethod = state.getPaymentMethodOrThrow(method);

            const amount = state.getCheckoutOrThrow().outstandingBalance;
            const currencyCode = state.getStoreConfigOrThrow().currency.code;

            const shippingAddress = state.getShippingAddress();

            const address = shippingAddress || customer?.addresses[0];

            const shippingAddressOverride = address
                ? mapToBraintreeShippingAddressOverride(address)
                : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount,
                currency: currencyCode,
                offerCredit: false,
                intent: paymentMethod.initializationData.intent,
            });
        } catch (error) {
            if (onPaymentError) {
                onPaymentError(error);
            }

            throw error;
        }
    }

    private async tokenizePaymentOrThrow(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        onError?: (error: BraintreeError | StandardError) => void,
    ): Promise<BraintreeTokenizePayload> {
        try {
            return await braintreePaypalCheckout.tokenizePayment(authorizeData);
        } catch (error) {
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }

    private renderPayPalMessages() {
        const { bannerContainerId } = this.braintree || {};

        if (
            this.braintreeHostWindow.paypal &&
            bannerContainerId &&
            Boolean(document.getElementById(bannerContainerId))
        ) {
            const state = this.paymentIntegrationService.getState();
            const checkout = state.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            this.braintreeHostWindow.paypal
                .Messages({
                    amount: checkout.subtotal,
                    placement: 'payment',
                    style: {
                        layout: 'text',
                        logo: {
                            type: 'inline',
                        },
                    },
                })
                .render(`#${bannerContainerId}`);
        }
    }

    private async loadPaypal() {
        const { clientToken, initializationData } = this.paymentMethod || {};

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken);

            await this.braintreeIntegrationService.getPaypal();
        } catch (error) {
            this.handleError(error);
        }

        return Promise.resolve();
    }

    private handleError(error: BraintreeError | Error): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        if (error.code === 'PAYPAL_POPUP_CLOSED') {
            throw new PaymentMethodCancelledError(error.message);
        }

        throw new PaymentMethodFailedError(error.message);
    }

    private isProviderError(error: unknown): boolean {
        if (isBraintreePaypalProviderError(error)) {
            const paypalProviderError = error?.errors?.filter((e) => e.provider_error) || [];

            return paypalProviderError[0]?.provider_error?.code === '2046';
        }

        return false;
    }

    private removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
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
}
