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
    isPayPalCommerceAcceleratedCheckoutCustomer,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceConnectCardComponentMethods,
    PayPalCommerceConnectCardComponentOptions,
    PayPalCommerceInitializationData,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import { WithPayPalCommerceAcceleratedCheckoutPaymentInitializeOptions } from './paypal-commerce-accelerated-checkout-payment-initialize-options';

export default class PayPalCommerceAcceleratedCheckoutPaymentStrategy implements PaymentStrategy {
    private paypalConnectCardComponentMethods?: PayPalCommerceConnectCardComponentMethods;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceSdk: PayPalCommerceSdk,
        private paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils,
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions &
            WithPayPalCommerceAcceleratedCheckoutPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommerceacceleratedcheckout } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalcommerceacceleratedcheckout) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout" argument is not provided.',
            );
        }

        if (
            !paypalcommerceacceleratedcheckout.onInit ||
            typeof paypalcommerceacceleratedcheckout.onInit !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout.onInit" argument is not provided or it is not a function.',
            );
        }

        if (
            !paypalcommerceacceleratedcheckout.onChange ||
            typeof paypalcommerceacceleratedcheckout.onChange !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerceacceleratedcheckout.onChange" argument is not provided or it is not a function.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const currencyCode = state.getCartOrThrow().currency.code;
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(paymentMethod, currencyCode);

        await this.paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect(
            paypalAxoSdk,
            !!paymentMethod.initializationData?.isDeveloperModeApplicable,
            paypalcommerceacceleratedcheckout.styles,
        );

        if (this.shouldRunAuthenticationFlow()) {
            await this.runPayPalConnectAuthenticationFlowOrThrow(methodId);
        }

        this.initializeConnectCardComponent();

        paypalcommerceacceleratedcheckout.onInit((container: string) =>
            this.renderPayPalConnectCardComponent(container),
        );
        paypalcommerceacceleratedcheckout.onChange(() =>
            this.handlePayPalConnectInstrumentChange(methodId),
        );
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
        await this.paymentIntegrationService.submitPayment(paymentPayload);

        this.paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId(true);
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
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const paypalCommercePaymentProviderCustomer = isPayPalCommerceAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        const paypalConnectSessionId =
            this.paypalCommerceAcceleratedCheckoutUtils.getStorageSessionId();

        if (
            paypalCommercePaymentProviderCustomer?.authenticationState ===
            PayPalCommerceConnectAuthenticationState.CANCELED
        ) {
            return false;
        }

        return (
            !paypalCommercePaymentProviderCustomer?.authenticationState &&
            paypalConnectSessionId === cart.id
        );
    }

    private async runPayPalConnectAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        try {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const customer = state.getCustomer();
            const billingAddress = state.getBillingAddress();
            const customerEmail = customer?.email || billingAddress?.email || '';

            // Info: calls look up method to detect if user is a PayPal Connect member
            const { customerContextId } =
                await this.paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow(
                    customerEmail,
                );

            // Info: triggers PayPal Connect authentication flow (show OTP if needed)
            // if the user recognised as PayPal Connect Customer
            const authenticationResult =
                await this.paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                );

            const { authenticationState, addresses, instruments } =
                this.paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData(
                    methodId,
                    authenticationResult,
                );

            // Info: updates checkout state with PayPal Connect data to let user use it in checkout flow
            await this.paymentIntegrationService.updatePaymentProviderCustomer({
                authenticationState,
                addresses,
                instruments,
            });

            const isAuthenticationFlowCanceled =
                authenticationResult.authenticationState ===
                PayPalCommerceConnectAuthenticationState.CANCELED;

            this.paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cart.id,
            );
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    /**
     *
     * PayPalCommerce Connect Card Component rendering method
     *
     */
    private initializeConnectCardComponent() {
        const state = this.paymentIntegrationService.getState();
        const phone = state.getBillingAddress()?.phone;

        const cardComponentOptions: PayPalCommerceConnectCardComponentOptions = {
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        const paypalConnect = this.paypalCommerceAcceleratedCheckoutUtils.getPayPalConnectOrThrow();

        this.paypalConnectCardComponentMethods =
            paypalConnect.ConnectCardComponent(cardComponentOptions);
    }

    private renderPayPalConnectCardComponent(container?: string) {
        const paypalConnectCardComponentMethods =
            this.getPayPalConnectCardComponentMethodsOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render card component because "container" argument is not provided.',
            );
        }

        paypalConnectCardComponentMethods.render(container);
    }

    private getPayPalConnectCardComponentMethodsOrThrow(): PayPalCommerceConnectCardComponentMethods {
        if (!this.paypalConnectCardComponentMethods) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalConnectCardComponentMethods;
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
    ): Payment {
        const { instrumentId } = paymentData;

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    paypal_connect_token: {
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
    ): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        // Info: shipping can be unavailable for carts with digital items
        const shippingAddress = state.getShippingAddress();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { tokenize } = this.getPayPalConnectCardComponentMethodsOrThrow();

        const { nonce } = await tokenize({
            billingAddress:
                this.paypalCommerceAcceleratedCheckoutUtils.mapBcToPayPalAddress(billingAddress),
            ...(shippingAddress && {
                shippingAddress:
                    this.paypalCommerceAcceleratedCheckoutUtils.mapBcToPayPalAddress(
                        shippingAddress,
                    ),
            }),
        });

        return {
            methodId,
            paymentData: {
                ...paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_connect_token: {
                        order_id: paypalOrderId,
                        token: nonce,
                    },
                },
            },
        };
    }

    /**
     *
     * PayPal Commerce Connect instrument change
     *
     */
    private async handlePayPalConnectInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        const paypalAxoSdk = this.paypalCommerceAcceleratedCheckoutUtils.getPayPalConnectOrThrow();
        const { selectionChanged, selectedCard } = await paypalAxoSdk.profile.showCardSelector();

        return selectionChanged
            ? this.paypalCommerceAcceleratedCheckoutUtils.mapPayPalToBcInstrument(
                  methodId,
                  selectedCard,
              )[0]
            : undefined;
    }
}
