import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { Observable, of } from 'rxjs';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfig } from '../../../config/configs.mock';
import { HostedFormFactory } from '../../../hosted-form';
import {
    FinalizeOrderAction,
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getOrder } from '../../../order/orders.mock';
import { PaymentMethodActionCreator } from '../../../payment';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError, PaymentMethodDeclinedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getCBAMPGS } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import * as paymentStatusTypes from '../../payment-status-types';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { ThreeDSjs } from './cba-mpgs';
import { getCBAMPGSScriptMock, getCBAMPGSScriptMockRetryOnly } from './cba-mpgs.mock';

import { CBAMPGSPaymentStrategy, CBAMPGSScriptLoader } from './';

// TODO: CHECKOUT-7766
describe('CBAMPGSPaymentStrategy', () => {
    let scriptLoader: ScriptLoader;
    let cbaMPGSScriptLoader: CBAMPGSScriptLoader;
    let threeDSjs: ThreeDSjs;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let orderRequestSender: OrderRequestSender;
    let payload: OrderRequestBody;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CBAMPGSPaymentStrategy;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        store = createCheckoutStore();
        requestSender = createRequestSender();
        scriptLoader = createScriptLoader();
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        threeDSjs = getCBAMPGSScriptMock();

        cbaMPGSScriptLoader = new CBAMPGSScriptLoader(scriptLoader);

        strategy = new CBAMPGSPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            new HostedFormFactory(store),
            paymentMethodActionCreator,
            cbaMPGSScriptLoader,
            'en_US',
        );

        paymentMethod = getCBAMPGS();

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethod.id,
                gatewayId: paymentMethod.gateway,
            },
        });

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.useFakeTimers();

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );

        jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(threeDSjs);

        jest.spyOn(orderActionCreator, 'finalizeOrder').mockReturnValue(finalizeOrderAction);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            store.getState(),
        );

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(store.getState().order, 'getOrder').mockReturnValue(getOrder());

        jest.spyOn(store, 'dispatch');
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
                    userLanguage: 'en_US',
                    wsVersion: 62,
                },
            };

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalled();
            expect(threeDSjs.configure).toHaveBeenCalledWith(configurePayload);
            expect(threeDSjs.isConfigured).toHaveBeenCalled();
        });

        it('should initialize the strategy and load ThreeDSjs in production mode if `isTestModeFlagEnabled` is false', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(false);
        });

        it('should initialize the strategy and load ThreeDSjs in sandbox mode if `isTestModeFlagEnabled` is true', async () => {
            paymentMethod.initializationData.isTestModeFlagEnabled = true;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(true);
        });

        it('should initialize the strategy and load ThreeDSjs in production mode if `isTestModeFlagEnabled` is undefined', async () => {
            paymentMethod.initializationData.isTestModeFlagEnabled = undefined;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(false);
        });

        it('should initialize the strategy and load ThreeDSjs in production mode if `isTestModeFlagEnabled` is not present', async () => {
            delete paymentMethod.initializationData.isTestModeFlagEnabled;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cbaMPGSScriptLoader.load).toHaveBeenCalledWith(false);
        });

        it('should fail to initialize strategy if the script loader fails to load the script', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(undefined);

            expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                NotInitializedError,
            );

            expect(threeDSjs.configure).not.toHaveBeenCalled();
            expect(threeDSjs.isConfigured).not.toHaveBeenCalled();
        });

        it('should fail to initialize strategy if the information required to configure the client script is missing', () => {
            paymentMethod.clientToken = undefined;

            expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                MissingDataError,
            );

            expect(threeDSjs.configure).not.toHaveBeenCalled();
            expect(threeDSjs.isConfigured).not.toHaveBeenCalled();
        });

        it('should fail to initialize strategy if client script is not properly configured', () => {
            threeDSjs = getCBAMPGSScriptMock(false);

            expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(
                PaymentMethodFailedError,
            );

            expect(threeDSjs.configure).not.toHaveBeenCalled();
            expect(threeDSjs.isConfigured).not.toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        beforeEach(() => {
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

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)),
            );
        });

        it('should execute the base strategy if 3ds is disabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);

            await strategy.initialize({ methodId: paymentMethod.id });

            await strategy.execute(payload);

            expect(threeDSjs.initiateAuthentication).not.toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should execute the 3DS strategy successfully if 3ds is enabled', async () => {
            await strategy.initialize({ methodId: paymentMethod.id });

            strategy.execute(payload);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(threeDSjs.initiateAuthentication).toHaveBeenCalledWith(
                `${getConfig().storeConfig.storeProfile.storeId}_${getOrder().orderId}`,
                'session-id-uuid',
                expect.any(Function),
            );

            expect(threeDSjs.authenticatePayer).toHaveBeenCalledWith(
                `${getConfig().storeConfig.storeProfile.storeId}_${getOrder().orderId}`,
                'session-id-uuid',
                expect.any(Function),
                { fullScreenRedirect: true },
            );

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        threeDSecure: {
                            token: expect.any(String),
                        },
                    }),
                }),
            );
        });

        it('should fail to execute the 3DS strategy if payment data is missing', async () => {
            payload.payment = undefined;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);

            expect(threeDSjs.initiateAuthentication).not.toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should fail to execute the 3DS strategy if an error different to three_d_secure_required occurs', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'gateway_error' }],
                    status: 'error',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)),
            );

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(RequestError);

            expect(threeDSjs.initiateAuthentication).not.toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should fail to execute the 3DS strategy if threeDS result is missing the token', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [{ code: 'three_d_secure_required' }],
                    three_ds_result: {
                        acs_url: null,
                        payer_auth_request: null,
                        merchant_data: null,
                        callback_url: null,
                        token: undefined,
                    },
                    status: 'error',
                }),
            );

            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)),
            );

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(RequestError);

            expect(threeDSjs.initiateAuthentication).not.toHaveBeenCalled();
            expect(threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should fail to execute the 3DS strategy if an error occurs when initializing Authentication', async () => {
            const _threeDSjs = getCBAMPGSScriptMock(true, true, true, true, true, false, true);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(_threeDSjs);

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodDeclinedError);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(_threeDSjs.initiateAuthentication).toHaveBeenCalled();
            expect(_threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should fail to execute the 3DS strategy if gateway recomendation is DO_NOT_PROCEED when initializing Authentication', async () => {
            const _threeDSjs = getCBAMPGSScriptMock(true, false);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(_threeDSjs);

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodDeclinedError);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(_threeDSjs.initiateAuthentication).toHaveBeenCalled();
            expect(_threeDSjs.authenticatePayer).not.toHaveBeenCalled();
        });

        it('should fail to execute the 3DS strategy if authentication is not available when initializing Authentication', async () => {
            const _threeDSjs = getCBAMPGSScriptMock(true, true, true, false);

            jest.spyOn(cbaMPGSScriptLoader, 'load').mockResolvedValue(_threeDSjs);

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodDeclinedError);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(_threeDSjs.initiateAuthentication).toHaveBeenCalled();
            expect(_threeDSjs.authenticatePayer).not.toHaveBeenCalled();
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

            expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodDeclinedError);

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
        it('finalizes order if order is created and payment is finalized', async () => {
            const state = store.getState();

            jest.spyOn(state.order, 'getOrder').mockReturnValue(getOrder());

            jest.spyOn(state.payment, 'getPaymentStatus').mockReturnValue(
                paymentStatusTypes.FINALIZE,
            );

            await strategy.finalize();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('does not finalize order if order is not created', async () => {
            const state = store.getState();

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(state.order, 'getOrder').mockReturnValue(null);

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('does not finalize order if order is not finalized', async () => {
            const state = store.getState();

            jest.spyOn(state.payment, 'getPaymentStatus').mockReturnValue(
                paymentStatusTypes.INITIALIZE,
            );

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
            expect(orderActionCreator.finalizeOrder).not.toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(finalizeOrderAction);
        });

        it('throws error if order is missing', async () => {
            const state = store.getState();

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(state.order, 'getOrder').mockReturnValue(null);

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});
