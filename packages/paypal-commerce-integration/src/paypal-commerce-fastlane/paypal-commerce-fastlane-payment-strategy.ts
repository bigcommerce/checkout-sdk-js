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
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getFastlaneStyles,
    isPayPalFastlaneCustomer,
    isPaypalFastlaneRequestError,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneCardComponentMethods,
    PayPalFastlaneCardComponentOptions,
    PayPalFastlanePaymentFormattedPayload,
    PayPalFastlaneSdk,
    PayPalFastlaneUtils,
    PayPalInitializationData,
    PayPalSdkScriptLoader,
    TDSecureAuthenticationState,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';
import { LiabilityShiftEnum } from '../paypal-commerce-types';

import PayPalCommerceFastlanePaymentInitializeOptions, {
    WithPayPalCommerceFastlanePaymentInitializeOptions,
} from './paypal-commerce-fastlane-payment-initialize-options';

export default class PaypalCommerceFastlanePaymentStrategy implements PaymentStrategy {
    private paypalComponentMethods?: PayPalFastlaneCardComponentMethods;
    private paypalFastlaneSdk?: PayPalFastlaneSdk;
    private threeDSVerificationMethod?: string;
    private paypalcommercefastlane?: PayPalCommerceFastlanePaymentInitializeOptions;
    private orderId?: string;
    private methodId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalSdkScriptLoader: PayPalSdkScriptLoader,
        private paypalFastlaneUtils: PayPalFastlaneUtils,
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions & WithPayPalCommerceFastlanePaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, paypalcommercefastlane } = options;

        this.methodId = methodId;

        this.paypalcommercefastlane = paypalcommercefastlane;

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
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const { isDeveloperModeApplicable, isFastlaneStylingEnabled } =
            paymentMethod.initializationData || {};

        this.threeDSVerificationMethod =
            paymentMethod.initializationData?.threeDSVerificationMethod;

        this.paypalFastlaneSdk = await this.paypalSdkScriptLoader.getPayPalFastlaneSdk(
            paymentMethod,
            cart.currency.code,
            cart.id,
        );

        const paypalFastlaneStyling = isFastlaneStylingEnabled
            ? paymentMethod?.initializationData?.fastlaneStyles
            : {};

        const fastlaneStyles = getFastlaneStyles(
            paypalFastlaneStyling,
            paypalcommercefastlane?.styles,
        );

        await this.paypalFastlaneUtils.initializePayPalFastlane(
            this.paypalFastlaneSdk,
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

        const isVaultedFlow = paymentData && isVaultedInstrument(paymentData);

        try {
            await this.paymentIntegrationService.submitOrder(order, options);

            const paymentPayload = isVaultedFlow
                ? await this.prepareVaultedInstrumentPaymentPayload(methodId, paymentData)
                : await this.preparePaymentPayload(methodId, paymentData);

            await this.paymentIntegrationService.submitPayment<PayPalFastlanePaymentFormattedPayload>(
                paymentPayload,
            );

            this.paypalFastlaneUtils.removeStorageSessionId();
        } catch (error) {
            if (
                isPaypalFastlaneRequestError(error) &&
                error.response.body.name === 'INVALID_REQUEST'
            ) {
                const invalidRequestError = {
                    translationKey: 'payment.errors.invalid_request_error',
                };

                this.handleError(invalidRequestError);

                return Promise.reject();
            }

            if (error instanceof Error && error.name !== 'FastlaneError') {
                throw error;
            }

            return Promise.reject();
        }
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

        const paypalFastlaneSessionId = this.paypalFastlaneUtils.getStorageSessionId();

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

            const { customerContextId } = await this.paypalFastlaneUtils.lookupCustomerOrThrow(
                customerEmail,
            );

            const authenticationResult =
                await this.paypalFastlaneUtils.triggerAuthenticationFlowOrThrow(customerContextId);

            const { authenticationState, addresses, instruments } =
                this.paypalFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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

            if (isAuthenticationFlowCanceled) {
                this.paypalFastlaneUtils.removeStorageSessionId();
            } else {
                this.paypalFastlaneUtils.updateStorageSessionId(cart.id);
            }
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

        const paypalFastlane = this.paypalFastlaneUtils.getPayPalFastlaneOrThrow();

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
    private async prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        paymentData: VaultedInstrument,
    ): Promise<Payment<PayPalFastlanePaymentFormattedPayload>> {
        const { instrumentId } = paymentData;
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const is3DSEnabled = paymentMethod.config.is3dsEnabled;

        const fastlaneToken = is3DSEnabled ? await this.get3DSNonce(instrumentId) : instrumentId;

        await this.createOrder(fastlaneToken);

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    paypal_fastlane_token: {
                        order_id: this.orderId,
                        token: fastlaneToken,
                    },
                },
            },
        };
    }

    private async preparePaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Promise<Payment<PayPalFastlanePaymentFormattedPayload>> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);

        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();

        const { getPaymentToken } = this.getPayPalComponentMethodsOrThrow();

        const { id } = await getPaymentToken({
            name: { fullName },
            billingAddress: this.paypalFastlaneUtils.mapBcToPayPalAddress(billingAddress),
        });

        const is3DSEnabled = paymentMethod.config.is3dsEnabled;

        const nonce = is3DSEnabled ? await this.get3DSNonce(id) : id;

        await this.createOrder(nonce);

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        return {
            methodId,
            paymentData: {
                ...paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_fastlane_token: {
                        order_id: this.orderId,
                        token: nonce,
                    },
                },
            },
        };
    }

    private async createOrder(id: string): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;

        if (this.methodId) {
            const { orderId } = await this.paypalCommerceRequestSender.createOrder(this.methodId, {
                cartId,
                fastlaneToken: id,
            });

            this.orderId = orderId;
        }
    }

    /**
     *
     * 3DSecure methods
     *
     * */
    private async get3DSNonce(nonce: string): Promise<string> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const order = state.getOrderOrThrow();
        const checkoutUrl = state.getStoreConfigOrThrow().links.checkoutLink;

        const threeDomainSecureComponent = this.paypalFastlaneSdk?.ThreeDomainSecureClient;

        if (!threeDomainSecureComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        const threeDomainSecureParameters = {
            amount: order.orderAmount.toFixed(2),
            currency: cart.currency.code,
            nonce: nonce,
            threeDSRequested: this.threeDSVerificationMethod === 'SCA_ALWAYS',
            transactionContext: {
                experience_context: {
                    locale: 'en-US',
                    return_url: checkoutUrl,
                    cancel_url: checkoutUrl,
                },
            },
        };

        const isThreeDomainSecureEligible = await threeDomainSecureComponent.isEligible(
            threeDomainSecureParameters,
        );

        // Double check how it works https://developer.paypal.com/docs/multiparty/checkout/fastlane/3d-secure/

        if (isThreeDomainSecureEligible) {
            const { liabilityShift, authenticationState, nonce: threeDSNonce } =
                await threeDomainSecureComponent.show();

            if (
                liabilityShift === LiabilityShiftEnum.No ||
                liabilityShift === LiabilityShiftEnum.Unknown ||
                authenticationState === TDSecureAuthenticationState.Errored ||
                authenticationState === TDSecureAuthenticationState.Cancelled
            ) {
                throw new PaymentMethodInvalidError();
            }

            if (
                authenticationState === TDSecureAuthenticationState.Succeeded &&
                [LiabilityShiftEnum.Yes, LiabilityShiftEnum.Possible].includes(liabilityShift)
            ) {
                return threeDSNonce;
            }
        }

        if (this.threeDSVerificationMethod === 'SCA_ALWAYS' && !isThreeDomainSecureEligible) {
            throw new PaymentMethodInvalidError();
        }

        return nonce;
    }

    /**
     *
     * PayPal Fastlane instrument change
     *
     */
    private async handlePayPalStoredInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        const paypalAxoSdk = this.paypalFastlaneUtils.getPayPalFastlaneOrThrow();

        const { selectionChanged, selectedCard } = await paypalAxoSdk.profile.showCardSelector();

        if (selectionChanged) {
            const state = this.paymentIntegrationService.getState();
            const paymentProviderCustomer = state.getPaymentProviderCustomer();
            const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
                ? paymentProviderCustomer
                : {};

            const selectedInstrument = this.paypalFastlaneUtils.mapPayPalToBcInstrument(
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

    private handleError(error: unknown): void {
        if (
            this.paypalcommercefastlane?.onError &&
            typeof this.paypalcommercefastlane.onError === 'function'
        ) {
            this.paypalcommercefastlane.onError(error);
        }
    }
}
