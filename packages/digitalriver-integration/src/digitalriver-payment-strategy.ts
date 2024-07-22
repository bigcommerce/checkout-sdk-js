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
    private _digitalRiverJS?: DigitalRiverJS;
    private _digitalRiverDropComponent?: DigitalRiverDropIn;
    private _submitFormEvent?: () => void;
    private _loadSuccessResponse?: OnSuccessResponse;
    private _digitalRiverCheckoutData?: DigitalRiverInitializeToken;
    private _unsubscribe?: () => void;
    private _digitalRiverInitializeOptions?: DigitalRiverPaymentInitializeOptions;
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _digitalRiverScriptLoader: DigitalRiverScriptLoader,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithDigitalRiverPaymentInitializeOptions,
    ): Promise<void> {
        this._digitalRiverInitializeOptions = options.digitalriver;

        const paymentMethod = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<DigitalRiverInitializationData>(options.methodId);
        const { publicKey, paymentLanguage: locale } =
            paymentMethod.initializationData as DigitalRiverInitializationData;
        const { containerId } = this._getDigitalRiverInitializeOptions();

        this._digitalRiverJS = await this._digitalRiverScriptLoader.load(publicKey, locale);

        this._unsubscribe = this._paymentIntegrationService.subscribe(
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

                        this._digitalRiverJS = await this._digitalRiverScriptLoader.load(
                            publicKey,
                            locale,
                        );
                    }

                    await this._loadWidget(options);
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

        this._loadWidget(options);
    }

    deinitialize(): Promise<void> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        const { containerId } = this._getDigitalRiverInitializeOptions();
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
        const { isStoreCreditApplied: useStoreCredit } = this._paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        if (!this._digitalRiverCheckoutData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (isVaultedInstrument(paymentData)) {
            try {
                await this._submitVaultedInstrument(
                    methodId,
                    paymentData.instrumentId,
                    this._digitalRiverCheckoutData.checkoutData.checkoutId,
                    shouldSetAsDefaultInstrument,
                    false,
                );
            } catch (error) {
                if (!this._isAuthenticateSourceAction(error)) {
                    throw error;
                }

                const confirm = await this._authenticateSource(error.body.provider_data);

                await this._submitVaultedInstrument(
                    methodId,
                    paymentData.instrumentId,
                    this._digitalRiverCheckoutData.checkoutData.checkoutId,
                    shouldSetAsDefaultInstrument,
                    confirm,
                );
            }
        } else {
            if (!this._loadSuccessResponse) {
                throw new PaymentArgumentInvalidError(['this._loadSuccessResponse']);
            }

            const paymentPayload = {
                methodId: payment.methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: JSON.stringify({
                                checkoutId: this._digitalRiverCheckoutData.checkoutData.checkoutId,
                                source: this._loadSuccessResponse,
                                sessionId: this._digitalRiverCheckoutData.sessionId,
                            }),
                        },
                        vault_payment_instrument: this._loadSuccessResponse.readyForStorage,
                        set_as_default_stored_instrument: false,
                    },
                },
            };

            this._paymentIntegrationService.submitPayment(paymentPayload);
        }
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _getDigitalRiverJs(): DigitalRiverJS {
        if (!this._digitalRiverJS) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._digitalRiverJS;
    }

    private _getErrorMessage(error: OnCancelOrErrorResponse): string {
        const { errors } = error;

        return errors.map((e) => `code: ${e.code} message: ${e.message}`).join('\n');
    }

    private async _onSuccessResponse(data?: OnSuccessResponse): Promise<void> {
        const error = new InvalidArgumentError(
            'Unable to initialize payment because success argument is not provided.',
        );

        if (data && this._submitFormEvent) {
            const { browserInfo, owner } = data.source;

            this._loadSuccessResponse = browserInfo
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

                this._loadSuccessResponse.source.owner = data.source.owner;
                await this._paymentIntegrationService.updateBillingAddress(billingAddressPayPal);
            }

            return this._submitFormEvent();
        }

        return this._getDigitalRiverInitializeOptions().onError?.(error);
    }

    private _onReadyResponse(data?: OnReadyResponse): void {
        if (data) {
            this._getDigitalRiverInitializeOptions().onRenderButton?.();
        }
    }

    private _getDigitalRiverInitializeOptions(): DigitalRiverPaymentInitializeOptions {
        if (!this._digitalRiverInitializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._digitalRiverInitializeOptions;
    }

    private async _loadWidget(
        options: PaymentInitializeOptions,
    ): Promise<PaymentIntegrationSelectors> {
        try {
            const state = await this._paymentIntegrationService.loadPaymentMethod(options.methodId);
            const billing = state.getBillingAddressOrThrow();
            const customer = state.getCustomerOrThrow();
            const { features } = state.getStoreConfigOrThrow().checkoutSettings;
            const { paymentMethodConfiguration } =
                this._getDigitalRiverInitializeOptions().configuration;
            const { containerId, configuration } = this._getDigitalRiverInitializeOptions();
            const { clientToken } = state.getPaymentMethodOrThrow(options.methodId);

            if (!clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this._digitalRiverCheckoutData = JSON.parse(clientToken);

            if (!this._digitalRiverCheckoutData) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this._mountComplianceSection(this._digitalRiverCheckoutData.checkoutData.sellingEntity);

            this._submitFormEvent = this._getDigitalRiverInitializeOptions().onSubmitForm;

            const disabledPaymentMethods = features['PROJECT-4802.digital_river_paypal_support']
                ? []
                : ['payPal'];

            const digitalRiverConfiguration = {
                sessionId: this._digitalRiverCheckoutData.sessionId,
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
                    this._onSuccessResponse(data);
                },
                onReady: (data?: OnReadyResponse) => {
                    this._onReadyResponse(data);
                },
                onError: (error: OnCancelOrErrorResponse) => {
                    const descriptiveError = new Error(this._getErrorMessage(error));

                    this._getDigitalRiverInitializeOptions().onError?.(descriptiveError);
                },
            };

            this._digitalRiverDropComponent =
                this._getDigitalRiverJs().createDropin(digitalRiverConfiguration);
            this._digitalRiverDropComponent.mount(containerId);

            return state;
        } catch {
            throw new DigitalRiverError(
                'payment.digitalriver_checkout_error',
                'digitalRiverCheckoutError',
            );
        }
    }

    private _isAuthenticateSourceAction(error: unknown): boolean {
        return !(
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'additional_action_required' })
        );
    }

    private async _authenticateSource(
        additionalAction: DigitalRiverAdditionalProviderData,
    ): Promise<boolean> {
        if (!this._digitalRiverCheckoutData) {
            throw new InvalidArgumentError(
                'Unable to proceed because payload payment argument is not provided.',
            );
        }

        const authenticateSourceResponse: DigitalRiverAuthenticateSourceResponse =
            await this._getDigitalRiverJs().authenticateSource({
                sessionId: this._digitalRiverCheckoutData.sessionId,
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

    private async _submitVaultedInstrument(
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

        return this._paymentIntegrationService.submitPayment(paymentPayload);
    }

    private _mountComplianceSection(sellingEntity: string) {
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

            const complianceElement = this._getDigitalRiverJs().createElement(
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

            const complianceElement = this._getDigitalRiverJs().createElement(
                'compliance',
                complianceOptions,
            );

            complianceElement.mount('compliance');
        }
    }
}
