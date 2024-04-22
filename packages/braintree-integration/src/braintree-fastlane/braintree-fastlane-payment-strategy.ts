import {
    BraintreeConnectAddress,
    BraintreeConnectCardComponent,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlanePaymentComponent,
    BraintreeFastlanePaymentComponentOptions,
    BraintreeInitializationData,
    isBraintreeAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
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
    PaymentMethod,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isPayPalFastlaneCustomer } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { WithBraintreeFastlanePaymentInitializeOptions } from './braintree-fastlane-payment-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';
import isBraintreeConnectCardComponent from './is-braintree-connect-card-component';
import isBraintreeFastlaneCardComponent from './is-braintree-fastlane-card-component';

export default class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private braintreePaymentComponent?:
        | BraintreeFastlanePaymentComponent
        | BraintreeConnectCardComponent;
    private isFastlaneEnabled?: boolean;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeFastlaneUtils: BraintreeFastlaneUtils,
        private browserStorage: BrowserStorage,
    ) {}

    /**
     *
     * Default methods
     *
     * */
    async initialize(
        options: PaymentInitializeOptions & WithBraintreeFastlanePaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, braintreefastlane } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreefastlane) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreefastlane" argument is not provided.',
            );
        }

        if (!braintreefastlane.onInit || typeof braintreefastlane.onInit !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreefastlane.onInit" argument is not provided or it is not a function.',
            );
        }

        const paymentMethod = await this.getValidPaymentMethodOrThrow(methodId);

        this.isFastlaneEnabled = !!paymentMethod?.initializationData?.isFastlaneEnabled;

        if (
            this.isFastlaneEnabled &&
            (!braintreefastlane.onChange || typeof braintreefastlane.onChange !== 'function')
        ) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreefastlane.onChange" argument is not provided or it is not a function.',
            );
        }

        await this.braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow(
            methodId,
            braintreefastlane.styles,
        );

        if (this.shouldRunAuthenticationFlow() && !this.isFastlaneEnabled) {
            await this.braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow();
        }

        if (this.shouldRunAuthenticationFlow() && this.isFastlaneEnabled) {
            await this.braintreeFastlaneUtils.runPayPalFastlaneAuthenticationFlowOrThrow();
        }

        await this.initializeCardComponent();

        braintreefastlane.onInit((container) => this.renderBraintreeAXOComponent(container));

        if (
            this.isFastlaneEnabled &&
            braintreefastlane.onChange &&
            typeof braintreefastlane.onChange === 'function'
        ) {
            braintreefastlane.onChange(() => this.handleBraintreeStoredInstrumentChange(methodId));
        }
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData, methodId } = payment;

        const paymentPayload =
            paymentData && isVaultedInstrument(paymentData)
                ? await this.prepareVaultedInstrumentPaymentPayload(methodId, paymentData)
                : await this.preparePaymentPayload(methodId, paymentData);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(paymentPayload);

        this.browserStorage.removeItem('sessionId');
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.braintreePaymentComponent = undefined;

        return Promise.resolve();
    }

    /**
     *
     * Braintree AXO Component rendering method
     *
     */
    private async initializeCardComponent() {
        const state = this.paymentIntegrationService.getState();
        const { phone } = state.getBillingAddressOrThrow();

        const cardComponentOptions: BraintreeFastlanePaymentComponentOptions = {
            styles: {},
            fields: {
                ...(phone && {
                    phoneNumber: {
                        prefill: phone,
                    },
                }),
            },
        };

        if (this.isFastlaneEnabled) {
            const paypalPaymentComponent =
                this.braintreeFastlaneUtils.getBraintreeFastlaneComponentOrThrow();

            this.braintreePaymentComponent = await paypalPaymentComponent(cardComponentOptions);
        } else {
            const paypalPaymentComponent =
                this.braintreeFastlaneUtils.getBraintreeConnectComponentOrThrow();

            this.braintreePaymentComponent = paypalPaymentComponent(cardComponentOptions);
        }
    }

    private renderBraintreeAXOComponent(container?: string) {
        const braintreeCardComponent = this.getBraintreePaymentComponentOrThrow();

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "container" argument is not provided.',
            );
        }

        braintreeCardComponent.render(container);
    }

    /**
     *
     * Payment Payload preparation methods
     *
     */
    private async prepareVaultedInstrumentPaymentPayload(
        methodId: string,
        paymentData: VaultedInstrument,
    ): Promise<Payment> {
        const deviceSessionId = await this.braintreeFastlaneUtils.getDeviceSessionId();

        const { instrumentId } = paymentData;

        if (this.isPayPalFastlaneInstrument(instrumentId)) {
            return {
                methodId,
                paymentData: {
                    deviceSessionId,
                    formattedPayload: {
                        ...(this.isFastlaneEnabled
                            ? {
                                  paypal_fastlane_token: {
                                      token: instrumentId,
                                  },
                              }
                            : {
                                  paypal_connect_token: {
                                      token: instrumentId,
                                  },
                              }),
                    },
                },
            };
        }

        return {
            methodId,
            paymentData: {
                ...paymentData,
                instrumentId,
                deviceSessionId,
            },
        };
    }

    private async preparePaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        // Info: shipping can be unavailable for carts with digital items
        const shippingAddress = state.getShippingAddress();

        const deviceSessionId = await this.braintreeFastlaneUtils.getDeviceSessionId();

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const braintreePaymentComponent = this.getBraintreePaymentComponentOrThrow();

        const paypalBillingAddress = this.mapToPayPalAddress(billingAddress);
        const paypalShippingAddress = shippingAddress && this.mapToPayPalAddress(shippingAddress);

        let token;

        if (this.isFastlaneEnabled && isBraintreeFastlaneCardComponent(braintreePaymentComponent)) {
            const { id } = await braintreePaymentComponent.getPaymentToken({
                billingAddress: paypalBillingAddress,
            });

            token = id;
        } else if (isBraintreeConnectCardComponent(braintreePaymentComponent)) {
            const { nonce } = await braintreePaymentComponent.tokenize({
                billingAddress: paypalBillingAddress,
                ...(paypalShippingAddress && { shippingAddress: paypalShippingAddress }),
            });

            token = nonce;
        }

        return {
            methodId,
            paymentData: {
                ...paymentData,
                deviceSessionId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                nonce: token,
            },
        };
    }

    private mapToPayPalAddress(address?: Address): BraintreeConnectAddress {
        return {
            streetAddress: address?.address1 || '',
            locality: address?.city || '',
            region: address?.stateOrProvinceCode || '',
            postalCode: address?.postalCode || '',
            countryCodeAlpha2: address?.countryCode || '',
        };
    }

    /**
     *
     * Other methods
     *
     */
    private shouldRunAuthenticationFlow(): boolean {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const customer = state.getCustomerOrThrow();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        const paypalFastlaneSessionId = this.browserStorage.getItem('sessionId');

        const shouldSkipFastlaneForStoredMembers =
            features &&
            features['PAYPAL-4001.braintree_fastlane_stored_member_flow_removal'] &&
            !customer.isGuest;

        if (
            shouldSkipFastlaneForStoredMembers ||
            braintreePaymentProviderCustomer?.authenticationState ===
                BraintreeFastlaneAuthenticationState.CANCELED
        ) {
            return false;
        }

        return (
            !braintreePaymentProviderCustomer?.authenticationState &&
            paypalFastlaneSessionId === cart.id
        );
    }

    private getBraintreePaymentComponentOrThrow() {
        if (!this.braintreePaymentComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreePaymentComponent;
    }

    private isPayPalFastlaneInstrument(instrumentId: string): boolean {
        const state = this.paymentIntegrationService.getState();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        const paypalConnectInstruments = braintreePaymentProviderCustomer.instruments || [];

        return !!paypalConnectInstruments.find(
            (instrument) => instrument.bigpayToken === instrumentId,
        );
    }

    private async getValidPaymentMethodOrThrow(
        methodId: string,
    ): Promise<PaymentMethod<BraintreeInitializationData>> {
        let validPaymentMethodId = methodId;

        try {
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        } catch {
            validPaymentMethodId =
                methodId === 'braintree' ? 'braintreeacceleratedcheckout' : 'braintree';
            await this.paymentIntegrationService.loadPaymentMethod(validPaymentMethodId);
        }

        return this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<BraintreeInitializationData>(validPaymentMethodId);
    }

    /**
     *
     * Braintree Fastlane instrument change
     *
     */
    private async handleBraintreeStoredInstrumentChange(
        methodId: string,
    ): Promise<CardInstrument | undefined> {
        const paypalAxoSdk = this.braintreeFastlaneUtils.getBraintreeFastlaneOrThrow();

        const { selectionChanged, selectedCard } = await paypalAxoSdk.profile.showCardSelector();

        if (selectionChanged) {
            const state = this.paymentIntegrationService.getState();
            const paymentProviderCustomer = state.getPaymentProviderCustomer();
            const braintreeFastlaneCustomer = isPayPalFastlaneCustomer(paymentProviderCustomer)
                ? paymentProviderCustomer
                : {};

            const selectedInstrument = this.braintreeFastlaneUtils.mapPayPalToBcInstrument(
                methodId,
                [selectedCard],
            );

            if (selectedInstrument && selectedInstrument.length > 0) {
                await this.paymentIntegrationService.updatePaymentProviderCustomer({
                    ...braintreeFastlaneCustomer,
                    instruments: [...selectedInstrument],
                });

                return selectedInstrument[0];
            }
        }

        return undefined;
    }
}
