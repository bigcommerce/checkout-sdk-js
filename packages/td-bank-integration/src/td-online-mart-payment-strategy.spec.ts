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

describe('TDOnlineMartPaymentStrategy', () => {
    beforeEach(() => {
        tdOnlineMartClient = getTDOnlineMartClient();
        scriptLoader = createScriptLoader();
        tdOnlineScriptLoader = new TDOnlineMartScriptLoader(scriptLoader);
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        tdOnlineMartClientScriptInitializationOptions = {
            methodId: 'tdonlinemart',
        };

        tdOnlineMartPaymentStrategy = new TDOnlineMartPaymentStrategy(
            paymentIntegrationService,
            tdOnlineScriptLoader,
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

        it('fails to execute the td online mart strategy strategy when token is not created', async () => {
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
                            instrumentId:
                                'f73bdf6d8f466f6332f3daca2c5815f20c859cb7f19b9d1f340e4f2a7e18ddce',
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
                            instrumentId:
                                'f73bdf6d8f466f6332f3daca2c5815f20c859cb7f19b9d1f340e4f2a7e18ddce',
                        }),
                    }),
                );
            });

            it('call submitPayment with instrumentId and shouldSetAsDefaultInstrument id if customer want to save instrument', async () => {
                payload = {
                    payment: {
                        methodId: 'tdonlinemart',
                        paymentData: {
                            instrumentId:
                                'f73bdf6d8f466f6332f3daca2c5815f20c859cb7f19b9d1f340e4f2a7e18ddce',
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
                            instrumentId:
                                'f73bdf6d8f466f6332f3daca2c5815f20c859cb7f19b9d1f340e4f2a7e18ddce',
                            shouldSetAsDefaultInstrument: true,
                        }),
                    }),
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
