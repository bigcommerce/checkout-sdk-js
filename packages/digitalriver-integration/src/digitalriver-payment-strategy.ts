import { some } from 'lodash';
import {
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import DigitalRiverJS, {
    AuthenticationSourceStatus,
    DigitalRiverAdditionalProviderData,
    DigitalRiverAuthenticateSourceResponse,
    DigitalRiverDropIn,
    DigitalRiverElementOptions,
    DigitalRiverInitializationData,
    DigitalRiverInitializeToken,
    OnCancelOrErrorResponse,
    OnReadyResponse,
    OnSuccessResponse,
} from './digitalriver';
import DigitalRiverError from './digitalriver-error';
import DigitalRiverPaymentInitializeOptions, {
    WithDigitalRiverPaymentInitializeOptions,
} from './digitalriver-payment-initialize-options';
import DigitalRiverScriptLoader from './digitalriver-script-loader';

export default class DigitalRiverPaymentStrategy implements PaymentStrategy {
    private digitalRiverJS?: DigitalRiverJS;
    private digitalRiverDropComponent?: DigitalRiverDropIn;
    private submitFormEvent?: () => void;
    private loadSuccessResponse?: OnSuccessResponse;
    private digitalRiverCheckoutData?: DigitalRiverInitializeToken;
    private unsubscribe?: () => void;
    private digitalRiverInitializeOptions?: DigitalRiverPaymentInitializeOptions;
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private digitalRiverScriptLoader: DigitalRiverScriptLoader,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithDigitalRiverPaymentInitializeOptions,
    ): Promise<void> {
        this.digitalRiverInitializeOptions = options.digitalriver;

        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<DigitalRiverInitializationData>(options.methodId);
        const { publicKey, paymentLanguage: locale } =
            paymentMethod.initializationData as DigitalRiverInitializationData;
        const { containerId } = this.getDigitalRiverInitializeOptions();

        this.digitalRiverJS = await this.digitalRiverScriptLoader.load(publicKey, locale);

        this.unsubscribe = this.paymentIntegrationService.subscribe(
            async (state) => {
                if (
                    state.isPaymentMethodInitialized({
                        methodId: options.methodId,
                        gatewayId: options.gatewayId,
                    })
                ) {
                    const container = document.getElementById(containerId);

                    if (container) {
                        container.innerHTML = '';

                        this.digitalRiverJS = await this.digitalRiverScriptLoader.load(
                            publicKey,
                            locale,
                        );
                    }

                    await this.loadWidget(options);
                }
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.coupons;
            },
        );

        this.loadWidget(options);
    }

    deinitialize(): Promise<void> {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        const { containerId } = this.getDigitalRiverInitializeOptions();
        const container = document.getElementById(containerId);

        if (container) {
            container.innerHTML = '';
        }

        return Promise.resolve();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = orderRequest;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentData, methodId } = payment;
        const { shouldSetAsDefaultInstrument = false } = isHostedInstrumentLike(paymentData)
            ? paymentData
            : {};
        const { isStoreCreditApplied: useStoreCredit } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        if (!this.digitalRiverCheckoutData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (isVaultedInstrument(paymentData)) {
            try {
                await this.submitVaultedInstrument(
                    methodId,
                    paymentData.instrumentId,
                    this.digitalRiverCheckoutData.checkoutData.checkoutId,
                    shouldSetAsDefaultInstrument,
                    false,
                );
            } catch (error) {
                if (!this.isAuthenticateSourceAction(error)) {
                    throw error;
                }

                const confirm = await this.authenticateSource(error.body.provider_data);

                await this.submitVaultedInstrument(
                    methodId,
                    paymentData.instrumentId,
                    this.digitalRiverCheckoutData.checkoutData.checkoutId,
                    shouldSetAsDefaultInstrument,
                    confirm,
                );
            }
        } else {
            if (!this.loadSuccessResponse) {
                throw new PaymentArgumentInvalidError(['this.loadSuccessResponse']);
            }

            const paymentPayload = {
                methodId: payment.methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: JSON.stringify({
                                checkoutId: this.digitalRiverCheckoutData.checkoutData.checkoutId,
                                source: this.loadSuccessResponse,
                                sessionId: this.digitalRiverCheckoutData.sessionId,
                            }),
                        },
                        vault_payment_instrument: this.loadSuccessResponse.readyForStorage,
                        set_as_default_stored_instrument: false,
                    },
                },
            };

            this.paymentIntegrationService.submitPayment(paymentPayload);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private getDigitalRiverJs(): DigitalRiverJS {
        if (!this.digitalRiverJS) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.digitalRiverJS;
    }

    private getErrorMessage(error: OnCancelOrErrorResponse): string {
        const { errors } = error;

        return errors.map((e) => `code: ${e.code} message: ${e.message}`).join('\n');
    }

    private async onSuccessResponse(data?: OnSuccessResponse): Promise<void> {
        const error = new InvalidArgumentError(
            'Unable to initialize payment because success argument is not provided.',
        );

        if (data && this.submitFormEvent) {
            const { browserInfo, owner } = data.source;

            this.loadSuccessResponse = browserInfo
                ? {
                      source: {
                          id: data.source.id,
                          reusable: data.source.reusable,
                          ...browserInfo,
                      },
                      readyForStorage: data.readyForStorage,
                  }
                : {
                      source: {
                          id: data.source.id,
                          reusable: data.source.reusable,
                      },
                      readyForStorage: data.readyForStorage,
                  };

            if (owner) {
                const billingAddressPayPal = {
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                    city: owner.address.city,
                    company: '',
                    address1: owner.address.line1,
                    address2: '',
                    postalCode: owner.address.postalCode,
                    countryCode: owner.address.country,
                    phone: owner.phoneNumber,
                    stateOrProvince: owner.address.state,
                    stateOrProvinceCode: owner.address.country,
                    customFields: [],
                    email: owner.email || owner.email,
                };

                this.loadSuccessResponse.source.owner = data.source.owner;
                await this.paymentIntegrationService.updateBillingAddress(billingAddressPayPal);
            }

            return this.submitFormEvent();
        }

        return this.getDigitalRiverInitializeOptions().onError?.(error);
    }

    private onReadyResponse(data?: OnReadyResponse): void {
        if (data) {
            this.getDigitalRiverInitializeOptions().onRenderButton?.();
        }
    }

    private getDigitalRiverInitializeOptions(): DigitalRiverPaymentInitializeOptions {
        if (!this.digitalRiverInitializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.digitalRiverInitializeOptions;
    }

    private async loadWidget(
        options: PaymentInitializeOptions,
    ): Promise<PaymentIntegrationSelectors> {
        try {
            const state = await this.paymentIntegrationService.loadPaymentMethod(options.methodId);
            const billing = state.getBillingAddressOrThrow();
            const customer = state.getCustomerOrThrow();
            const { features } = state.getStoreConfigOrThrow().checkoutSettings;
            const { paymentMethodConfiguration } =
                this.getDigitalRiverInitializeOptions().configuration;
            const { containerId, configuration } = this.getDigitalRiverInitializeOptions();
            const { clientToken } = state.getPaymentMethodOrThrow(options.methodId);

            if (!clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this.digitalRiverCheckoutData = JSON.parse(clientToken);

            if (!this.digitalRiverCheckoutData) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this.mountComplianceSection(this.digitalRiverCheckoutData.checkoutData.sellingEntity);

            this.submitFormEvent = this.getDigitalRiverInitializeOptions().onSubmitForm;

            const disabledPaymentMethods = features['PROJECT-4802.digital_river_paypal_support']
                ? []
                : ['payPal'];

            const digitalRiverConfiguration = {
                sessionId: this.digitalRiverCheckoutData.sessionId,
                options: {
                    ...configuration,
                    showSavePaymentAgreement:
                        Boolean(customer.email) && configuration.showSavePaymentAgreement,
                },
                billingAddress: {
                    firstName: billing.firstName,
                    lastName: billing.lastName,
                    email: billing.email || customer.email,
                    phoneNumber: billing.phone,
                    address: {
                        line1: billing.address1,
                        line2: billing.address2,
                        city: billing.city,
                        state: billing.stateOrProvinceCode,
                        postalCode: billing.postalCode,
                        country: billing.countryCode,
                    },
                },
                paymentMethodConfiguration: {
                    ...paymentMethodConfiguration,
                    disabledPaymentMethods,
                },
                onSuccess: (data?: OnSuccessResponse) => {
                    this.onSuccessResponse(data);
                },
                onReady: (data?: OnReadyResponse) => {
                    this.onReadyResponse(data);
                },
                onError: (error: OnCancelOrErrorResponse) => {
                    const descriptiveError = new Error(this.getErrorMessage(error));

                    this.getDigitalRiverInitializeOptions().onError?.(descriptiveError);
                },
            };

            this.digitalRiverDropComponent =
                this.getDigitalRiverJs().createDropin(digitalRiverConfiguration);
            this.digitalRiverDropComponent.mount(containerId);

            return state;
        } catch {
            throw new DigitalRiverError(
                'payment.digitalriver_checkout_error',
                'digitalRiverCheckoutError',
            );
        }
    }

    private isAuthenticateSourceAction(error: unknown): boolean {
        return !(
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        );
    }

    private async authenticateSource(
        additionalAction: DigitalRiverAdditionalProviderData,
    ): Promise<boolean> {
        if (!this.digitalRiverCheckoutData) {
            throw new InvalidArgumentError(
                'Unable to proceed because payload payment argument is not provided.',
            );
        }

        const authenticateSourceResponse: DigitalRiverAuthenticateSourceResponse =
            await this.getDigitalRiverJs().authenticateSource({
                sessionId: this.digitalRiverCheckoutData.sessionId,
                sourceId: additionalAction.source_id,
                sourceClientSecret: additionalAction.source_client_secret,
            });

        if (authenticateSourceResponse.status === AuthenticationSourceStatus.failed) {
            throw new Error('Source authentication failed, please try again');
        }

        return (
            authenticateSourceResponse.status === AuthenticationSourceStatus.complete ||
            authenticateSourceResponse.status ===
                AuthenticationSourceStatus.authentication_not_required
        );
    }

    private async submitVaultedInstrument(
        methodId: string,
        instrumentId: string,
        checkoutId: string,
        shouldSetAsDefaultInstrument: boolean,
        confirm: boolean,
    ): Promise<PaymentIntegrationSelectors> {
        const paymentPayload = {
            methodId,
            paymentData: {
                formattedPayload: {
                    bigpay_token: {
                        token: instrumentId,
                    },
                    credit_card_token: {
                        token: JSON.stringify({
                            checkoutId,
                        }),
                    },
                    confirm,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                },
            },
        };

        return this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    private mountComplianceSection(sellingEntity: string) {
        const complianceDiv = document.getElementById('compliance');

        const complianceOptions: DigitalRiverElementOptions = {
            classes: {
                base: 'DRElement',
            },
            compliance: {
                entity: sellingEntity,
            },
        };

        if (complianceDiv) {
            complianceDiv.innerHTML = '';

            const complianceElement = this.getDigitalRiverJs().createElement(
                'compliance',
                complianceOptions,
            );

            complianceElement.mount('compliance');
        } else {
            const drfooter = document.createElement('div');

            drfooter.setAttribute('id', 'compliance');
            drfooter.style.cssText = 'min-height: 45px;';
            drfooter.classList.add('layout');
            document.body.appendChild(drfooter);

            const complianceElement = this.getDigitalRiverJs().createElement(
                'compliance',
                complianceOptions,
            );

            complianceElement.mount('compliance');
        }
    }
}
