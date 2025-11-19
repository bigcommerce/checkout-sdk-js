import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import {
    createCreditCardPaymentStrategy,
    CreditCardPaymentStrategy as CreditCardPaymentStrategyV2,
} from '@bigcommerce/checkout-sdk/credit-card-integration';
import { createNoPaymentStrategy } from '@bigcommerce/checkout-sdk/no-payment-integration';
import {
    OrderFinalizationNotRequiredError as OrderFinalizationNotRequiredErrorV2,
    PaymentIntegrationService,
    PaymentStrategyFactory,
    PaymentStrategyResolveId,
    PaymentStrategy as PaymentStrategyV2,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutStoreState,
    CheckoutValidator,
    createCheckoutStore,
} from '../checkout';
import {
    getCheckout,
    getCheckoutStoreState,
    getCheckoutStoreStateWithOrder,
} from '../checkout/checkouts.mock';
import { ErrorLogger } from '../common/error';
import { MissingDataError } from '../common/error/errors';
import { ResolveIdRegistry } from '../common/registry';
import { getCustomerState } from '../customer/customers.mock';
import * as paymentStrategyFactories from '../generated/payment-strategies';
import { HostedFormFactory } from '../hosted-form';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';
import { getOrderRequestBody } from '../order/internal-orders.mock';
import { getOrderState } from '../order/orders.mock';
import { createPaymentIntegrationService } from '../payment-integration';
import {
    createSpamProtection,
    GoogleRecaptcha,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import createPaymentStrategyRegistryV2 from './create-payment-strategy-registry-v2';
import PaymentActionCreator from './payment-action-creator';
import { getPaymentMethod } from './payment-methods.mock';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import { PaymentStrategyActionType } from './payment-strategy-actions';
import PaymentStrategyRegistry from './payment-strategy-registry';
import { PaymentStrategy } from './strategies';
import { CreditCardPaymentStrategy } from './strategies/credit-card';

describe('PaymentStrategyActionCreator', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentClient: any;
    let requestSender: RequestSender;
    let spamProtection: GoogleRecaptcha;
    let registry: PaymentStrategyRegistry;
    let registryV2: ResolveIdRegistry<PaymentStrategyV2, PaymentStrategyResolveId>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let strategyV2: PaymentStrategyV2;
    let noPaymentDataStrategy: PaymentStrategyV2;
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let actionCreator: PaymentStrategyActionCreator;
    let paymentIntegrationService: PaymentIntegrationService;
    let errorLogger: ErrorLogger;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        requestSender = createRequestSender();
        paymentClient = createPaymentClient();
        spamProtection = createSpamProtection(createScriptLoader());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
            createSpamProtection(createScriptLoader()),
        );
        errorLogger = {
            log: jest.fn(),
        };
        registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
        );

        paymentIntegrationService = createPaymentIntegrationService(store);

        registryV2 = createPaymentStrategyRegistryV2(
            paymentIntegrationService,
            paymentStrategyFactories,
            {
                useFallback: true,
            },
        );
        strategy = new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            new PaymentActionCreator(
                new PaymentRequestSender(createPaymentClient()),
                orderActionCreator,
                new PaymentRequestTransformer(),
                paymentHumanVerificationHandler,
            ),
            new HostedFormFactory(store),
        );
        noPaymentDataStrategy = createNoPaymentStrategy(paymentIntegrationService);
        strategyV2 = createCreditCardPaymentStrategy(paymentIntegrationService);
        spamProtectionActionCreator = new SpamProtectionActionCreator(
            spamProtection,
            new SpamProtectionRequestSender(requestSender),
        );
        actionCreator = new PaymentStrategyActionCreator(
            registry,
            registryV2,
            orderActionCreator,
            spamProtectionActionCreator,
            paymentIntegrationService,
            errorLogger,
        );

        jest.spyOn(registry, 'getByMethod').mockReturnValue(strategy);
        jest.spyOn(registryV2, 'get').mockReturnValue(strategyV2);
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'initialize').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds payment strategy by method', async () => {
            const method = getPaymentMethod();

            await from(
                actionCreator.initialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('uses registryV2  if registryV1 is unalbe to resolve', async () => {
            const method = getPaymentMethod();

            jest.spyOn(registry, 'getByMethod').mockRestore();

            await from(
                actionCreator.initialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(registryV2.get).toHaveBeenCalledWith({
                gateway: undefined,
                id: 'authorizenet',
                type: 'PAYMENT_TYPE_API',
            });
        });

        it('initializes payment strategy', async () => {
            const method = getPaymentMethod();

            await from(
                actionCreator.initialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(strategy.initialize).toHaveBeenCalledWith({
                methodId: method.id,
                gatewayId: method.gateway,
            });
        });

        it('emits action to notify initialization progress', async () => {
            const method = getPaymentMethod();
            const actions = await from(
                actionCreator.initialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.InitializeRequested,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
                {
                    type: PaymentStrategyActionType.InitializeSucceeded,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
            ]);
        });

        it('emits error action if unable to initialize', async () => {
            const method = getPaymentMethod();
            const initializeError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            jest.spyOn(strategy, 'initialize').mockReturnValue(Promise.reject(initializeError));

            const actions = await from(
                actionCreator.initialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.InitializeRequested,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
                {
                    type: PaymentStrategyActionType.InitializeFailed,
                    error: true,
                    payload: initializeError,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
            ]);
        });

        it('throws error if payment method has not been loaded', async () => {
            try {
                await from(actionCreator.initialize({ methodId: 'unknown' })(store)).toPromise();
            } catch (action) {
                expect((action as Action).payload).toBeInstanceOf(MissingDataError);
            }
        });

        describe('with integrations', () => {
            let mockStrategyFactory: PaymentStrategyFactory<PaymentStrategyV2>;
            let mockStrategy: PaymentStrategyV2;

            beforeEach(() => {
                mockStrategy = {
                    initialize: jest.fn().mockResolvedValue(store.getState()),
                    execute: jest.fn().mockResolvedValue(undefined),
                    finalize: jest.fn().mockResolvedValue(undefined),
                    deinitialize: jest.fn().mockResolvedValue(undefined),
                };

                mockStrategyFactory = jest.fn().mockReturnValue(mockStrategy);

                store = createCheckoutStore(
                    merge({}, state, {
                        config: {
                            data: {
                                storeConfig: {
                                    checkoutSettings: {
                                        features: {
                                            'CHECKOUT-9450.lazy_load_payment_strategies': true,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                );

                actionCreator = new PaymentStrategyActionCreator(
                    registry,
                    registryV2,
                    orderActionCreator,
                    spamProtectionActionCreator,
                    paymentIntegrationService,
                    errorLogger,
                );
            });

            it('registers new strategy factory when integrations are provided', async () => {
                const method = getPaymentMethod();
                const resolvableFactory = toResolvableModule(mockStrategyFactory, [
                    {
                        id: method.id,
                        gateway: method.gateway,
                        type: method.type,
                    },
                ]);

                jest.spyOn(registryV2, 'getFactory').mockReturnValue(undefined);
                jest.spyOn(registryV2, 'register');
                jest.spyOn(registry, 'getByMethod').mockImplementation(() => {
                    throw new Error('Strategy not found in registry v1');
                });
                jest.spyOn(registryV2, 'get').mockReturnValue(mockStrategy);

                await from(
                    actionCreator.initialize({
                        methodId: method.id,
                        gatewayId: method.gateway,
                        integrations: [resolvableFactory],
                    })(store),
                ).toPromise();

                expect(registryV2.register).toHaveBeenCalledWith(
                    {
                        id: method.id,
                        gateway: method.gateway,
                        type: method.type,
                    },
                    expect.any(Function),
                );

                expect(
                    registryV2.get({
                        id: method.id,
                        gateway: method.gateway,
                        type: method.type,
                    }),
                ).toBe(mockStrategy);
            });

            it('uses provided integration strategy when registering and initializing', async () => {
                const method = getPaymentMethod();
                const resolvableFactory = toResolvableModule(mockStrategyFactory, [
                    {
                        id: method.id,
                        gateway: method.gateway,
                        type: method.type,
                    },
                ]);

                jest.spyOn(registryV2, 'getFactory').mockReturnValue(undefined);
                jest.spyOn(registryV2, 'get').mockReturnValue(mockStrategy);
                jest.spyOn(registry, 'getByMethod').mockImplementation(() => {
                    throw new Error('Strategy not found in registry v1');
                });

                await from(
                    actionCreator.initialize({
                        methodId: method.id,
                        gatewayId: method.gateway,
                        integrations: [resolvableFactory],
                    })(store),
                ).toPromise();

                expect(mockStrategy.initialize).toHaveBeenCalledWith({
                    methodId: method.id,
                    gatewayId: method.gateway,
                    integrations: [resolvableFactory],
                });
            });

            it('logs message if provided integration strategy does not match with existing strategy', async () => {
                const method = getPaymentMethod();

                const existingFactory = toResolvableModule(mockStrategyFactory, [
                    {
                        id: method.id,
                        gateway: method.gateway,
                        type: method.type,
                    },
                ]);

                const newFactory = toResolvableModule(jest.fn(), [
                    {
                        id: 'different-id',
                        gateway: method.gateway,
                        type: method.type,
                    },
                ]);

                jest.spyOn(registryV2, 'getFactory').mockReturnValue(existingFactory as any);
                jest.spyOn(registryV2, 'get').mockReturnValue(mockStrategy);
                jest.spyOn(registry, 'getByMethod').mockImplementation(() => {
                    throw new Error('Strategy not found in registry v1');
                });

                const captureMessageSpy = jest.fn();
                const errorLoggerMock = { log: captureMessageSpy };
                const actionCreatorWithLogger = new PaymentStrategyActionCreator(
                    registry,
                    registryV2,
                    orderActionCreator,
                    spamProtectionActionCreator,
                    paymentIntegrationService,
                    errorLoggerMock,
                );

                await from(
                    actionCreatorWithLogger.initialize({
                        methodId: method.id,
                        gatewayId: method.gateway,
                        integrations: [newFactory],
                    })(store),
                ).toPromise();

                expect(captureMessageSpy).toHaveBeenCalled();
            });
        });
    });

    describe('#deinitialize()', () => {
        const method = getPaymentMethod();

        beforeEach(() => {
            store = createCheckoutStore(
                merge({}, state, {
                    paymentStrategies: {
                        data: { [method.id]: { isInitialized: true } },
                    },
                }),
            );

            jest.spyOn(strategy, 'deinitialize').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds payment strategy by method', async () => {
            await from(
                actionCreator.deinitialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('uses registryV2  if registryV1 is unalbe to resolve', async () => {
            jest.spyOn(registry, 'getByMethod').mockRestore();

            await from(
                actionCreator.deinitialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(registryV2.get).toHaveBeenCalledWith({
                gateway: undefined,
                id: 'authorizenet',
                type: 'PAYMENT_TYPE_API',
            });
        });

        it('deinitializes payment strategy', async () => {
            await from(
                actionCreator.deinitialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            ).toPromise();

            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('emits action to notify deinitialization progress', async () => {
            const actions = await from(
                actionCreator.deinitialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.DeinitializeRequested,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
                {
                    type: PaymentStrategyActionType.DeinitializeSucceeded,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
            ]);
        });

        it('emits error action if unable to deinitialize', async () => {
            const deinitializeError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            jest.spyOn(strategy, 'deinitialize').mockReturnValue(Promise.reject(deinitializeError));

            const actions = await from(
                actionCreator.deinitialize({
                    methodId: method.id,
                    gatewayId: method.gateway,
                })(store),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.DeinitializeRequested,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
                {
                    type: PaymentStrategyActionType.DeinitializeFailed,
                    error: true,
                    payload: deinitializeError,
                    meta: { methodId: method.id, gatewayId: method.gateway },
                },
            ]);
        });

        it('throws error if payment method has not been loaded', async () => {
            try {
                await from(actionCreator.deinitialize({ methodId: 'unknown' })(store)).toPromise();
            } catch (action) {
                expect((action as Action).payload).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'execute').mockReturnValue(Promise.resolve(store.getState()));

            jest.spyOn(noPaymentDataStrategy, 'execute').mockReturnValue(Promise.resolve());
        });

        it('finds payment strategy by method', async () => {
            const method = getPaymentMethod();

            await from(actionCreator.execute(getOrderRequestBody())(store)).toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('uses registryV2  if registryV1 is unalbe to resolve', async () => {
            jest.spyOn(registry, 'getByMethod').mockRestore();
            jest.spyOn(strategyV2, 'execute').mockReturnValue(Promise.resolve());

            await from(actionCreator.execute(getOrderRequestBody())(store)).toPromise();

            expect(registryV2.get).toHaveBeenCalledWith({
                gateway: undefined,
                id: 'authorizenet',
                type: 'PAYMENT_TYPE_API',
            });
        });

        it('executes payment strategy', async () => {
            const payload = getOrderRequestBody();

            await from(actionCreator.execute(payload)(store)).toPromise();

            expect(strategy.execute).toHaveBeenCalledWith(payload, {
                methodId: payload.payment && payload.payment.methodId,
                gatewayId: payload.payment && payload.payment.gatewayId,
            });
        });

        it('executes spam check when required', async () => {
            const payload = getOrderRequestBody();

            jest.spyOn(spamProtectionActionCreator, 'verifyCheckoutSpamProtection').mockReturnValue(
                () => from([]),
            );

            jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue({
                ...getCheckout(),
                shouldExecuteSpamCheck: true,
            });

            await from(actionCreator.execute(payload)(store)).toPromise();

            expect(spamProtectionActionCreator.verifyCheckoutSpamProtection).toHaveBeenCalled();
        });

        it('emits action to load order and notify execution progress', async () => {
            const payload = getOrderRequestBody();
            const methodId = payload.payment && payload.payment.methodId;
            const actions = await from(actionCreator.execute(payload)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.ExecuteRequested,
                    meta: { methodId },
                },
                {
                    type: PaymentStrategyActionType.ExecuteSucceeded,
                    meta: { methodId },
                },
            ]);
        });

        it('emits error action if unable to execute', async () => {
            const payload = getOrderRequestBody();
            const methodId = payload.payment && payload.payment.methodId;
            const executeError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            jest.spyOn(strategy, 'execute').mockReturnValue(Promise.reject(executeError));

            const actions = await from(actionCreator.execute(payload)(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.ExecuteRequested,
                    meta: { methodId },
                },
                {
                    type: PaymentStrategyActionType.ExecuteFailed,
                    error: true,
                    payload: executeError,
                    meta: { methodId },
                },
            ]);
        });

        it('throws error if payment method is not found or loaded', async () => {
            store = createCheckoutStore({
                ...state,
                paymentMethods: { ...state.paymentMethods, data: [] },
            });
            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            const actionCreator = new PaymentStrategyActionCreator(
                registry,
                registryV2,
                orderActionCreator,
                spamProtectionActionCreator,
                paymentIntegrationService,
                errorLogger,
            );

            try {
                await from(actionCreator.execute(getOrderRequestBody())(store)).toPromise();
            } catch (action) {
                expect((action as Action).payload).toBeInstanceOf(MissingDataError);
            }
        });

        it('finds `nopaymentrequired` strategy if payment data is not required', async () => {
            store = createCheckoutStore({
                ...state,
                customer: merge({}, getCustomerState(), {
                    data: {
                        storeCredit: 9999,
                    },
                }),
            });

            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            jest.spyOn(registryV2, 'get').mockReturnValue(noPaymentDataStrategy);

            const actionCreator = new PaymentStrategyActionCreator(
                registry,
                registryV2,
                orderActionCreator,
                spamProtectionActionCreator,
                paymentIntegrationService,
                errorLogger,
            );
            const payload = { ...getOrderRequestBody(), useStoreCredit: true };

            await from(actionCreator.execute(payload)(store)).toPromise();

            expect(registryV2.get).toHaveBeenCalledWith({ id: 'nopaymentdatarequired' });
            expect(noPaymentDataStrategy.execute).toHaveBeenCalledWith(payload, {
                methodId: payload.payment && payload.payment.methodId,
                gatewayId: payload.payment && payload.payment.gatewayId,
            });
        });
    });

    describe('#finalize()', () => {
        beforeEach(() => {
            state = getCheckoutStoreStateWithOrder();
            store = createCheckoutStore(state);

            jest.spyOn(strategy, 'finalize').mockReturnValue(Promise.resolve(store.getState()));

            jest.spyOn(orderActionCreator, 'loadOrderPayments').mockReturnValue(
                of(createAction(OrderActionType.LoadOrderPaymentsRequested)),
            );
        });

        it('finds payment strategy by method', async () => {
            const method = getPaymentMethod();

            await from(actionCreator.finalize()(store)).toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('uses registryV2  if registryV1 is unalbe to resolve', async () => {
            jest.spyOn(registry, 'getByMethod').mockRestore();

            try {
                await from(actionCreator.finalize()(store)).toPromise();
            } catch {
                expect(registryV2.get).toHaveBeenCalledWith({
                    gateway: undefined,
                    id: 'authorizenet',
                    type: 'PAYMENT_TYPE_API',
                });
            }
        });

        it('finalizes order using payment strategy', async () => {
            await from(actionCreator.finalize()(store)).toPromise();

            expect(strategy.finalize).toHaveBeenCalled();
        });

        it('loads payment data for current order', async () => {
            await from(actionCreator.finalize()(store)).toPromise();

            expect(orderActionCreator.loadOrderPayments).toHaveBeenCalled();
        });

        it('emits action to load order and notify finalization progress', async () => {
            const method = getPaymentMethod();
            const actions = await from(actionCreator.finalize()(store)).pipe(toArray()).toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.FinalizeRequested },
                { type: OrderActionType.LoadOrderPaymentsRequested },
                {
                    type: PaymentStrategyActionType.FinalizeSucceeded,
                    meta: { methodId: method.id },
                },
            ]);
        });

        it('emits error action if unable to finalize', async () => {
            const method = getPaymentMethod();
            const finalizeError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            jest.spyOn(strategy, 'finalize').mockReturnValue(Promise.reject(finalizeError));

            const actions = await from(actionCreator.finalize()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.FinalizeRequested },
                { type: OrderActionType.LoadOrderPaymentsRequested },
                {
                    type: PaymentStrategyActionType.FinalizeFailed,
                    error: true,
                    payload: finalizeError,
                    meta: { methodId: method.id },
                },
            ]);
        });

        it('returns rejected promise if order does not require finalization', async () => {
            store = createCheckoutStore({
                ...state,
                order: getOrderState(),
            });
            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            const actionCreator = new PaymentStrategyActionCreator(
                registry,
                registryV2,
                orderActionCreator,
                spamProtectionActionCreator,
                paymentIntegrationService,
                errorLogger,
            );
            const strategyV2 = new CreditCardPaymentStrategyV2(
                createPaymentIntegrationService(store),
            );

            jest.spyOn(registryV2, 'get').mockReturnValue(strategyV2);

            try {
                await from(actionCreator.finalize()(store)).toPromise();
            } catch (action) {
                expect((action as Action).payload).toBeInstanceOf(
                    OrderFinalizationNotRequiredErrorV2,
                );
            }
        });

        it('returns rejected promise if payment method referenced in order object no longer exists', async () => {
            store = createCheckoutStore({
                ...state,
                order: getOrderState(),
                paymentMethods: {
                    ...state.paymentMethods,
                    data: [],
                },
            });
            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            const actionCreator = new PaymentStrategyActionCreator(
                registry,
                registryV2,
                orderActionCreator,
                spamProtectionActionCreator,
                paymentIntegrationService,
                errorLogger,
            );

            try {
                await from(actionCreator.finalize()(store)).toPromise();
            } catch (action) {
                expect((action as Action).payload).toBeInstanceOf(
                    OrderFinalizationNotRequiredError,
                );
            }
        });
    });

    describe('#widgetInteraction()', () => {
        it('executes widget interaction callback', async () => {
            const options = { methodId: 'default' };
            const fakeMethod = jest.fn(() => Promise.resolve());

            await from(actionCreator.widgetInteraction(fakeMethod, options))
                .pipe(toArray())
                .toPromise();

            expect(fakeMethod).toHaveBeenCalled();
        });

        it('emits action to notify widget interaction in progress', async () => {
            const actions = await from(
                actionCreator.widgetInteraction(
                    jest.fn(() => Promise.resolve()),
                    { methodId: 'default' },
                ),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.WidgetInteractionStarted,
                    meta: { methodId: 'default' },
                },
                {
                    type: PaymentStrategyActionType.WidgetInteractionFinished,
                    meta: { methodId: 'default' },
                },
            ]);
        });

        it('emits error action if widget interaction fails', async () => {
            const signInError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            const actions = await from(
                actionCreator.widgetInteraction(
                    jest.fn(() => Promise.reject(signInError)),
                    { methodId: 'default' },
                ),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.WidgetInteractionStarted,
                    meta: { methodId: 'default' },
                },
                {
                    type: PaymentStrategyActionType.WidgetInteractionFailed,
                    error: true,
                    payload: signInError,
                    meta: { methodId: 'default' },
                },
            ]);
        });
    });
});
