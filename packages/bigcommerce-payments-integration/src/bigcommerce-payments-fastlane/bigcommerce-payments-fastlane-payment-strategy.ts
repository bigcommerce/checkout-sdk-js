import {
    BigCommercePaymentsFastlaneUtils,
    BigCommercePaymentsInitializationData,
    getFastlaneStyles,
    isPayPalFastlaneCustomer,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneCardComponentMethods,
    PayPalFastlaneCardComponentOptions,
    PayPalFastlanePaymentFormattedPayload,
    PayPalFastlaneSdk,
    PayPalSdkHelper,
    TDSecureAuthenticationState,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
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

import BigCommercePaymentsRequestSender from '../bigcommerce-payments-request-sender';

import { WithBigCommercePaymentsFastlanePaymentInitializeOptions } from './bigcommerce-payments-fastlane-payment-initialize-options';
import { LiabilityShiftEnum } from '../bigcommerce-payments-types';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

export default class BigCommercePaymentsFastlanePaymentStrategy implements PaymentStrategy {
    private paypalComponentMethods?: PayPalFastlaneCardComponentMethods;
    private threeDSVerificationMethod?: string;
    private paypalFastlaneSdk?: PayPalFastlaneSdk;
    private methodId?: string;
    private orderId?: string;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender,
        private bigCommercePaymentsSdk: PayPalSdkHelper,
        private bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils,
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions & WithBigCommercePaymentsFastlanePaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, bigcommerce_payments_fastlane } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        this.methodId = methodId;

        if (!bigcommerce_payments_fastlane) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_fastlane" argument is not provided.',
            );
        }

        if (
            !bigcommerce_payments_fastlane.onInit ||
            typeof bigcommerce_payments_fastlane.onInit !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_fastlane.onInit" argument is not provided or it is not a function.',
            );
        }

        if (
            !bigcommerce_payments_fastlane.onChange ||
            typeof bigcommerce_payments_fastlane.onChange !== 'function'
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_payments_fastlane.onChange" argument is not provided or it is not a function.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);
        const { isDeveloperModeApplicable, isFastlaneStylingEnabled } =
            paymentMethod.initializationData || {};

        this.paypalFastlaneSdk = await this.bigCommercePaymentsSdk.getPayPalFastlaneSdk(
            paymentMethod,
            cart.currency.code,
            cart.id,
        );

        const paypalFastlaneStyling = isFastlaneStylingEnabled
            ? paymentMethod?.initializationData?.fastlaneStyles
            : {};

        const fastlaneStyles = getFastlaneStyles(
            paypalFastlaneStyling,
            bigcommerce_payments_fastlane?.styles,
        );

        await this.bigCommercePaymentsFastlaneUtils.initializePayPalFastlane(
            this.paypalFastlaneSdk,
            !!isDeveloperModeApplicable,
            fastlaneStyles,
        );

        if (this.shouldRunAuthenticationFlow()) {
            await this.runPayPalAuthenticationFlowOrThrow(methodId);
        }

        await this.initializePayPalPaymentComponent();

        bigcommerce_payments_fastlane.onInit((container: string) =>
            this.renderPayPalPaymentComponent(container),
        );
        bigcommerce_payments_fastlane.onChange(() =>
            this.handlePayPalStoredInstrumentChange(methodId),
        );
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

            // TODO: we should probably update this method with removeStorageSessionId for better reading experience
            this.bigCommercePaymentsFastlaneUtils.updateStorageSessionId(true);
        } catch (error) {
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

        const paypalFastlaneSessionId = this.bigCommercePaymentsFastlaneUtils.getStorageSessionId();

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
                await this.bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow(customerEmail);

            const authenticationResult =
                await this.bigCommercePaymentsFastlaneUtils.triggerAuthenticationFlowOrThrow(
                    customerContextId,
                );

            const { authenticationState, addresses, instruments } =
                this.bigCommercePaymentsFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData(
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

            this.bigCommercePaymentsFastlaneUtils.updateStorageSessionId(
                isAuthenticationFlowCanceled,
                cart.id,
            );
        } catch (error) {
            // Info: Do not throw anything here to avoid blocking customer from passing checkout flow
        }
    }

    /**
     *
     * BigCommercePayments Fastlane Card Component rendering method
     *
     */
    private async initializePayPalPaymentComponent(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const phone = billingAddress.phone;
        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();

        const paypalFastlane = this.bigCommercePaymentsFastlaneUtils.getPayPalFastlaneOrThrow();

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
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);

        const is3DSEnabled =
            this.isBigcommercePaymentsFastlaneThreeDSAvailable() &&
            paymentMethod.config.is3dsEnabled;

        if (!is3DSEnabled) {
            await this.createOrder(instrumentId);
        }

        const fastlaneToken = is3DSEnabled ? await this.get3DSNonce(instrumentId) : instrumentId;

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
        const paymentMethod =
            state.getPaymentMethodOrThrow<BigCommercePaymentsInitializationData>(methodId);

        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`.trim();

        const { getPaymentToken } = this.getPayPalComponentMethodsOrThrow();

        const { id } = await getPaymentToken({
            name: { fullName },
            billingAddress:
                this.bigCommercePaymentsFastlaneUtils.mapBcToPayPalAddress(billingAddress),
        });

        const is3DSEnabled =
            this.isBigcommercePaymentsFastlaneThreeDSAvailable() &&
            paymentMethod.config.is3dsEnabled;

        if (!is3DSEnabled) {
            await this.createOrder(id);
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const fastlaneToken = is3DSEnabled ? await this.get3DSNonce(id) : id;

        return {
            methodId,
            paymentData: {
                ...paymentData,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                formattedPayload: {
                    paypal_fastlane_token: {
                        order_id: this.orderId,
                        token: fastlaneToken,
                    },
                },
            },
        };
    }

    private async createOrder(id: string): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;
        if (this.methodId) {
            const { orderId } = await this.bigCommercePaymentsRequestSender.createOrder(
                this.methodId,
                {
                    cartId,
                    fastlaneToken: id,
                },
            );

            this.orderId = orderId;
        }
    }

    /**
     *
     * 3DSecure methods
     *
     * */
    private async get3DSNonce(paypalNonce: string): Promise<string> {
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
            nonce: paypalNonce,
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

        if (isThreeDomainSecureEligible) {
            const { liabilityShift, authenticationState, nonce } =
                await threeDomainSecureComponent.show();

            if (
                liabilityShift === LiabilityShiftEnum.No ||
                liabilityShift === LiabilityShiftEnum.Unknown
            ) {
                throw new PaymentMethodInvalidError();
            }

            await this.createOrder(paypalNonce);

            if (authenticationState === TDSecureAuthenticationState.Succeeded) {
                return nonce;
            }

            // Cancelled or errored, merchant can choose to send the customer back to 3D Secure or submit a payment and or vault the payment token.
            if (authenticationState === TDSecureAuthenticationState.Errored) {
                throw new PaymentMethodInvalidError();
            }

            if (authenticationState === TDSecureAuthenticationState.Cancelled) {
                console.error('3DS check was canceled');
                throw new PaymentMethodInvalidError();
            }
        }

        return paypalNonce;
    }

    /**
     *
     * BigCommercePayments Fastlane instrument change
     *
     */
    private async handlePayPalStoredInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        const paypalAxoSdk = this.bigCommercePaymentsFastlaneUtils.getPayPalFastlaneOrThrow();

        const { selectionChanged, selectedCard } = await paypalAxoSdk.profile.showCardSelector();

        if (selectionChanged) {
            const state = this.paymentIntegrationService.getState();
            const paymentProviderCustomer = state.getPaymentProviderCustomer();
            const paypalFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
                ? paymentProviderCustomer
                : {};

            const selectedInstrument =
                this.bigCommercePaymentsFastlaneUtils.mapPayPalToBcInstrument(
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

    /**
     *
     * Bigcommerce Payments Fastlane experiments handling
     *
     */
    private isBigcommercePaymentsFastlaneThreeDSAvailable(): boolean {
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;

        return isExperimentEnabled(features, 'PROJECT-7080.bcp_fastlane_three_ds');
    }
}
