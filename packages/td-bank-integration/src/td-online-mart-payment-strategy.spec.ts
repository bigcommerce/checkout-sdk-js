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
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

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

        payload = {
            payment: {
                methodId: 'tdonlinemart',
            },
        };

        tdOnlineMartClient.create(FieldType.CARD_NUMBER);

        tdOnlineMartClient.createToken = jest.fn((callback) => {
            callback({
                token: 'c49-70ef7c47-742e-465c-9290-f6a07b60c024',
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
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
    });

    describe('execute', () => {
        it('successfully executes the td online mart strategy and submits payment when using td online mart strategy client', async () => {
            await tdOnlineMartPaymentStrategy.initialize(
                tdOnlineMartClientScriptInitializationOptions,
            );
            await tdOnlineMartPaymentStrategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
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
                        paymentData: expect.objectContaining({
                            instrumentId: 'testInstrumentId',
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
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        three_ds_result: {
                            formUrl: 'https://example.com',
                            threeDSSessionData: '3ds_session_data',
                            creq: 'creq_data',
                        },
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
    });
});
