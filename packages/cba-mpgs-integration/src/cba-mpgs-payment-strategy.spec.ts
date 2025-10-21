import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import {
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentStatusTypes,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    getErrorPaymentResponseBody,
    getOrder,
    getOrderRequestBody,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { ThreeDSjs } from './cba-mpgs';
import CBAMPGSPaymentStrategy from './cba-mpgs-payment-strategy';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';
import { getCBAMPGS, getCBAMPGSScriptMock, getCBAMPGSScriptMockRetryOnly } from './cba-mpgs.mock';

describe('CBAMPGSPaymentStrategy', () => {
    let scriptLoader: ScriptLoader;
    let cbaMPGSScriptLoader: CBAMPGSScriptLoader;
    let threeDSjs: ThreeDSjs;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let strategy: CBAMPGSPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        scriptLoader = createScriptLoader();
        threeDSjs = getCBAMPGSScriptMock();

        cbaMPGSScriptLoader = new CBAMPGSScriptLoader(scriptLoader);

        strategy = new CBAMPGSPaymentStrategy(paymentIntegrationService, cbaMPGSScriptLoader);

        paymentMethod = getCBAMPGS();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
            paymentIntegrationService.getState(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue(getOrder());
        jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(threeDSjs);
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue({
            locale: 'en_US',
        } as any);
        jest.useFakeTimers();
    });

    describe('#initialize', () => {
        it('should initialize the base strategy if 3ds is disabled', async () => {
            paymentMethod.config.is3dsEnabled = false;
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).not.toHaveBeenCalled();
        });

        it('should initialize the strategy and load ThreeDSjs script if 3ds is enabled', async () => {
            const configurePayload = {
                merchantId: paymentMethod.initializationData.merchantId,
                sessionId: expect.any(String),
                callback: expect.any(Function),
                configuration: {
                    userLanguage: { locale: 'en_US' },
                    wsVersion: 62,
                },
            };

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalled();
            expect(threeDSjs.configure).toHaveBeenCalledWith(configurePayload);
            expect(threeDSjs.isConfigured).toHaveBeenCalled();
        });

        it('should initialize in production mode if isTestModeFlagEnabled is false', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(false);
        });

        it('should initialize in sandbox mode if isTestModeFlagEnabled is true', async () => {
            paymentMethod.initializationData.isTestModeFlagEnabled = true;
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(true);
        });

        it('should throw NotInitializedError if script fails to load', async () => {
            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(undefined as any);

            await expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                NotInitializedError,
            );
        });

        it('should throw MissingDataError if clientToken missing', async () => {
            paymentMethod.clientToken = undefined;

            await expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                MissingDataError,
            );
        });

        it('should throw PaymentMethodFailedError if configure fails', async () => {
            const badMock = getCBAMPGSScriptMock(false);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(badMock);

            await expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                PaymentMethodFailedError,
            );
        });
    });

    describe('#execute', () => {
        beforeEach(async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {
                        acs_url: null,
                        payer_auth_request: null,
                        merchant_data: null,
                        callback_url: null,
                        token: 'session-id-uuid',
                    },
                    status: 'error',
                }),
            );

            (paymentIntegrationService.submitPayment as jest.Mock).mockRejectedValue(error);

            await strategy.initialize({ methodId: paymentMethod.id });
        });

        it('should execute base strategy if 3ds disabled', async () => {
            paymentMethod.config.is3dsEnabled = false;
            (paymentIntegrationService.submitPayment as jest.Mock).mockResolvedValue({});

            await strategy.initialize({ methodId: paymentMethod.id });
            await strategy.execute(payload);

            expect(threeDSjs.initiateAuthentication).not.toHaveBeenCalled();
        });

        it('should fail if payment data missing', async () => {
            payload.payment = undefined as any;

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('should execute and trigger 3DS successfully', async () => {
            const threeDSMock = getCBAMPGSScriptMock();

            strategy['threeDSjs'] = threeDSMock;

            strategy['authenticatePayer'] = jest.fn().mockResolvedValue(undefined);

            await strategy.execute(payload);

            const orderId = `${getConfig().storeConfig.storeProfile.storeId}_${getOrder().orderId}`;

            expect(strategy['threeDSjs'].initiateAuthentication).toHaveBeenCalledWith(
                orderId,
                'session-id-uuid',
                expect.any(Function),
            );

            expect(strategy['authenticatePayer']).toHaveBeenCalledWith(orderId, 'session-id-uuid');
        });

        it('should reject with RequestError if 3ds result missing token', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: { token: undefined },
                    status: 'error',
                }),
            );

            (paymentIntegrationService.submitPayment as jest.Mock).mockRejectedValue(error);

            await expect(strategy.execute(payload)).rejects.toThrow(RequestError);
        });

        it('should reject if non-3ds error occurs', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'gateway_error' }],
                    status: 'error',
                }),
            );

            (paymentIntegrationService.submitPayment as jest.Mock).mockRejectedValue(error);

            await expect(strategy.execute(payload)).rejects.toThrow(RequestError);
        });

        it('should retry to authenticate payer if server is busy', async () => {
            threeDSjs = getCBAMPGSScriptMock(true, true, true, true, false, true, true);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValueOnce(threeDSjs);

            await strategy.initialize({ methodId: paymentMethod.id });

            strategy.execute(payload);

            const expectedTimes = 2;

            for (let i = 0; i < expectedTimes; i++) {
                await new Promise((resolve) => process.nextTick(resolve));
                jest.runAllTimers();
            }

            expect(threeDSjs.initiateAuthentication).toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).toHaveBeenCalledTimes(expectedTimes);
        });

        it('should retry up to 5 times to authenticate payer if server is busy', async () => {
            threeDSjs = getCBAMPGSScriptMockRetryOnly(true, true, true, true, false, true, true);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValueOnce(threeDSjs);

            await strategy.initialize({ methodId: paymentMethod.id });

            // eslint-disable-next-line jest/valid-expect
            expect(strategy.execute(payload)).rejects.toThrow(Error);

            const expectedTimes = 5;

            for (let i = 0; i < expectedTimes; i++) {
                await new Promise((resolve) => process.nextTick(resolve));
                jest.runAllTimers();
            }

            expect(threeDSjs.initiateAuthentication).toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).toHaveBeenCalledTimes(expectedTimes);
        });
    });

    describe('#finalize', () => {
        it('finalizes order if created and status is FINALIZE', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue(
                getOrder(),
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                PaymentStatusTypes.FINALIZE,
            );

            await strategy.finalize();

            expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalled();
        });

        it('throws if not FINALIZE', async () => {
            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getPaymentStatus').mockReturnValue(PaymentStatusTypes.INITIALIZE);

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });

        it('throws if order missing', async () => {
            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getOrder').mockReturnValue(null as any);

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes correctly', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });

            await expect(strategy.deinitialize()).resolves.toBeUndefined();
        });
    });
});
