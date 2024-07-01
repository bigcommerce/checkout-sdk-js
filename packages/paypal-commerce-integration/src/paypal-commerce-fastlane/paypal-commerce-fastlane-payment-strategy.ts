import {
    CardInstrument,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderPaymentRequestBody,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getFastlaneStyles,
    isPayPalFastlaneCustomer,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneCardComponentMethods,
    PayPalFastlaneCardComponentOptions,
    PayPalFastlanePaymentFormattedPayload,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import { WithPayPalCommerceFastlanePaymentInitializeOptions } from './paypal-commerce-fastlane-payment-initialize-options';

export default class PaypalCommerceFastlanePaymentStrategy implements PaymentStrategy {
    private paypalComponentMethods?: PayPalFastlaneCardComponentMethods;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils,
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions & WithPayPalCommerceFastlanePaymentInitializeOptions,
    ): Promise<void> {
        // TODO: remove paypalcommerceacceleratedcheckout if it was removed on checkout js side
        const { methodId, paypalcommercefastlane } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommercefastlane) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane" argument is not provided.',
            );
        }

        if (!paypalcommercefastlane.onInit || typeof paypalcommercefastlane.onInit !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane.onInit" argument is not provided or it is not a function.',
            );
        }

        if (
            !paypalcommercefastlane.onChange ||
            typeof paypalcommercefastlane.onChange !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane.onChange" argument is not provided or it is not a function.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const { isDeveloperModeApplicable } = paymentMethod.initializationData || {};

        const paypalFastlaneSdk = await this.paypalCommerceSdk.getPayPalFastlaneSdk(
            paymentMethod,
            cart.currency.code,
            cart.id,
        );

        const fastlaneStyles = getFastlaneStyles(
            paymentMethod?.initializationData?.fastlaneStyles,
            paypalcommercefastlane?.styles,
        );

        await this.paypalCommerceFastlaneUtils.initializePayPalFastlane(
            paypalFastlaneSdk,
            !!isDeveloperModeApplicable,
            fastlaneStyles,
        );

        if (this.shouldRunAuthenticationFlow()) {
            await this.runPayPalAuthenticationFlowOrThrow(methodId);
        }

        await this.initializePayPalPaymentComponent();

        paypalcommercefastlane.onInit((container: string) =>
            this.renderPayPalPaymentComponent(container),
        );
        paypalcommercefastlane.onChange(() => this.handlePayPalStoredInstrumentChange(methodId));
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData, methodId } = payment;

        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(methodId, {
            cartId,
        });

        const paymentPayload =
            paymentData && isVaultedInstrument(paymentData)
                ? this.prepareVaultedInstrumentPaymentPayload(methodId, orderId, paymentData)
                : await this.preparePaymentPayload(methodId, orderId, paymentData);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment<PayPalFastlanePaymentFormattedPayload>(
            paymentPayload,
        );

        // TODO: we should probably update this method with removeStorageSessionId for better reading experience
        this.paypalCommerceFastlaneUtils.updateStorageSessionId(true);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    /**
     *
     * Authentication flow methods
     *
     */
    private shouldRunAuthenticationFlow(): boolean {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const customer = state.getCustomerOrThrow();
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
            ? paymentProviderCustomer
            : {};

        const paypalFastlaneSessionId = this.paypalCommerceFastlaneUtils.getStorageSessionId();

        if (
            !customer.isGuest ||
            paypalFastlaneCustomer?.authenticationState ===
                PayPalFastlaneAuthenticationState.CANCELED
        ) {
            return false;
        }

        return !paypalFastlaneCustomer?.authenticationState && paypalFastlaneSessionId === cart.id;
    }

    private async runPayPalAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();
            const customerEmail = customer?.email || billingAddress?.email || '';

            const { customerContextId } =
                await this.paypalCommerceFastlaneUtils.lookupCustomerOrThrow(customerEmail);

            const authenticationResult =
                await this.paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                );

            const { authenticationState, addresses, instruments } =
                this.paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
                    methodId,
                    authenticationResult,
                );

            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                authenticationState,
                addresses,
                instruments,
            });

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalFastlaneAuthenticationState.CANCELED;

            this.paypalCommerceFastlaneUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cart.id,
            );
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    /**
     *
     * PayPal Fastlane Card Component rendering method
     *
     */
    private async initializePayPalPaymentComponent(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const phone = billingAddress.phone;
        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();

        const paypalFastlane = this.paypalCommerceFastlaneUtils.getPayPalFastlaneOrThrow();

        const cardComponentOptions: PayPalFastlaneCardComponentOptions = {
            fields: {
                cardholderName: {
                    prefill: fullName,
                    enabled: true,
                },
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        this.paypalComponentMethods = await paypalFastlane.FastlaneCardComponent(
            cardComponentOptions,
        );
    }

    private renderPayPalPaymentComponent(container?: string): void {
        const paypalComponentMethods = this.getPayPalComponentMethodsOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render card component because "container" argument is not provided.',
            );
        }

        paypalComponentMethods.render(container);
    }

    private getPayPalComponentMethodsOrThrow(): PayPalFastlaneCardComponentMethods {
        if (!this.paypalComponentMethods) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalComponentMethods;
    }

    /**
     *
     * Payment Payload preparation methods
     *
     */
    private prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        paypalOrderId: string,
        paymentData: VaultedInstrument,
    ): Payment<PayPalFastlanePaymentFormattedPayload> {
        const { instrumentId } = paymentData;

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    paypal_fastlane_token: {
                        order_id: paypalOrderId,
                        token: instrumentId,
                    },
                },
            },
        };
    }

    private async preparePaymentPayload(
        methodId: string,
        paypalOrderId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Promise<Payment<PayPalFastlanePaymentFormattedPayload>> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();

        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { getPaymentToken } = this.getPayPalComponentMethodsOrThrow();

        const { id } = await getPaymentToken({
            name: { fullName },
            billingAddress: this.paypalCommerceFastlaneUtils.mapBcToPayPalAddress(billingAddress),
        });

        return {
            methodId,
            paymentData: {
                ...paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_fastlane_token: {
                        order_id: paypalOrderId,
                        token: id,
                    },
                },
            },
        };
    }

    /**
     *
     * PayPal Fastlane instrument change
     *
     */
    private async handlePayPalStoredInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        const paypalAxoSdk = this.paypalCommerceFastlaneUtils.getPayPalFastlaneOrThrow();

        const { selectionChanged, selectedCard } = await paypalAxoSdk.profile.showCardSelector();

        if (selectionChanged) {
            const state = this.paymentIntegrationService.getState();
            const paymentProviderCustomer = state.getPaymentProviderCustomer();
            const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
                ? paymentProviderCustomer
                : {};

            const selectedInstrument = this.paypalCommerceFastlaneUtils.mapPayPalToBcInstrument(
                methodId,
                selectedCard,
            )[0];

            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                ...paypalFastlaneCustomer,
                instruments: [selectedInstrument],
            });

            return selectedInstrument;
        }

        return undefined;
    }
}
