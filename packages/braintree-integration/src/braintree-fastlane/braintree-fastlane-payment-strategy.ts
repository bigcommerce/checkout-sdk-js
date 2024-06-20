import {
    BraintreeFastlaneAddress,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneCardComponent,
    BraintreeFastlaneCardComponentOptions,
    isBraintreeAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    CardInstrument,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isPayPalFastlaneCustomer,
    PayPalCommerceInitializationData,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { WithBraintreeFastlanePaymentInitializeOptions } from './braintree-fastlane-payment-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

export default class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private braintreeCardComponent?: BraintreeFastlaneCardComponent;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeFastlaneUtils: BraintreeFastlaneUtils,
        private browserStorage: BrowserStorage,
    ) {}

    /**
     *
     * Default methods
     *
     */
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

        if (!braintreefastlane.onChange || typeof braintreefastlane.onChange !== 'function') {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreefastlane.onChange" argument is not provided or it is not a function.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        if (!paymentMethod.initializationData?.clientToken) {
            await this.paymentIntegrationService.loadPaymentMethod(methodId);
        }

        await this.braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow(
            methodId,
            braintreefastlane.styles,
        );

        if (this.shouldRunAuthenticationFlow()) {
            await this.braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow();
        }

        await this.initializeCardComponent();

        braintreefastlane.onInit((container) => this.renderBraintreeCardComponent(container));
        braintreefastlane.onChange(() => this.handleBraintreeStoredInstrumentChange(methodId));
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const paymentPayload = await this.preparePaymentPayload(payment.methodId);

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
     * Braintree Fastlane Component rendering method
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

        const paypalPaymentComponent =
            this.braintreeFastlaneUtils.getBraintreeFastlaneComponentOrThrow();

        this.braintreeCardComponent = await paypalPaymentComponent(cardComponentOptions);
    }

    private renderBraintreeCardComponent(container?: string) {
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
    private async preparePaymentPayload(methodId: string): Promise<Payment> {
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

    /**
     *
     * Mapper methods
     *
     */
    private mapToPayPalAddress(address?: Address): BraintreeFastlaneAddress {
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

            const selectedInstruments = this.braintreeFastlaneUtils.mapPayPalToBcInstrument(
                methodId,
                [selectedCard],
            );

            if (selectedInstruments && selectedInstruments.length > 0) {
                await this.paymentIntegrationService.updatePaymentProviderCustomer({
                    ...braintreeFastlaneCustomer,
                    instruments: [...selectedInstruments],
                });

                return selectedInstruments[0];
            }
        }

        return undefined;
    }
}
