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
    private paypalCardComponentMethods?: PayPalFastlaneCardComponentMethods;

    // TODO: remove this line when PayPal Fastlane experiment will be rolled out to 100%
    private isFastlaneEnabled = false;

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
        const { methodId, paypalcommerceacceleratedcheckout, paypalcommercefastlane } = options;
        const paypalInitializeOptions = paypalcommercefastlane || paypalcommerceacceleratedcheckout;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!paypalInitializeOptions) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane" argument is not provided.',
            );
        }

        if (
            !paypalInitializeOptions.onInit ||
            typeof paypalInitializeOptions.onInit !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane.onInit" argument is not provided or it is not a function.',
            );
        }

        if (
            !paypalInitializeOptions.onChange ||
            typeof paypalInitializeOptions.onChange !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercefastlane.onChange" argument is not provided or it is not a function.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const currencyCode = state.getCartOrThrow().currency.code;
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);
        const {
            isDeveloperModeApplicable,
            isFastlaneEnabled, // TODO: remove this line when fastlane experiment will be rolled out to 100%
        } = paymentMethod.initializationData || {};

        this.isFastlaneEnabled = !!isFastlaneEnabled;

        if (this.isFastlaneEnabled) {
            const paypalFastlaneSdk = await this.paypalCommerceSdk.getPayPalFastlaneSdk(
                paymentMethod,
                currencyCode,
            );

            await this.paypalCommerceFastlaneUtils.initializePayPalFastlane(
                paypalFastlaneSdk,
                !!isDeveloperModeApplicable,
                paypalInitializeOptions.styles,
            );
        } else {
            const paypalAxoSdk = await this.paypalCommerceSdk.getPayPalAxo(
                paymentMethod,
                currencyCode,
            );

            await this.paypalCommerceFastlaneUtils.initializePayPalConnect(
                paypalAxoSdk,
                !!isDeveloperModeApplicable,
                paypalInitializeOptions.styles,
            );
        }

        if (this.shouldRunAuthenticationFlow()) {
            await this.runPayPalAuthenticationFlowOrThrow(methodId);
        }

        this.initializePayPalCardComponent();

        paypalInitializeOptions.onInit((container: string) =>
            this.renderPayPalCardComponent(container),
        );
        paypalInitializeOptions.onChange(() => this.handlePayPalStoredInstrumentChange(methodId));
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
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
            ? paymentProviderCustomer
            : {};

        const paypalFastlaneSessionId = this.paypalCommerceFastlaneUtils.getStorageSessionId();

        if (
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

            const { customerContextId } = this.isFastlaneEnabled
                ? await this.paypalCommerceFastlaneUtils.lookupCustomerOrThrow(customerEmail)
                : await this.paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow(
                      customerEmail,
                  );

            const authenticationResult = this.isFastlaneEnabled
                ? await this.paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow(
                      customerContextId,
                  )
                : await this.paypalCommerceFastlaneUtils.connectTriggerAuthenticationFlowOrThrow(
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
    private initializePayPalCardComponent(): void {
        const state = this.paymentIntegrationService.getState();
        const phone = state.getBillingAddress()?.phone;

        const cardComponentOptions: PayPalFastlaneCardComponentOptions = {
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        if (this.isFastlaneEnabled) {
            const paypalFastlane = this.paypalCommerceFastlaneUtils.getPayPalFastlaneOrThrow();

            this.paypalCardComponentMethods =
                paypalFastlane.FastlaneCardComponent(cardComponentOptions);
        } else {
            const paypalConnect = this.paypalCommerceFastlaneUtils.getPayPalConnectOrThrow();

            this.paypalCardComponentMethods =
                paypalConnect.ConnectCardComponent(cardComponentOptions);
        }
    }

    private renderPayPalCardComponent(container?: string): void {
        const paypalCardComponentMethods = this.getPayPalCardComponentMethodsOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render card component because "container" argument is not provided.',
            );
        }

        paypalCardComponentMethods.render(container);
    }

    private getPayPalCardComponentMethodsOrThrow(): PayPalFastlaneCardComponentMethods {
        if (!this.paypalCardComponentMethods) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalCardComponentMethods;
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

        if (this.isFastlaneEnabled) {
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
    ): Promise<Payment<PayPalFastlanePaymentFormattedPayload>> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        // Info: shipping can be unavailable for carts with digital items
        const shippingAddress = state.getShippingAddress();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { tokenize } = this.getPayPalCardComponentMethodsOrThrow();

        const { nonce } = await tokenize({
            name: {
                fullName: `${billingAddress.firstName} ${billingAddress.lastName}`.trim(),
            },
            billingAddress: this.paypalCommerceFastlaneUtils.mapBcToPayPalAddress(billingAddress),
            ...(shippingAddress && {
                shippingAddress:
                    this.paypalCommerceFastlaneUtils.mapBcToPayPalAddress(shippingAddress),
            }),
        });

        if (this.isFastlaneEnabled) {
            return {
                methodId,
                paymentData: {
                    ...paymentData,
                    shouldSaveInstrument,
                    shouldSetAsDefaultInstrument,
                    formattedPayload: {
                        paypal_fastlane_token: {
                            order_id: paypalOrderId,
                            token: nonce,
                        },
                    },
                },
            };
        }

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
     * PayPal Fastlane instrument change
     *
     */
    private async handlePayPalStoredInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        if (this.isFastlaneEnabled) {
            const paypalFastlaneSdk = this.paypalCommerceFastlaneUtils.getPayPalFastlaneOrThrow();
            const { selectionChanged, selectedCard } =
                await paypalFastlaneSdk.profile.showCardSelector();

            return selectionChanged
                ? this.paypalCommerceFastlaneUtils.mapPayPalToBcInstrument(
                      methodId,
                      selectedCard,
                  )[0]
                : undefined;
        }

        const paypalAxoSdk = this.paypalCommerceFastlaneUtils.getPayPalConnectOrThrow();
        const cardSelectorResponse = await paypalAxoSdk.profile.showCardSelector();

        return cardSelectorResponse.selectionChanged
            ? this.paypalCommerceFastlaneUtils.mapPayPalToBcInstrument(
                  methodId,
                  cardSelectorResponse.selectedCard,
              )[0]
            : undefined;
    }
}
