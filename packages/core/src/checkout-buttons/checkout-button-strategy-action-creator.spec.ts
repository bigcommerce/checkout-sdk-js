import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';
import { from, of, throwError } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator, PaymentMethodActionType, PaymentMethodRequestSender } from '../payment';
import { getPaymentMethod } from '../payment/payment-methods.mock';

import { CheckoutButtonActionType } from './checkout-button-actions';
import { CheckoutButtonInitializeOptions } from './checkout-button-options';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';

describe('CheckoutButtonStrategyActionCreator', () => {
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let registry: Registry<CheckoutButtonStrategy>;
    let options: CheckoutButtonInitializeOptions;
    let strategyActionCreator: CheckoutButtonStrategyActionCreator;
    let strategy: CheckoutButtonStrategy;
    let store: CheckoutStore;

    class MockButtonStrategy implements CheckoutButtonStrategy {
        initialize(): Promise<void> {
            return Promise.resolve();
        }

        deinitialize(): Promise<void> {
            return Promise.resolve();
        }
    }

    beforeEach(() => {
        registry = new Registry<CheckoutButtonStrategy>();
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        strategy = new MockButtonStrategy();
        store = createCheckoutStore();

        registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () => strategy);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(from([
                createAction(PaymentMethodActionType.LoadPaymentMethodRequested),
                createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, { paymentMethod: getPaymentMethod() }),
            ]));

        options = {
            methodId: CheckoutButtonMethodType.BRAINTREE_PAYPAL,
            containerId: 'checkout-button',
        };

        strategyActionCreator = new CheckoutButtonStrategyActionCreator(
            registry,
            paymentMethodActionCreator
        );
    });

    it('loads required payment method and uses cache if available', async () => {
        await from(strategyActionCreator.initialize(options)(store))
            .pipe(toArray())
            .toPromise();

        expect(paymentMethodActionCreator.loadPaymentMethod)
            .toHaveBeenCalledWith(CheckoutButtonMethodType.BRAINTREE_PAYPAL, { useCache: true });
    });

    it('finds strategy and initializes it', async () => {
        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'initialize');

        await from(strategyActionCreator.initialize(options)(store))
            .pipe(toArray())
            .toPromise();

        expect(registry.get).toHaveBeenCalledWith(CheckoutButtonMethodType.BRAINTREE_PAYPAL);
        expect(strategy.initialize).toHaveBeenCalledWith(options);
    });

    it('does not initialize if strategy is already initialized', async () => {
        store = createCheckoutStore(merge(getCheckoutStoreState(), {
            checkoutButton: {
                data: {
                    [options.methodId]: {
                        initializedContainers: {
                            [options.containerId]: true,
                        },
                    },
                },
            },
        }));

        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'initialize');

        await from(strategyActionCreator.initialize(options)(store))
            .pipe(toArray())
            .toPromise();

        expect(registry.get).not.toHaveBeenCalledWith(CheckoutButtonMethodType.BRAINTREE_PAYPAL);
        expect(strategy.initialize).not.toHaveBeenCalledWith(options);
    });

    it('emits actions indicating initialization progress', async () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'checkout-button';
        const actions = await from(strategyActionCreator.initialize({ methodId, containerId })(store))
            .pipe(toArray())
            .toPromise();

        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId, containerId } },
            { type: PaymentMethodActionType.LoadPaymentMethodRequested },
            { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, payload: { paymentMethod: getPaymentMethod() } },
            { type: CheckoutButtonActionType.InitializeButtonSucceeded, meta: { methodId, containerId } },
        ]);
    });

    it('throws error if unable to load required payment method', async () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'checkout-button';
        const expectedError = new Error('Unable to load payment method');

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(throwError(createErrorAction(PaymentMethodActionType.LoadPaymentMethodFailed, expectedError)));

        const errorHandler = jest.fn(action => of(action));
        const actions = await from(strategyActionCreator.initialize({ methodId, containerId })(store))
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId, containerId} },
            { type: PaymentMethodActionType.LoadPaymentMethodFailed, error: true, payload: expectedError },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId, containerId } },
        ]);
    });

    it('throws error if unable to initialize strategy', async () => {
        const methodId = CheckoutButtonMethodType.BRAINTREE_PAYPAL;
        const containerId = 'checkout-button';
        const expectedError = new Error('Unable to initialize strategy');

        jest.spyOn(strategy, 'initialize')
            .mockReturnValue(Promise.reject(expectedError));

        const errorHandler = jest.fn(action => of(action));
        const actions = await from(strategyActionCreator.initialize({ methodId, containerId })(store))
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: CheckoutButtonActionType.InitializeButtonRequested, meta: { methodId, containerId } },
            { type: PaymentMethodActionType.LoadPaymentMethodRequested },
            { type: PaymentMethodActionType.LoadPaymentMethodSucceeded, payload: expect.any(Object) },
            { type: CheckoutButtonActionType.InitializeButtonFailed, error: true, payload: expectedError, meta: { methodId, containerId } },
        ]);
    });

    it('finds strategy and deinitializes it', async () => {
        store = createCheckoutStore(merge(getCheckoutStoreState(), {
            checkoutButton: {
                data: {
                    [options.methodId]: {
                        initializedContainers: {
                            [options.containerId]: true,
                        },
                    },
                },
            },
        }));

        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'deinitialize');

        await from(strategyActionCreator.deinitialize(options)(store))
            .pipe(toArray())
            .toPromise();

        expect(registry.get).toHaveBeenCalledWith(CheckoutButtonMethodType.BRAINTREE_PAYPAL);
        expect(strategy.deinitialize).toHaveBeenCalled();
    });

    it('does not deinitialize if strategy is not initialized', async () => {
        jest.spyOn(registry, 'get');
        jest.spyOn(strategy, 'deinitialize');

        await from(strategyActionCreator.deinitialize(options)(store))
            .pipe(toArray())
            .toPromise();

        expect(registry.get).not.toHaveBeenCalledWith(options.methodId);
        expect(strategy.deinitialize).not.toHaveBeenCalled();
    });
});
