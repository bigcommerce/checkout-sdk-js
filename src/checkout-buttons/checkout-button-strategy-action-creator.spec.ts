import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender } from '../checkout';
import { CheckoutActionType, CheckoutStore } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { LOAD_PAYMENT_METHOD_FAILED, LOAD_PAYMENT_METHOD_REQUESTED, LOAD_PAYMENT_METHOD_SUCCEEDED, PaymentMethodActionCreator } from '../payment';
import { getPaymentMethod } from '../payment/payment-methods.mock';

import { CheckoutButtonActionType } from './checkout-button-actions';
import { CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import { CheckoutButtonStrategy } from './strategies';

describe('CheckoutButtonStrategyActionCreator', () => {
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let registry: Registry<CheckoutButtonStrategy>;
    let options: CheckoutButtonOptions;
    let store: CheckoutStore;
    let strategyActionCreator: CheckoutButtonStrategyActionCreator;
    let strategy: CheckoutButtonStrategy;

    class MockButtonStrategy extends CheckoutButtonStrategy { }

    beforeEach(() => {
        store = createCheckoutStore();
        registry = new Registry<CheckoutButtonStrategy>();
        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(createRequestSender()),
            new ConfigActionCreator(new ConfigRequestSender(createRequestSender()))
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        strategy = new MockButtonStrategy();

        registry.register('test', () => strategy);

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => Observable.from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.from([
                createAction(LOAD_PAYMENT_METHOD_REQUESTED),
                createAction(LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod: getPaymentMethod() }),
            ]));

        options = { methodId: 'test' };

        strategyActionCreator = new CheckoutButtonStrategyActionCreator(
            registry,
            checkoutActionCreator,
            paymentMethodActionCreator
        );
    });

    it('loads default checkout data', async () => {
        await Observable.from(strategyActionCreator.initialize(options)(store))
            .toArray()
            .toPromise();

        expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalledWith(options);
    });

    it('loads required payment method', async () => {
        await Observable.from(strategyActionCreator.initialize(options)(store))
            .toArray()
            .toPromise();

        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('test', options);
    });

    it('finds strategy and initializes it', async () => {
        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'initialize');

        await Observable.from(strategyActionCreator.initialize(options)(store))
            .toArray()
            .toPromise();

        expect(registry.get).toHaveBeenCalledWith('test');
        expect(strategy.initialize).toHaveBeenCalledWith(options);
    });

    it('emits actions indicating initialization progress', async () => {
        const actions = await Observable.from(strategyActionCreator.initialize({ methodId: 'test' })(store))
            .toArray()
            .toPromise();

        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: CheckoutActionType.LoadCheckoutRequested },
            { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
            { type: LOAD_PAYMENT_METHOD_REQUESTED },
            { type: LOAD_PAYMENT_METHOD_SUCCEEDED, payload: { paymentMethod: getPaymentMethod() } },
            { type: CheckoutButtonActionType.InitializeButtonSucceeded, meta: { methodId: 'test' } },
        ]);
    });

    it('emits error if unable to load default checkout data', async () => {
        const expectedError = new Error('Unable to load checkout');

        jest.spyOn(checkoutActionCreator, 'loadDefaultCheckout')
            .mockReturnValue(() => Observable.throw(createErrorAction(CheckoutActionType.LoadCheckoutFailed, expectedError)));

        const errorHandler = jest.fn(action => Observable.of(action));
        const actions = await Observable.from(strategyActionCreator.initialize({ methodId: 'test' })(store))
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: expectedError },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId: 'test' } },
        ]);
    });

    it('throws error if unable to load required payment method', async () => {
        const expectedError = new Error('Unable to load payment method');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.throw(createErrorAction(LOAD_PAYMENT_METHOD_FAILED, expectedError)));

        const errorHandler = jest.fn(action => Observable.of(action));
        const actions = await Observable.from(strategyActionCreator.initialize({ methodId: 'test' })(store))
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: CheckoutActionType.LoadCheckoutRequested },
            { type: CheckoutActionType.LoadCheckoutSucceeded, payload: expect.any(Object) },
            { type: LOAD_PAYMENT_METHOD_FAILED, error: true, payload: expectedError },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId: 'test' } },
        ]);
    });

    it('throws error if unable to initialize strategy', async () => {
        const expectedError = new Error('Unable to initialize strategy');

        jest.spyOn(strategy, 'initialize')
            .mockReturnValue(Promise.reject(expectedError));

        const errorHandler = jest.fn(action => Observable.of(action));
        const actions = await Observable.from(strategyActionCreator.initialize({ methodId: 'test' })(store))
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: CheckoutActionType.LoadCheckoutRequested },
            { type: CheckoutActionType.LoadCheckoutSucceeded, payload: expect.any(Object) },
            { type: LOAD_PAYMENT_METHOD_REQUESTED },
            { type: LOAD_PAYMENT_METHOD_SUCCEEDED, payload: expect.any(Object) },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId: 'test' } },
        ]);
    });
});
