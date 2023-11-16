import {
    BraintreeError,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaypalSdkCreatorConfig,
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
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isBraintreeError from '../is-braintree-error';
import mapToBraintreeShippingAddressOverride from '../map-to-braintree-shipping-address-override';

import {
    BraintreePaypalPaymentInitializeOptions,
    WithBraintreePaypalCustomerInitializeOptions,
} from './braintree-paypal-payment-options';

export default class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _braintreeHostWindow: BraintreeHostWindow = window;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeIntegrationService: BraintreeIntegrationService,
        private _credit: boolean = false,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBraintreePaypalCustomerInitializeOptions,
    ) {
        const { braintree: braintreeOptions, methodId } = options;

        if (!this._paymentMethod || !this._paymentMethod.nonce) {
            this._paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow(methodId);
        }

        if (this._paymentMethod.clientToken && braintreeOptions?.bannerContainerId) {
            await this.loadPaypal();

            return this.loadPaypalCheckoutInstance(braintreeOptions);
        }

        if (this._paymentMethod.clientToken) {
            return this.loadPaypal();
        }

        const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);

        this._paymentMethod = state.getPaymentMethodOrThrow(methodId);

        if (braintreeOptions?.bannerContainerId) {
            return this.loadPaypalCheckoutInstance(braintreeOptions);
        }

        if (!this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this.loadPaypal();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const paymentData = await this.preparePaymentData(payment, order.useStoreCredit);

            await this.paymentIntegrationService.submitOrder(order, options);
            await this.paymentIntegrationService.submitPayment(paymentData);
        } catch (error) {
            this.handleError(error);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
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

        if (!this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            currency,
            storeProfile: { storeLanguage },
        } = config;
        const {
            nonce,
            config: { isVaultingEnabled },
        } = this._paymentMethod;
        const { methodId, paymentData = {} } = payment;

        if (nonce) {
            const state = await this.paymentIntegrationService.loadPaymentMethod(methodId);

            this._paymentMethod = state.getPaymentMethod(methodId);

            return Promise.resolve({ ...payment, paymentData: this.formattedPayload(nonce) });
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
                offerCredit: this._credit,
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

    private async loadPaypalCheckoutInstance(
        braintreeOptions?: BraintreePaypalPaymentInitializeOptions,
    ) {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();

        const { clientToken, initializationData } = this._paymentMethod || {};

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!initializationData?.enableCheckoutPaywallBanner) {
            return Promise.resolve();
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, storeConfig);

            const currencyCode = this.paymentIntegrationService.getState().getCartOrThrow()
                .currency.code;

            const paypalCheckoutConfig: Partial<BraintreePaypalSdkCreatorConfig> = {
                currency: currencyCode,
                intent: initializationData?.intent,
                isCreditEnabled: initializationData?.isCreditEnabled,
            };

            await this.braintreeIntegrationService.getPaypalCheckout(
                paypalCheckoutConfig,
                () => {
                    this.renderPayPalMessages(braintreeOptions?.bannerContainerId);
                },
                this.handleError,
            );
        } catch (error) {
            this.handleError(error);
        }
    }

    private renderPayPalMessages(containerId = '') {
        const isMessageContainerAvailable =
            containerId && Boolean(document.getElementById(containerId));

        if (this._braintreeHostWindow.paypal && isMessageContainerAvailable) {
            const state = this.paymentIntegrationService.getState();
            const checkout = state.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            this._braintreeHostWindow.paypal
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
                .render(`#${containerId}`);
        }
    }

    private async loadPaypal() {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();

        const { clientToken, initializationData } = this._paymentMethod || {};

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this.braintreeIntegrationService.initialize(clientToken, storeConfig);

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
}
