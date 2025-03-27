import {
    Braintree3DSVerifyCardError,
    Braintree3DSVerifyCardPayload,
    BraintreeFastlaneAddress,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneCardComponent,
    BraintreeFastlaneCardComponentOptions,
    BraintreeInitializationData,
    BraintreeSdk,
    getFastlaneStyles,
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
    PaymentMethodCancelledError,
    PaymentMethodClientUnavailableError,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { WithBraintreeFastlanePaymentInitializeOptions } from './braintree-fastlane-payment-initialize-options';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

export default class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private braintreeCardComponent?: BraintreeFastlaneCardComponent;
    private is3DSEnabled?: boolean;
    private onError?: (error: Error) => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private braintreeFastlaneUtils: BraintreeFastlaneUtils,
        private browserStorage: BrowserStorage,
        private braintreeSdk: BraintreeSdk,
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

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);
        const { initializationData, clientToken } = paymentMethod || {};
        const { isFastlaneStylingEnabled } = initializationData || {};
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const isThreeDSExperimentEnabled = isExperimentEnabled(
            features,
            'PROJECT-7080.braintree_fastlane_three_ds',
        );

        this.is3DSEnabled = paymentMethod.config.is3dsEnabled;

        if (clientToken && isThreeDSExperimentEnabled) {
            this.braintreeSdk.initialize(clientToken);
        }

        const paypalFastlaneStyleSettings = isFastlaneStylingEnabled
            ? paymentMethod.initializationData?.fastlaneStyles
            : undefined;

        const fastlaneStyles = getFastlaneStyles(
            paypalFastlaneStyleSettings,
            braintreefastlane.styles,
        );

        await this.braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow(
            methodId,
            fastlaneStyles,
        );

        if (this.shouldRunAuthenticationFlow()) {
            await this.braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow();
        }

        await this.initializeCardComponent();

        this.onError = braintreefastlane.onError;

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
        const fullName = `${billingAddress.firstName} ${billingAddress.lastName}`;

        const paypalInstrument = this.getPayPalInstruments()[0];

        const deviceSessionId = await this.braintreeFastlaneUtils.getDeviceSessionId();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;
        const isThreeDSExperimentEnabled = isExperimentEnabled(
            features,
            'PROJECT-7080.braintree_fastlane_three_ds',
        );

        if (paypalInstrument) {
            const threeDSToken =
                this.is3DSEnabled && isThreeDSExperimentEnabled
                    ? await this.get3DS(paypalInstrument.bigpayToken, paypalInstrument?.iin || '')
                    : undefined;

            return {
                methodId,
                paymentData: {
                    deviceSessionId,
                    formattedPayload: {
                        paypal_fastlane_token: {
                            token: threeDSToken || paypalInstrument.bigpayToken,
                        },
                    },
                },
            };
        }

        const { getPaymentToken } = this.getBraintreeCardComponentOrThrow();

        const paymentToken = await getPaymentToken({
            name: { fullName },
            billingAddress: this.mapToPayPalAddress(billingAddress),
        });

        const binGuest = paymentToken.paymentSource.card?.binDetails?.bin || '';
        const threeDSToken =
            this.is3DSEnabled && isThreeDSExperimentEnabled
                ? await this.get3DS(paymentToken.id, binGuest)
                : undefined;

        return {
            methodId,
            paymentData: {
                deviceSessionId,
                nonce: threeDSToken || paymentToken.id,
            },
        };
    }

    /**
     * 3DS
     */
    private async get3DS(nonce: string, bin: string): Promise<string> {
        const state = this.paymentIntegrationService.getState();
        const threeDSecure = await this.braintreeSdk.getBraintreeThreeDS();
        const amount = state.getCartOrThrow().cartAmount;
        const roundedAmount = amount.toFixed(2);

        return new Promise<string>((resolve, reject) => {
            void threeDSecure.verifyCard(
                {
                    amount: roundedAmount,
                    nonce,
                    bin,
                    onLookupComplete: (_data, next) => {
                        threeDSecure.on('customer-canceled', () => {
                            if (typeof this.onError === 'function') {
                                this.onError(new PaymentMethodCancelledError());
                            }

                            reject(new PaymentMethodCancelledError());
                        });

                        next();
                    },
                },
                (
                    verifyError: Braintree3DSVerifyCardError,
                    payload: Braintree3DSVerifyCardPayload,
                ) => {
                    if (
                        verifyError &&
                        verifyError.code === 'THREEDS_VERIFY_CARD_CANCELED_BY_MERCHANT'
                    ) {
                        if (typeof this.onError === 'function') {
                            this.onError(new PaymentMethodCancelledError());
                        }

                        reject(new PaymentMethodCancelledError());
                    }

                    return resolve(payload.nonce);
                },
            );
        });
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
            region: address?.stateOrProvinceCode || address?.stateOrProvince || '',
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
            const braintreeFastlaneCustomer = isBraintreeAcceleratedCheckoutCustomer(
                paymentProviderCustomer,
            )
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
