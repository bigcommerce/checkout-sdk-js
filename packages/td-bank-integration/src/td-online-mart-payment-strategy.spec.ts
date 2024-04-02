import { FormPoster } from '@bigcommerce/form-poster';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    MissingDataError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getInstruments,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import * as TdOnlineMartAdditionalAction from './isTdOnlineMartAdditionalAction';
import { FieldType, TDCustomCheckoutSDK } from './td-online-mart';
import TDOnlineMartPaymentStrategy from './td-online-mart-payment-strategy';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';
import { getTDOnlineMartClient } from './td-online-mart.mock';

let payload: OrderRequestBody;
let scriptLoader: ScriptLoader;
let tdOnlineScriptLoader: TDOnlineMartScriptLoader;
let tdOnlineMartPaymentStrategy: TDOnlineMartPaymentStrategy;
let paymentIntegrationService: PaymentIntegrationService;
let tdOnlineMartClient: TDCustomCheckoutSDK;
let tdOnlineMartClientScriptInitializationOptions: PaymentInitializeOptions;
let formPoster: FormPoster;

describe('TDOnlineMartPaymentStrategy', () => {
    const containers: Array<{
        id: string;
        element?: HTMLDivElement;
    }> = [
        { id: 'tdonlinemart-ccNumber' },
        { id: 'tdonlinemart-ccCvv' },
        { id: 'tdonlinemart-ccExpiry' },
    ];
    const createInputContainers = (elementContainers = containers) => {
        elementContainers.forEach((container) => {
            container.element = document.createElement('div');
            container.element.setAttribute('id', container.id);
            document.body.appendChild(container.element);
        });
    };
    const removeInputContainers = () => {
        containers.forEach((container) => {
            if (!container.element) {
                return;
            }

            document.body.removeChild(container.element);
            container.element = undefined;
        });
    };

    beforeEach(() => {
        tdOnlineMartClient = getTDOnlineMartClient();
        scriptLoader = createScriptLoader();
        tdOnlineScriptLoader = new TDOnlineMartScriptLoader(scriptLoader);
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        tdOnlineMartClientScriptInitializationOptions = {
            methodId: 'tdonlinemart',
        };
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        formPoster = {
            postForm: jest.fn(),
        } as unknown as FormPoster;

        tdOnlineMartPaymentStrategy = new TDOnlineMartPaymentStrategy(
            paymentIntegrationService,
            tdOnlineScriptLoader,
            formPoster,
        );

        jest.spyOn(tdOnlineScriptLoader, 'load').mockImplementation(() =>
            Promise.resolve(tdOnlineMartClient),
        );

        const defaultPaymentInstrument = {
            ...getInstruments()[0],
            provider: 'tdonlinemart',
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getInstruments').mockReturnValue([
            {
                ...defaultPaymentInstrument,
                bigpayToken: 'testInstrumentId',
                trustedShippingAddress: true,
            },
            {
                ...defaultPaymentInstrument,
                bigpayToken: 'testInstrumentId-trusted-false',
                trustedShippingAddress: false,
            },
        ]);

        payload = {
            payment: {
                methodId: 'tdonlinemart',
            },
        };

        tdOnlineMartClient.create(FieldType.CARD_NUMBER);

        tdOnlineMartClient.createToken = jest.fn((callback) => {
            callback({
                token: 'td-online-mart-token',
            });
        });

        createInputContainers();
    });

    afterEach(() => {
        jest.clearAllMocks();

        removeInputContainers();
    });

    describe('initialize', () => {
        it('successfully initializes the td bank online mart strategy and loads the client', async () => {
            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            expect(tdOnlineScriptLoader.load).toHaveBeenCalled();
        });

        it('fails to initialize the td online mart strategy and load bolt embedded script if method id is not provided', async () => {
            tdOnlineMartClientScriptInitializationOptions = {
                methodId: '',
            };

            await expect(
                tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                ),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('mounts td online mart inputs', async () => {
            const unmountMock = jest.fn();
            const mountMock = jest.fn();

            tdOnlineMartClient = getTDOnlineMartClient({ mount: mountMock, unmount: unmountMock });

            jest.spyOn(tdOnlineScriptLoader, 'load').mockImplementation(() =>
                Promise.resolve(tdOnlineMartClient),
            );

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            expect(tdOnlineMartClient.create).toHaveBeenCalled();
            expect(mountMock).toHaveBeenCalledTimes(3);
        });

        it('mounts td online mart inputs if only one container exist', async () => {
            const unmountMock = jest.fn();
            const mountMock = jest.fn();

            removeInputContainers();
            createInputContainers([containers[0]]);

            tdOnlineMartClient = getTDOnlineMartClient({ mount: mountMock, unmount: unmountMock });

            jest.spyOn(tdOnlineScriptLoader, 'load').mockImplementation(() =>
                Promise.resolve(tdOnlineMartClient),
            );

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            expect(tdOnlineMartClient.create).toHaveBeenCalled();
            expect(mountMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('execute', () => {
        it('successfully executes the td online mart strategy and submits payment when using td online mart strategy client', async () => {
            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );
            await tdOnlineMartPaymentStrategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'tdonlinemart',
                paymentData: expect.objectContaining({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    browser_info: expect.objectContaining({
                        color_depth: expect.any(Number),
                        java_enabled: expect.any(Boolean),
                        language: expect.any(String),
                        screen_height: expect.any(Number),
                        screen_width: expect.any(Number),
                        time_zone_offset: expect.any(String),
                    }),
                    shouldSaveInstrument: false,
                    nonce: 'td-online-mart-token',
                    /* eslint-enable @typescript-eslint/naming-convention */
                }),
            });
        });

        it('successfully executes the td online mart strategy with instrument saving', async () => {
            const executePayload: OrderRequestBody = {
                ...payload,
                payment: {
                    methodId: 'tdonlinemart',
                    paymentData: {
                        shouldSaveInstrument: true,
                    },
                },
            };

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );
            await tdOnlineMartPaymentStrategy.execute(executePayload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'tdonlinemart',
                paymentData: expect.objectContaining({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    browser_info: expect.any(Object),
                    shouldSaveInstrument: true,
                    nonce: 'td-online-mart-token',
                    /* eslint-enable @typescript-eslint/naming-convention */
                }),
            });
        });

        it('fails to execute the td online mart strategy strategy if no payment is provided when using td online mart strategy client', async () => {
            payload = {};

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await expect(tdOnlineMartPaymentStrategy.execute(payload)).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the td online mart strategy when token is not created', async () => {
            tdOnlineMartClient.createToken = jest.fn((callback) => {
                callback({
                    token: '',
                });
            });

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await expect(tdOnlineMartPaymentStrategy.execute(payload)).rejects.toThrow(
                MissingDataError,
            );

            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the td online mart strategy when token is not created and we getting error message', async () => {
            tdOnlineMartClient.createToken = jest.fn((callback) => {
                callback({
                    error: {
                        message: 'error occurs',
                    },
                });
            });

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await expect(tdOnlineMartPaymentStrategy.execute(payload)).rejects.toThrow(Error);

            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no method id is provided with checkout takeover', async () => {
            payload.payment = {
                methodId: '',
            };

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await expect(tdOnlineMartPaymentStrategy.execute(payload)).rejects.toThrow(
                MissingDataError,
            );

            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        describe('with Vaulted Instruments', () => {
            it('call submitPayment with instrument id', async () => {
                payload = {
                    payment: {
                        methodId: 'tdonlinemart',
                        paymentData: {
                            instrumentId: 'testInstrumentId',
                        },
                    },
                };

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );

                await tdOnlineMartPaymentStrategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        methodId: 'tdonlinemart',
                        paymentData: {
                            instrumentId: 'testInstrumentId',
                            shouldSaveInstrument: false,
                            shouldSetAsDefaultInstrument: false,
                            /* eslint-disable @typescript-eslint/naming-convention */
                            browser_info: expect.objectContaining({
                                color_depth: expect.any(Number),
                                java_enabled: expect.any(Boolean),
                                language: expect.any(String),
                                screen_height: expect.any(Number),
                                screen_width: expect.any(Number),
                                time_zone_offset: expect.any(String),
                            }),
                            /* eslint-enable @typescript-eslint/naming-convention */
                        },
                    }),
                );
            });

            it('call submitPayment with untrusted instrument', async () => {
                payload = {
                    payment: {
                        methodId: 'tdonlinemart',
                        paymentData: {
                            instrumentId: 'testInstrumentId-trusted-false',
                        },
                    },
                };

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );

                await tdOnlineMartPaymentStrategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        methodId: 'tdonlinemart',
                        paymentData: expect.objectContaining({
                            instrumentId: 'testInstrumentId-trusted-false',
                            nonce: 'testInstrumentId-trusted-false',
                        }),
                    }),
                );
            });

            it('call submitPayment with instrumentId and shouldSetAsDefaultInstrument id if customer want to save instrument', async () => {
                payload = {
                    payment: {
                        methodId: 'tdonlinemart',
                        paymentData: {
                            instrumentId: 'testInstrumentId',
                            shouldSetAsDefaultInstrument: true,
                        },
                    },
                };

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );

                await tdOnlineMartPaymentStrategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).toHaveBeenNthCalledWith(
                    1,
                    expect.objectContaining({
                        methodId: 'tdonlinemart',
                        paymentData: expect.objectContaining({
                            instrumentId: 'testInstrumentId',
                            shouldSetAsDefaultInstrument: true,
                            /* eslint-disable @typescript-eslint/naming-convention */
                            browser_info: expect.objectContaining({
                                color_depth: expect.any(Number),
                                java_enabled: expect.any(Boolean),
                                language: expect.any(String),
                                screen_height: expect.any(Number),
                                screen_width: expect.any(Number),
                                time_zone_offset: expect.any(String),
                            }),
                            /* eslint-enable @typescript-eslint/naming-convention */
                        }),
                    }),
                );
            });
        });

        describe('execute with additional actions', () => {
            it('throw not additional action error', async () => {
                let submitPaymentError;

                jest.spyOn(
                    TdOnlineMartAdditionalAction,
                    'isTdOnlineMartAdditionalAction',
                ).mockReturnValue(false);
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
                    message: 'any_error',
                });

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );

                try {
                    await tdOnlineMartPaymentStrategy.execute(payload);
                } catch (error) {
                    submitPaymentError = error;
                } finally {
                    expect(submitPaymentError).toEqual({ message: 'any_error' });
                }
            });

            it('throw error when not enough 3DS data', async () => {
                let submitPaymentError;

                jest.spyOn(
                    TdOnlineMartAdditionalAction,
                    'isTdOnlineMartAdditionalAction',
                ).mockReturnValue(true);
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
                    body: {
                        errors: [
                            {
                                code: 'three_ds_result',
                            },
                        ],
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        three_ds_result: {},
                    },
                });

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );

                try {
                    await tdOnlineMartPaymentStrategy.execute(payload);
                } catch (error) {
                    submitPaymentError = error;
                } finally {
                    expect(submitPaymentError).toBeInstanceOf(PaymentArgumentInvalidError);
                }
            });

            it('execute 3DS challenge', async () => {
                const postFormMock = jest.fn((_url, _options, resolveFn) =>
                    Promise.resolve(resolveFn()),
                );

                jest.spyOn(formPoster, 'postForm').mockImplementation(postFormMock);
                jest.spyOn(
                    TdOnlineMartAdditionalAction,
                    'isTdOnlineMartAdditionalAction',
                ).mockReturnValue(true);
                jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
                    body: {
                        errors: [
                            {
                                code: 'three_ds_result',
                            },
                        ],
                        /* eslint-disable @typescript-eslint/naming-convention */
                        three_ds_result: {
                            acs_url: 'https://example.com',
                            payer_auth_request: '3ds_session_data',
                            merchant_data: 'creq_data',
                        },
                        /* eslint-enable @typescript-eslint/naming-convention */
                    },
                });

                await tdOnlineMartPaymentStrategy.initialize(
                    tdOnlineMartClientScriptInitializationOptions,
                );
                await tdOnlineMartPaymentStrategy.execute(payload);

                expect(postFormMock).toHaveBeenCalledWith(
                    'https://example.com',
                    {
                        threeDSSessionData: '3ds_session_data',
                        creq: 'creq_data',
                    },
                    expect.any(Function),
                    '_top',
                );
            });
        });
    });

    describe('deinitialize', () => {
        it('unmount td online mart hosted fields', async () => {
            const unmountMock = jest.fn();
            const mountMock = jest.fn();

            tdOnlineMartClient = getTDOnlineMartClient({ mount: mountMock, unmount: unmountMock });
            jest.spyOn(tdOnlineScriptLoader, 'load').mockImplementation(() =>
                Promise.resolve(tdOnlineMartClient),
            );

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await tdOnlineMartPaymentStrategy.deinitialize();

            expect(unmountMock).toHaveBeenCalledTimes(3);
        });

        it('unmount only existing td online mart hosted fields', async () => {
            const unmountMock = jest.fn();
            const mountMock = jest.fn();

            removeInputContainers();
            createInputContainers([containers[0]]);

            tdOnlineMartClient = getTDOnlineMartClient({ mount: mountMock, unmount: unmountMock });
            jest.spyOn(tdOnlineScriptLoader, 'load').mockImplementation(() =>
                Promise.resolve(tdOnlineMartClient),
            );

            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );

            await tdOnlineMartPaymentStrategy.deinitialize();

            expect(unmountMock).toHaveBeenCalledTimes(1);
        });
    });
});
