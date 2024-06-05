import {
    BraintreeConnectAddress,
    BraintreeConnectCardComponent,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneCardComponent,
    BraintreeFastlaneCardComponentOptions,
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
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isPayPalFastlaneCustomer } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { WithBraintreeFastlanePaymentInitializeOptions } from './braintree-fastlane-payment-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

export default class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private braintreeCardComponent?: BraintreeFastlaneCardComponent | BraintreeConnectCardComponent;
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

        const paymentPayload = this.isFastlaneEnabled
            ? await this.prepareFastlanePaymentPayload(methodId)
            : await this.prepareConnectPaymentPayload(methodId, paymentData);

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(paymentPayload);

        this.browserStorage.removeItem('sessionId');
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        this.braintreeCardComponent = undefined;

        return Promise.resolve();
    }

    /**
     *
     * Braintree AXO Component rendering method
     *
     */
    private async initializeCardComponent() {
        const state = this.paymentIntegrationService.getState();
        const { phone, firstName, lastName } = state.getBillingAddressOrThrow();
        const fullName = `${firstName} ${lastName}`;

        const cardComponentOptions: BraintreeFastlaneCardComponentOptions = {
            styles: {},
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

        if (this.isFastlaneEnabled) {
            const paypalPaymentComponent =
                this.braintreeFastlaneUtils.getBraintreeFastlaneComponentOrThrow();

            this.braintreeCardComponent = await paypalPaymentComponent(cardComponentOptions);
        } else {
            const paypalPaymentComponent =
                this.braintreeFastlaneUtils.getBraintreeConnectComponentOrThrow();
            const cardComponentOptions = {
                fields: {
                    ...(phone && {
                        phoneNumber: {
                            prefill: phone,
                        },
                    }),
                },
            };

            this.braintreeCardComponent = paypalPaymentComponent(cardComponentOptions);
        }
    }

    private renderBraintreeAXOComponent(container?: string) {
        const braintreeCardComponent = this.getBraintreeCardComponentOrThrow();

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
    private async prepareConnectPaymentPayload(
        methodId: string,
        paymentData: OrderPaymentRequestBody['paymentData'],
    ): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const shippingAddress = state.getShippingAddress();

        const deviceSessionId = await this.braintreeFastlaneUtils.getDeviceSessionId();

        if (paymentData && isVaultedInstrument(paymentData)) {
            const { instrumentId } = paymentData;

            if (this.isPayPalInstrument(instrumentId)) {
                return {
                    methodId,
                    paymentData: {
                        deviceSessionId,
                        formattedPayload: {
                            paypal_connect_token: {
                                token: instrumentId,
                            },
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

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const braintreeCardComponent = this.getBraintreeCardComponentOrThrow();

        const paypalBillingAddress = this.mapToPayPalAddress(billingAddress);
        const paypalShippingAddress = shippingAddress && this.mapToPayPalAddress(shippingAddress);

        const { nonce } = await braintreeCardComponent.tokenize({
            billingAddress: paypalBillingAddress,
            ...(paypalShippingAddress && { shippingAddress: paypalShippingAddress }),
        });

        return {
            methodId,
            paymentData: {
                ...paymentData,
                deviceSessionId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
                nonce,
            },
        };
    }

    private async prepareFastlanePaymentPayload(methodId: string): Promise<Payment> {
        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();

        const paypalInstrument = this.getPayPalInstruments()[0];

        const deviceSessionId = await this.braintreeFastlaneUtils.getDeviceSessionId();

        if (paypalInstrument) {
            return {
                methodId,
                paymentData: {
                    deviceSessionId,
                    formattedPayload: {
                        paypal_fastlane_token: {
                            token: paypalInstrument.bigpayToken,
                        },
                    },
                },
            };
        }

        const { getPaymentToken } = this.getBraintreeCardComponentOrThrow();

        const { id } = await getPaymentToken({
            billingAddress: this.mapToPayPalAddress(billingAddress),
        });

        return {
            methodId,
            paymentData: {
                deviceSessionId,
                nonce: id,
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
        const paymentProviderCustomer = state.getPaymentProviderCustomer();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        const paypalFastlaneSessionId = this.browserStorage.getItem('sessionId');

        if (
            !customer.isGuest ||
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

    private getBraintreeCardComponentOrThrow() {
        if (!this.braintreeCardComponent) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeCardComponent;
    }

    private isPayPalInstrument(instrumentId: string): boolean {
        const paypalInstruments = this.getPayPalInstruments();

        return !!paypalInstruments.find((instrument) => instrument.bigpayToken === instrumentId);
    }

    private getPayPalInstruments(): CardInstrument[] {
        const state = this.paymentIntegrationService.getState();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        return braintreePaymentProviderCustomer.instruments || [];
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
