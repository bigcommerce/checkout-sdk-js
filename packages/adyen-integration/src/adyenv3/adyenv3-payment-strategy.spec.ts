import { createAction } from '@bigcommerce/data-store';
import { createScriptLoader, createStylesheetLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import {
    InvalidArgumentError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentActionType,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentInvalidFormError,
    PaymentMethodCancelledError,
    RequestError,
    SubmitPaymentAction,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCreditCardInstrument,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    AdyenAdditionalActionState,
    AdyenComponent,
    AdyenComponentType,
    AdyenError,
    AdyenPaymentMethodType,
    AdyenV3ComponentState,
    ResultCode,
} from './adyenv3';
import { getAdyenV3 } from './adyenv3-method.mock';
import AdyenV3PaymentStrategy from './adyenv3-payment-strategy';
import AdyenV3ScriptLoader from './adyenv3-script-loader';
import {
    getAdditionalActionError,
    getAdyenClient,
    getAdyenError,
    getBoletoComponentState,
    getComponentState,
    getFailingComponent,
    getInitializeOptions,
    getInitializeOptionsWithNoCallbacks,
    getInitializeOptionsWithUndefinedWidgetSize,
    getOrderRequestBody,
    getOrderRequestBodyWithoutPayment,
    getOrderRequestBodyWithVaultedInstrument,
    getUnknownError,
} from './adyenv3.mock';

describe('AdyenV3PaymentStrategy', () => {
    let adyenV3ScriptLoader: AdyenV3ScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let strategy: AdyenV3PaymentStrategy;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        const stylesheetLoader = createStylesheetLoader();

        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        adyenV3ScriptLoader = new AdyenV3ScriptLoader(scriptLoader, stylesheetLoader);
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new AdyenV3PaymentStrategy(paymentIntegrationService, adyenV3ScriptLoader);

        const mockElement = document.createElement('div');

        jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    });

    describe('#Initializes & Executes', () => {
        let options: PaymentInitializeOptions;
        const adyenCheckout = getAdyenClient();
        let paymentComponent: AdyenComponent;
        let cardVerificationComponent: AdyenComponent;

        beforeEach(() => {
            let handleOnChange: (componentState: AdyenV3ComponentState) => unknown;
            let handleOnError: (componentState: AdyenV3ComponentState) => unknown;

            options = getInitializeOptions();

            paymentComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getComponentState());
                }),
                unmount: jest.fn(),
                submit: jest.fn(),
            };

            cardVerificationComponent = {
                mount: jest.fn(() => {
                    handleOnChange(getComponentState());
                    handleOnError(getComponentState(false));
                }),
                unmount: jest.fn(),
                submit: jest.fn(),
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getAdyenV3());

            jest.spyOn(adyenV3ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenCheckout));

            jest.spyOn(adyenCheckout, 'create').mockImplementation(
                jest.fn((_method, options) => {
                    const { onChange, onError } = options;

                    handleOnChange = onChange;
                    handleOnError = onError;

                    return _method === AdyenComponentType.SecuredFields
                        ? cardVerificationComponent
                        : paymentComponent;
                }),
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        describe('#initialize()', () => {
            it('does not create adyen card verification component', async () => {
                if (options.adyenv3) {
                    options.adyenv3.cardVerificationContainerId = undefined;
                }

                await strategy.initialize(options);

                expect(adyenCheckout.create).toHaveBeenCalledTimes(1);
            });

            it('does not load adyen V3 if initialization options are not provided', () => {
                options.adyenv3 = undefined;

                const response = strategy.initialize(options);

                return expect(response).rejects.toThrow(InvalidArgumentError);
            });

            it('fails mounting scheme payment component', async () => {
                paymentComponent = getFailingComponent();

                await expect(strategy.initialize(options)).rejects.toThrow(NotInitializedError);
            });

            it('fails mounting card verification component', async () => {
                cardVerificationComponent = getFailingComponent();

                await expect(strategy.initialize(options)).rejects.toThrow(NotInitializedError);
            });

            it('fails mounting payment element if container not exist', () => {
                const adyenClient = getAdyenClient();
                const adyenComponent = adyenClient.create('scheme', {});

                jest.spyOn(document, 'getElementById').mockReturnValue(null);

                expect(strategy.initialize(options));
                expect(adyenComponent.mount).not.toHaveBeenCalled();
            });
        });

        describe('#execute', () => {
            const identifyShopperError = getAdditionalActionError(ResultCode.IdentifyShopper);
            const challengeShopperError = getAdditionalActionError(ResultCode.ChallengeShopper);
            let additionalActionComponent: AdyenComponent;

            beforeEach(() => {
                let handleOnAdditionalDetails: (
                    additionalActionState: AdyenAdditionalActionState,
                ) => unknown;

                additionalActionComponent = {
                    mount: jest.fn(() => {
                        handleOnAdditionalDetails({
                            data: {
                                resultCode: ResultCode.ChallengeShopper,
                                action: 'adyenAction',
                            },
                            isValid: true,
                        });
                    }),
                    unmount: jest.fn(),
                    submit: jest.fn(),
                };

                jest.spyOn(adyenCheckout, 'createFromAction').mockImplementation(
                    jest.fn((_type, options) => {
                        const { onAdditionalDetails } = options;

                        handleOnAdditionalDetails = onAdditionalDetails;

                        return additionalActionComponent;
                    }),
                );
            });

            it('throws an error when payment is not present', () => {
                expect(strategy.execute(getOrderRequestBodyWithoutPayment())).rejects.toThrow(
                    PaymentArgumentInvalidError,
                );
            });

            it('throws an error when card fields invalid', async () => {
                const adyenInvalidPaymentComponent = {
                    mount: jest.fn(),
                    unmount: jest.fn(),
                    componentRef: {
                        showValidation: jest.fn(),
                    },
                    state: {
                        isValid: false,
                    },
                    props: {
                        type: 'card',
                    },
                };

                jest.spyOn(adyenCheckout, 'create').mockReturnValue(adyenInvalidPaymentComponent);

                await strategy.initialize(options);

                await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(
                    PaymentInvalidFormError,
                );
                expect(
                    adyenInvalidPaymentComponent.componentRef.showValidation,
                ).toHaveBeenCalledTimes(1);

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(0);
            });

            it('calls submitPayment when paying with vaulted instrument', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );

                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyWithVaultedInstrument());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'scheme',
                        paymentData: {
                            formattedPayload: expect.objectContaining({
                                bigpay_token: {
                                    token: '123',
                                    credit_card_number_confirmation: 'ENCRYPTED_CARD_NUMBER',
                                    verification_value: 'ENCRYPTED_CVV',
                                    expiry_month: 'ENCRYPTED_EXPIRY_MONTH',
                                    expiry_year: 'ENCRYPTED_EXPIRY_YEAR',
                                },
                                origin: 'http://localhost',
                                browser_info: {
                                    color_depth: 24,
                                    java_enabled: false,
                                    language: 'en-US',
                                    screen_height: 0,
                                    screen_width: 0,
                                    time_zone_offset: expect.anything(),
                                },
                            }),
                        },
                    }),
                );
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
            });

            it('calls submitPayment, passing a set as default flag, when paying with a vaulted instrument that should be defaulted', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );

                await strategy.initialize(options);
                await strategy.execute({
                    useStoreCredit: false,
                    payment: {
                        methodId: 'scheme',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                    },
                });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                set_as_default_stored_instrument: true,
                            }),
                        }),
                    }),
                );
            });

            it('calls submitPayment, passing a vault flag, when paying with an instrument that should be vaulted', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );

                await strategy.initialize(options);
                await strategy.execute({
                    payment: {
                        methodId: 'scheme',
                        paymentData: {
                            ...getCreditCardInstrument(),
                            shouldSaveInstrument: true,
                        },
                    },
                });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                vault_payment_instrument: true,
                                set_as_default_stored_instrument: null,
                            }),
                        }),
                    }),
                );
            });

            it('calls submitPayment, passing Boleto data to paymentData', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );
                jest.spyOn(adyenCheckout, 'create').mockImplementation(
                    jest.fn((_method, options) => {
                        const { onChange } = options;

                        const handleOnChange = onChange;

                        paymentComponent = {
                            mount: jest.fn(() => {
                                handleOnChange(getBoletoComponentState());
                            }),
                            unmount: jest.fn(),
                            submit: jest.fn(),
                        };

                        return paymentComponent;
                    }),
                );
                await strategy.initialize(options);
                await strategy.execute({
                    payment: {
                        methodId: 'boletobancario',
                        paymentData: {
                            shouldSaveInstrument: true,
                        },
                    },
                });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                credit_card_token: {
                                    token: JSON.stringify({
                                        socialSecurityNumber:
                                            getBoletoComponentState().data.socialSecurityNumber,
                                        ...getBoletoComponentState().data.shopperName,
                                        type: 'boletobancario',
                                        origin: window.location.origin,
                                    }),
                                },
                            }),
                        }),
                    }),
                );
            });

            it('calls submitPayment, passing both a vault and set as default flag, when paying with an instrument that should be vaulted and defaulted', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );

                await strategy.initialize(options);
                await strategy.execute({
                    payment: {
                        methodId: 'scheme',
                        paymentData: {
                            ...getCreditCardInstrument(),
                            shouldSaveInstrument: true,
                            shouldSetAsDefaultInstrument: true,
                        },
                    },
                });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                vault_payment_instrument: true,
                                set_as_default_stored_instrument: true,
                            }),
                        }),
                    }),
                );
            });

            it('additional action component fires back onError', async () => {
                const adyenError = getAdyenError();
                let handleOnError: (error: AdyenError) => unknown;

                const additionalActionComponentWithError: AdyenComponent = {
                    mount: jest.fn(() => {
                        handleOnError(adyenError);
                    }),
                    unmount: jest.fn(),
                    submit: jest.fn(),
                };

                jest.spyOn(adyenCheckout, 'createFromAction').mockImplementation(
                    jest.fn((_type, options) => {
                        const { onError } = options;

                        handleOnError = onError;

                        return additionalActionComponentWithError;
                    }),
                );
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(identifyShopperError),
                );

                await strategy.initialize(options);

                await expect(strategy.execute(getOrderRequestBody())).rejects.toMatchObject(
                    adyenError,
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('returns 3DS2 ChallengeShopper flow with default widget size', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment')
                    .mockReturnValueOnce(Promise.reject(challengeShopperError))
                    .mockReturnValueOnce(submitPaymentAction);

                options = getInitializeOptionsWithUndefinedWidgetSize();

                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('calls submitPayment, passing a set as default flag, when paying with vaulted account that should be defaulted', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(getAdyenV3(AdyenPaymentMethodType.GiroPay));

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    submitPaymentAction,
                );

                options = getInitializeOptions(true);

                await strategy.initialize(options);
                await strategy.execute({
                    useStoreCredit: false,
                    payment: {
                        methodId: 'giropay',
                        paymentData: { instrumentId: '123', shouldSetAsDefaultInstrument: true },
                    },
                });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        paymentData: expect.objectContaining({
                            formattedPayload: expect.objectContaining({
                                set_as_default_stored_instrument: true,
                            }),
                        }),
                    }),
                );
            });

            it('returns 3DS2 ChallengeShopper flow with no callbacks', async () => {
                jest.spyOn(paymentIntegrationService, 'submitPayment')
                    .mockReturnValueOnce(Promise.reject(challengeShopperError))
                    .mockReturnValueOnce(submitPaymentAction);

                options = getInitializeOptionsWithNoCallbacks();
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBody());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
            });

            it('unmounts additional component when payment fails with challengeShopperError', async () => {
                additionalActionComponent = {
                    mount: jest.fn(),
                    unmount: jest.fn(),
                    submit: jest.fn(),
                };

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                    Promise.reject(challengeShopperError),
                );

                const newOptions = {
                    methodId: 'adyenv3',
                    adyenv3: {
                        containerId: 'adyen-scheme-component-field',
                        cardVerificationContainerId: 'adyen-custom-card-component-field',
                        threeDS2ContainerId: 'adyen-scheme-3ds-component-field',
                        options: {
                            hasHolderName: true,
                            styles: {},
                            placeholders: {},
                        },
                        additionalActionOptions: {
                            containerId: 'adyen-scheme-additional-action-component-field',
                            onBeforeLoad: jest.fn(),
                            onComplete: jest.fn(),
                            onLoad: jest.fn((func) => {
                                func('Cancel');
                            }),
                            widgetSize: '05',
                        },
                        validateCardFields: jest.fn(),
                    },
                };

                await strategy.initialize(newOptions);

                await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(
                    PaymentMethodCancelledError,
                );

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(1);
                expect(additionalActionComponent.unmount).toHaveBeenCalledTimes(1);
            });

            it('prefills holderName with billingAddress data if prefillCardHolderName is true', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...getAdyenV3(),
                    initializationData: {
                        ...getAdyenV3().initializationData,
                        prefillCardHolderName: true,
                    },
                });
                await strategy.initialize(options);

                expect(adyenCheckout.create).toHaveBeenNthCalledWith(
                    1,
                    'scheme',
                    expect.objectContaining({
                        data: {
                            billingAddress: {
                                city: 'Some City',
                                country: 'US',
                                houseNumberOrName: '',
                                postalCode: '95555',
                                stateOrProvince: 'CA',
                                street: '12345 Testing Way',
                            },
                            holderName: 'Test Tester',
                            firstName: 'Test',
                            lastName: 'Tester',
                        },
                    }),
                );
            });

            it('does not prefill holderName with billingAddress data if prefillCardHolderName is false', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue({
                    ...getAdyenV3(),
                    initializationData: {
                        ...getAdyenV3().initializationData,
                        prefillCardHolderName: false,
                    },
                });

                await strategy.initialize(options);

                expect(adyenCheckout.create).toHaveBeenNthCalledWith(
                    1,
                    'scheme',
                    expect.objectContaining({
                        data: {
                            billingAddress: {
                                city: 'Some City',
                                country: 'US',
                                houseNumberOrName: '',
                                postalCode: '95555',
                                stateOrProvince: 'CA',
                                street: '12345 Testing Way',
                            },
                            holderName: '',
                            firstName: '',
                            lastName: '',
                        },
                    }),
                );
            });

            describe('submitPayment fails with identifyShopperError', () => {
                beforeEach(async () => {
                    await strategy.initialize(options);
                });

                it('calls submitPayment when additional action completes', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment')
                        .mockReturnValueOnce(Promise.reject(identifyShopperError))
                        .mockReturnValueOnce(submitPaymentAction);

                    await strategy.execute(getOrderRequestBody());

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                it('returns UNKNOWN_ERROR when submitPayment fails', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment')
                        .mockReturnValueOnce(Promise.reject(identifyShopperError))
                        .mockReturnValueOnce(Promise.reject(getUnknownError()))
                        .mockReturnValue(submitPaymentAction);

                    await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(
                        RequestError,
                    );

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                describe('submitPayment fails with challengeShopperError', () => {
                    it('calls submitPayment when additional action completes', async () => {
                        jest.spyOn(paymentIntegrationService, 'submitPayment')
                            .mockReturnValueOnce(Promise.reject(identifyShopperError))
                            .mockReturnValueOnce(Promise.reject(challengeShopperError))
                            .mockReturnValue(submitPaymentAction);

                        await strategy.execute(getOrderRequestBody());

                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(3);
                        expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                        expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(2);
                    });

                    it('returns UNKNOWN_ERROR when submitPayment fails', async () => {
                        jest.spyOn(paymentIntegrationService, 'submitPayment')
                            .mockReturnValueOnce(Promise.reject(identifyShopperError))
                            .mockReturnValueOnce(Promise.reject(challengeShopperError))
                            .mockReturnValue(Promise.reject(getUnknownError()));

                        await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(
                            RequestError,
                        );

                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(3);
                        expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                        expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(2);
                    });
                });
            });

            describe('submitPayment fails with challengeShopperError', () => {
                beforeEach(async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        Promise.reject(challengeShopperError),
                    );

                    await strategy.initialize(options);
                });

                it('calls submitPayment when additional action completes', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
                        submitPaymentAction,
                    );

                    await strategy.execute(getOrderRequestBody());

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });

                it('returns UNKNOWN_ERROR when submitPayment fails', async () => {
                    jest.spyOn(paymentIntegrationService, 'submitPayment')
                        .mockReturnValueOnce(Promise.reject(getUnknownError()))
                        .mockReturnValueOnce(submitPaymentAction);

                    await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(
                        RequestError,
                    );

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.create).toHaveBeenCalledTimes(2);
                    expect(adyenCheckout.createFromAction).toHaveBeenCalledTimes(1);
                });
            });
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getAdyenV3());
        });

        it('deinitialize adyen payment strategy', async () => {
            const adyenClient = getAdyenClient();
            const adyenComponent = adyenClient.create('scheme', {});

            jest.spyOn(adyenV3ScriptLoader, 'load').mockReturnValue(Promise.resolve(adyenClient));
            jest.spyOn(adyenClient, 'create').mockReturnValue(adyenComponent);

            await strategy.initialize(getInitializeOptions());

            const promise = strategy.deinitialize();

            expect(adyenComponent.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe();
        });

        it('does not unmount when adyen component is not available', () => {
            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe();
        });
    });
});
