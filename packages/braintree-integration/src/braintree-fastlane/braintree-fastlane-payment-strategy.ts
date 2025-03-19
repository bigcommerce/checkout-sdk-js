import {
    BraintreeFastlaneAddress,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneCardComponent,
    BraintreeFastlaneCardComponentOptions,
    BraintreeInitializationData,
    BraintreeSdk, BraintreeThreeDSecureOptions,
    BraintreeVerifyPayload,
    getFastlaneStyles,
    isBraintreeAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address, CancellablePromise,
    CardInstrument,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
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

export default class BraintreeFastlanePaymentStrategy implements PaymentStrategy {
    private braintreeCardComponent?: BraintreeFastlaneCardComponent;
    private is3DSEnabled?: boolean;
    private threeDSecureOptions?: BraintreeThreeDSecureOptions;

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
        this.threeDSecureOptions = braintreefastlane?.threeDSecure;

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

        this.is3DSEnabled = paymentMethod.config.is3dsEnabled;

        if (clientToken) {
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

        const paymentToken = await getPaymentToken({
            name: { fullName },
            billingAddress: this.mapToPayPalAddress(billingAddress),
        });

        const bin = paymentToken.paymentSource.card?.binDetails?.bin || '';
        const threeDSGuest = this.is3DSEnabled ?
            await this.get3DS(paymentToken.id, bin) : null;

        return {
            methodId,
            paymentData: {
                deviceSessionId,
                nonce: threeDSGuest?.nonce ?? paymentToken.id,
            },
        };
    }

    /**
     * 3DS
     */
   async get3DS(nonce: string, bin: string): Promise<BraintreeVerifyPayload> {
       const state = this.paymentIntegrationService.getState();
       const threeDSecure = await this.braintreeSdk.getBraintreeThreeDS();
       const amount = state.getCartOrThrow().cartAmount;

       if (!this.threeDSecureOptions || !nonce) {
           throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
       }

        const {
            addFrame,
            removeFrame,
            challengeRequested = true,
            additionalInformation,
        } = this.threeDSecureOptions;
        const cancelVerifyCard = async () => {
            const response = await threeDSecure.cancelVerifyCard();

            verification.cancel(new PaymentMethodCancelledError());

            return response;
        };

        const roundedAmount = amount.toFixed(2);

        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                addFrame: (error, iframe) => {
                    addFrame && addFrame(error, iframe, cancelVerifyCard);
                },
                amount: Number(roundedAmount),
                bin,
                challengeRequested,
                nonce,
                removeFrame,
                onLookupComplete: (_data, next) => {
                    next();
                },
                collectDeviceData: true,
                additionalInformation,
            }),
        );

        return verification.promise;
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
