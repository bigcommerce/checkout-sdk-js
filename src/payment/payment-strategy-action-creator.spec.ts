import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getCustomerState } from '../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';
import { getOrderRequestBody } from '../order/internal-orders.mock';
import { getOrderState } from '../order/orders.mock';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentActionCreator from './payment-action-creator';
import { getPaymentMethod } from './payment-methods.mock';
import PaymentRequestSender from './payment-request-sender';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import { PaymentStrategyActionType } from './payment-strategy-actions';
import PaymentStrategyRegistry from './payment-strategy-registry';
import { CreditCardPaymentStrategy, NoPaymentDataRequiredPaymentStrategy, PaymentStrategy } from './strategies';

describe('PaymentStrategyActionCreator', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentClient: any;
    let requestSender: RequestSender;
    let registry: PaymentStrategyRegistry;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let noPaymentDataStrategy: PaymentStrategy;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        requestSender = createRequestSender();
        paymentClient = createPaymentClient();
        registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        strategy = new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            new PaymentActionCreator(
                new PaymentRequestSender(createPaymentClient()),
                orderActionCreator
            )
        );
        noPaymentDataStrategy = new NoPaymentDataRequiredPaymentStrategy(
            store,
            orderActionCreator
        );

        jest.spyOn(registry, 'getByMethod')
            .mockReturnValue(strategy);
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds payment strategy by method', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.initialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('initializes payment strategy', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.initialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toPromise();

            expect(strategy.initialize).toHaveBeenCalledWith({ methodId: method.id, gatewayId: method.gateway });
        });

        it('emits action to notify initialization progress', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const actions = await Observable.from(actionCreator.initialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.InitializeRequested, meta: { methodId: method.id } },
                { type: PaymentStrategyActionType.InitializeSucceeded, meta: { methodId: method.id } },
            ]);
        });

        it('emits error action if unable to initialize', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const initializeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'initialize')
                .mockReturnValue(Promise.reject(initializeError));

            const actions = await Observable.from(actionCreator.initialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.InitializeRequested, meta: { methodId: method.id } },
                { type: PaymentStrategyActionType.InitializeFailed, error: true, payload: initializeError, meta: { methodId: method.id } },
            ]);
        });

        it('throws error if payment method has not been loaded', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            try {
                await Observable.from(actionCreator.initialize({ methodId: 'unknown' })(store)).toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#deinitialize()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds payment strategy by method', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.deinitialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('deinitializes payment strategy', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.deinitialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toPromise();

            expect(strategy.deinitialize).toHaveBeenCalled();
        });

        it('emits action to notify deinitialization progress', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const actions = await Observable.from(actionCreator.deinitialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.DeinitializeRequested, meta: { methodId: method.id } },
                { type: PaymentStrategyActionType.DeinitializeSucceeded, meta: { methodId: method.id } },
            ]);
        });

        it('emits error action if unable to deinitialize', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const deinitializeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'deinitialize')
                .mockReturnValue(Promise.reject(deinitializeError));

            const actions = await Observable.from(actionCreator.deinitialize({ methodId: method.id, gatewayId: method.gateway })(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.DeinitializeRequested, meta: { methodId: method.id } },
                { type: PaymentStrategyActionType.DeinitializeFailed, error: true, payload: deinitializeError, meta: { methodId: method.id } },
            ]);
        });

        it('throws error if payment method has not been loaded', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            try {
                await Observable.from(actionCreator.initialize({ methodId: 'unknown' })(store)).toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        beforeEach(() => {
            jest.spyOn(strategy, 'execute')
                .mockReturnValue(Promise.resolve(store.getState()));

            jest.spyOn(noPaymentDataStrategy, 'execute')
                .mockReturnValue(Promise.resolve(store.getState()));
        });

        it('finds payment strategy by method', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.execute(getOrderRequestBody())(store))
                .toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('executes payment strategy', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const payload = getOrderRequestBody();

            await Observable.from(actionCreator.execute(payload)(store))
                .toPromise();

            expect(strategy.execute).toHaveBeenCalledWith(
                payload,
                {
                    methodId: payload.payment && payload.payment.methodId,
                    gatewayId: payload.payment && payload.payment.gatewayId,
                }
            );
        });

        it('emits action to load order and notify execution progress', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const payload = getOrderRequestBody();
            const methodId = payload.payment && payload.payment.methodId;
            const actions = await Observable.from(actionCreator.execute(payload)(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.ExecuteRequested, meta: { methodId } },
                { type: PaymentStrategyActionType.ExecuteSucceeded, meta: { methodId } },
            ]);
        });

        it('emits error action if unable to execute', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const payload = getOrderRequestBody();
            const methodId = payload.payment && payload.payment.methodId;
            const executeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'execute')
                .mockReturnValue(Promise.reject(executeError));

            const actions = await Observable.from(actionCreator.execute(payload)(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.ExecuteRequested, meta: { methodId } },
                { type: PaymentStrategyActionType.ExecuteFailed, error: true, payload: executeError, meta: { methodId } },
            ]);
        });

        it('throws error if payment method is not found or loaded', async () => {
            store = createCheckoutStore({
                ...state,
                paymentMethods: { ...state.paymentMethods, data: [] },
            });
            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            try {
                await Observable.from(actionCreator.execute(getOrderRequestBody())(store)).toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
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

            jest.spyOn(registry, 'get')
                .mockReturnValue(noPaymentDataStrategy);

            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const payload = { ...getOrderRequestBody(), useStoreCredit: true };

            await Observable.from(actionCreator.execute(payload)(store))
                .toPromise();

            expect(registry.get).toHaveBeenCalledWith('nopaymentdatarequired');
            expect(noPaymentDataStrategy.execute).toHaveBeenCalledWith(
                payload,
                {
                    methodId: payload.payment && payload.payment.methodId,
                    gatewayId: payload.payment && payload.payment.gatewayId,
                }
            );
        });
    });

    describe('#finalize()', () => {
        beforeEach(() => {
            state = getCheckoutStoreStateWithOrder();
            store = createCheckoutStore(state);

            jest.spyOn(strategy, 'finalize')
                .mockReturnValue(Promise.resolve(store.getState()));

            jest.spyOn(orderActionCreator, 'loadOrderPayments')
                .mockReturnValue(Observable.of(createAction(OrderActionType.LoadOrderPaymentsRequested)));
        });

        it('finds payment strategy by method', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();

            await Observable.from(actionCreator.finalize()(store))
                .toPromise();

            expect(registry.getByMethod).toHaveBeenCalledWith(method);
        });

        it('finalizes order using payment strategy', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            await Observable.from(actionCreator.finalize()(store))
                .toPromise();

            expect(strategy.finalize).toHaveBeenCalled();
        });

        it('loads payment data for current order', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            await Observable.from(actionCreator.finalize()(store))
                .toPromise();

            expect(orderActionCreator.loadOrderPayments).toHaveBeenCalled();
        });

        it('emits action to load order and notify finalization progress', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const actions = await Observable.from(actionCreator.finalize()(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.FinalizeRequested },
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: PaymentStrategyActionType.FinalizeSucceeded, meta: { methodId: method.id } },
            ]);
        });

        it('emits error action if unable to finalize', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const method = getPaymentMethod();
            const finalizeError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            jest.spyOn(strategy, 'finalize')
                .mockReturnValue(Promise.reject(finalizeError));

            const actions = await Observable.from(actionCreator.finalize()(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.FinalizeRequested },
                { type: OrderActionType.LoadOrderPaymentsRequested },
                { type: PaymentStrategyActionType.FinalizeFailed, error: true, payload: finalizeError, meta: { methodId: method.id } },
            ]);
        });

        it('returns rejected promise if order does not require finalization', async () => {
            store = createCheckoutStore({
                ...state,
                order: getOrderState(),
            });
            registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);

            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

            try {
                await Observable.from(actionCreator.finalize()(store)).toPromise();
            } catch (action) {
                expect(action.payload).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });

    describe('#widgetInteraction()', () => {
        it('executes widget interaction callback', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const options = { methodId: 'default' };
            const fakeMethod = jest.fn(() => Promise.resolve());
            await Observable.from(actionCreator.widgetInteraction(fakeMethod, options)(store))
                .toArray()
                .toPromise();

            expect(fakeMethod).toHaveBeenCalled();
        });

        it('emits action to notify widget interaction in progress', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const actions = await Observable.from(actionCreator.widgetInteraction(jest.fn(() => Promise.resolve()), { methodId: 'default' })(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: PaymentStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: PaymentStrategyActionType.WidgetInteractionFinished, meta: { methodId: 'default' } },
            ]);
        });

        it('emits error action if widget interaction fails', async () => {
            const actionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
            const signInError = new Error();
            const errorHandler = jest.fn(action => Observable.of(action));

            const actions = await Observable.from(actionCreator.widgetInteraction(jest.fn(() => Promise.reject(signInError)), { methodId: 'default' })(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PaymentStrategyActionType.WidgetInteractionStarted, meta: { methodId: 'default' } },
                { type: PaymentStrategyActionType.WidgetInteractionFailed, error: true, payload: signInError, meta: { methodId: 'default' } },
            ]);
        });
    });
});
