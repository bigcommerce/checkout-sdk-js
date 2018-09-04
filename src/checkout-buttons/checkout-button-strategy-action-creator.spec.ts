import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { Registry } from '../common/registry';
import { PaymentMethodActionCreator, PaymentMethodActionType, PaymentMethodRequestSender } from '../payment';
import { getPaymentMethod } from '../payment/payment-methods.mock';

import { CheckoutButtonActionType } from './checkout-button-actions';
import { CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import { CheckoutButtonStrategy } from './strategies';

describe('CheckoutButtonStrategyActionCreator', () => {
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let registry: Registry<CheckoutButtonStrategy>;
    let options: CheckoutButtonOptions;
    let strategyActionCreator: CheckoutButtonStrategyActionCreator;
    let strategy: CheckoutButtonStrategy;

    class MockButtonStrategy extends CheckoutButtonStrategy { }

    beforeEach(() => {
        registry = new Registry<CheckoutButtonStrategy>();
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        strategy = new MockButtonStrategy();

        registry.register('test', () => strategy);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.from([
                createAction(PaymentMethodActionType.LoadPaymentMethodRequested),
                createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, { paymentMethod: getPaymentMethod() }),
            ]));

        options = { methodId: 'test' };

        strategyActionCreator = new CheckoutButtonStrategyActionCreator(
            registry,
            paymentMethodActionCreator
        );
    });

    it('loads required payment method', async () => {
        await strategyActionCreator.initialize(options)
            .toArray()
            .toPromise();

        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('test', options);
    });

    it('finds strategy and initializes it', async () => {
        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'initialize');

        await strategyActionCreator.initialize(options)
            .toArray()
            .toPromise();

        expect(registry.get).toHaveBeenCalledWith('test');
        expect(strategy.initialize).toHaveBeenCalledWith(options);
    });

    it('emits actions indicating initialization progress', async () => {
        const actions = await strategyActionCreator.initialize({ methodId: 'test' })
            .toArray()
            .toPromise();

        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: PaymentMethodActionType.LoadPaymentMethodRequested },
            { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, payload: { paymentMethod: getPaymentMethod() } },
            { type: CheckoutButtonActionType.InitializeButtonSucceeded, meta: { methodId: 'test' } },
        ]);
    });

    it('throws error if unable to load required payment method', async () => {
        const expectedError = new Error('Unable to load payment method');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.throw(createErrorAction(PaymentMethodActionType.LoadPaymentMethodFailed, expectedError)));

        const errorHandler = jest.fn(action => Observable.of(action));
        const actions = await strategyActionCreator.initialize({ methodId: 'test' })
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: PaymentMethodActionType.LoadPaymentMethodFailed, error: true, payload: expectedError },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId: 'test' } },
        ]);
    });

    it('throws error if unable to initialize strategy', async () => {
        const expectedError = new Error('Unable to initialize strategy');

        jest.spyOn(strategy, 'initialize')
            .mockReturnValue(Promise.reject(expectedError));

        const errorHandler = jest.fn(action => Observable.of(action));
        const actions = await strategyActionCreator.initialize({ methodId: 'test' })
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId: 'test' } },
            { type: PaymentMethodActionType.LoadPaymentMethodRequested },
            { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, payload: expect.any(Object) },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId: 'test' } },
        ]);
    });
});
