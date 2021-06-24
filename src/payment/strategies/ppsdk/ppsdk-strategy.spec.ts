import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { set } from 'lodash';

import { createCheckoutStore, CheckoutRequestSender, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getConfig } from '../../../config/configs.mock';
import { OrderActionCreator, OrderRequestSender } from '../../../order';

import { createPaymentProcessorRegistry } from './create-ppsdk-payment-processor-registry';
import { PPSDKStrategy } from './ppsdk-strategy';
import { createContinueHandler, createStepHandler } from './step-handler';

describe('PPSDKStrategy', () => {
    const stepHandler = createStepHandler(createContinueHandler(new FormPoster()));
    const paymentProcessorRegistry = createPaymentProcessorRegistry(createRequestSender(), stepHandler);
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
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                expect(() => strategy.initialize({ methodId: 'cabbagepay' })).not.toThrow();
            });
        });

        describe('when the bigpayBaseUrl is correctly set within store config', () => {
            describe('#execute', () => {
                it('submits the order', () => {
                    const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                    strategy.initialize({ methodId: 'cabbagepay' });
                    strategy.execute({}, { methodId: 'cabbagepay' });

                    expect(store.dispatch).toBeCalledWith(submitSpy.mock.results[0].value);
                });
            });
        });

        describe('when the bigpayBaseUrl is not set within store config', () => {
            describe('#execute', () => {
                it('throws a MissingDataError error', async () => {
                    const store = createCheckoutStore(getCheckoutStoreState());
                    const config = set(getConfig(), 'paymentSettings.bigpayBaseUrl', '');
                    jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(config);

                    const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                    strategy.initialize({ methodId: 'cabbagepay' });

                    await expect(strategy.execute({}, { methodId: 'cabbagepay' }))
                        .rejects.toBeInstanceOf(MissingDataError);
                });
            });
        });
    });

    describe('when initialized with a not yet supported PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                await expect(strategy.initialize({ methodId: 'unsupported-cabbagepay' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when initialized with a non PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                await expect(strategy.initialize({ methodId: 'braintree' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when not successfully initialized', () => {
        describe('#execute', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry);

                await expect(strategy.execute({}, { methodId: '123' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });
});
