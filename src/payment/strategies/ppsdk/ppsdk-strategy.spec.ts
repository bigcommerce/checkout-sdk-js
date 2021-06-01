import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore, CheckoutRequestSender, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { OrderActionCreator, OrderRequestSender } from '../../../order';

import { PPSDKStrategy } from './ppsdk-strategy';

describe('PPSDKStrategy', () => {
    let store: ReturnType<typeof createCheckoutStore>;
    let orderActionCreator: InstanceType<typeof OrderActionCreator>;
    let submitSpy: jest.SpyInstance;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        submitSpy = jest.spyOn(orderActionCreator, 'submitOrder');
        jest.spyOn(store, 'dispatch');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when initialized with a valid PPSDK payment method', () => {
        describe('#initialize', () => {
            it('does not throw an error', () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator);

                expect(() => strategy.initialize({ methodId: 'cabbagepay' })).not.toThrow();
            });
        });

        describe('#execute', () => {
            it('after a successful initialization, submits the order', () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator);

                strategy.initialize({ methodId: 'cabbagepay' });
                strategy.execute({});

                expect(store.dispatch).toBeCalledWith(submitSpy.mock.results[0].value);
            });
        });
    });

    describe('when initialized with a not yet supported PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws an error', () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator);

                expect(() => strategy.initialize({ methodId: 'unsupported-cabbagepay' })).toThrow();
            });
        });
    });

    describe('when initialized with a non PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws an error', () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator);

                expect(() => strategy.initialize({ methodId: 'braintree' })).toThrow();
            });
        });
    });

    describe('when not successfully initialized', () => {
        describe('#execute', () => {
            it('throws an error', () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator);

                expect(() => strategy.execute({})).toThrow();
            });
        });
    });
});
