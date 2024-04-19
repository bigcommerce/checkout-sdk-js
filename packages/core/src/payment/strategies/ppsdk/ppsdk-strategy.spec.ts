import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutRequestSender, CheckoutValidator, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { BrowserStorage } from '../../../common/storage';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';

import { createSubStrategyRegistry } from './create-ppsdk-sub-strategy-registry';
import { PaymentResumer } from './ppsdk-payment-resumer';
import { PPSDKStrategy } from './ppsdk-strategy';
import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';
import { createStepHandler } from './step-handler';

describe('PPSDKStrategy', () => {
    const stepHandler = createStepHandler(
        new FormPoster(),
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );
    const requestSender = createRequestSender();
    let subStrategyRegistry: SubStrategyRegistry;
    const paymentResumer = new PaymentResumer(requestSender, stepHandler);
    const completedOrder = getOrder();
    const incompleteOrder = { ...completedOrder, isComplete: false };
    let store: ReturnType<typeof createCheckoutStore>;
    let orderActionCreator: InstanceType<typeof OrderActionCreator>;
    let hostedFormFactory: HostedFormFactory;
    let submitSpy: jest.SpyInstance;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );
        hostedFormFactory = new HostedFormFactory(store);
        subStrategyRegistry = createSubStrategyRegistry(
            store,
            orderActionCreator,
            requestSender,
            stepHandler,
            hostedFormFactory,
        );
        submitSpy = jest.spyOn(orderActionCreator, 'submitOrder');
        jest.spyOn(store, 'dispatch').mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when initialized with a valid PPSDK payment method', () => {
        describe('#initialize', () => {
            it('does not throw an error', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                await expect(strategy.initialize({ methodId: 'cabbagepay' })).resolves.toBeTruthy();
            });

            it('calls the sub-strategy initialize method', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };

                jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(mockSubStrategy);

                await strategy.initialize({ methodId: 'cabbagepay' });

                expect(mockSubStrategy.initialize).toHaveBeenCalled();
            });
        });

        describe('#deinitialize', () => {
            it('does not throw an error', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                await expect(
                    strategy.deinitialize({ methodId: 'cabbagepay' }),
                ).resolves.toBeTruthy();
            });

            it('calls the sub-strategy deinitialize method', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                const mockSubStrategy = { initialize: jest.fn(), deinitialize: jest.fn() };

                jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(mockSubStrategy);

                await strategy.initialize({ methodId: 'cabbagepay' });
                await strategy.deinitialize({ methodId: 'cabbagepay' });

                expect(mockSubStrategy.deinitialize).toHaveBeenCalled();
            });
        });

        describe('when the bigpayBaseUrl is correctly set within store config', () => {
            describe('when an order token is set by the submitOrder call', () => {
                describe('#execute', () => {
                    it('submits the order and calls the sub-strategy', async () => {
                        const strategy = new PPSDKStrategy(
                            store,
                            orderActionCreator,
                            subStrategyRegistry,
                            paymentResumer,
                            new BrowserStorage('ppsdk'),
                        );

                        const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };

                        jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(
                            mockSubStrategy,
                        );
                        jest.spyOn(store.getState().order, 'getOrderMeta').mockReturnValue({
                            token: 'some-token',
                        });

                        await strategy.initialize({ methodId: 'cabbagepay' });
                        await strategy.execute({}, { methodId: 'cabbagepay' });

                        expect(store.dispatch).toHaveBeenCalledWith(
                            submitSpy.mock.results[0].value,
                        );
                        expect(mockSubStrategy.execute).toHaveBeenCalled();
                    });
                });
            });

            describe('when an order token is not set by the submitOrder call', () => {
                describe('#execute', () => {
                    it('throws a MissingDataError error, does not call the sub-strategy', async () => {
                        const strategy = new PPSDKStrategy(
                            store,
                            orderActionCreator,
                            subStrategyRegistry,
                            paymentResumer,
                            new BrowserStorage('ppsdk'),
                        );

                        const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };

                        jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(
                            mockSubStrategy,
                        );
                        jest.spyOn(store.getState().order, 'getOrderMeta').mockReturnValue({
                            token: undefined,
                        });

                        await strategy.initialize({ methodId: 'cabbagepay' });

                        await expect(
                            strategy.execute({}, { methodId: 'cabbagepay' }),
                        ).rejects.toBeInstanceOf(MissingDataError);

                        expect(store.dispatch).toHaveBeenCalledWith(
                            submitSpy.mock.results[0].value,
                        );
                        expect(mockSubStrategy.execute).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when there is an existing order with a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('calls the payment resumer', async () => {
                        jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(
                            incompleteOrder,
                        );
                        jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue('abc');
                        jest.spyOn(store.getState().order, 'getOrderMeta').mockReturnValue({
                            token: 'some-token',
                        });
                        jest.spyOn(store.getState().order, 'getOrder').mockReturnValue({
                            orderId: 'some-order-id',
                        });

                        const resumerSpy = jest
                            .spyOn(paymentResumer, 'resume')
                            .mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(
                            store,
                            orderActionCreator,
                            subStrategyRegistry,
                            paymentResumer,
                            new BrowserStorage('ppsdk'),
                        );

                        await strategy.finalize({ methodId: 'cabbagepay' });

                        expect(resumerSpy).toHaveBeenCalled();
                    });

                    describe('when the payment resumer throws an error', () => {
                        it('rethrows the error once per unique paymentId, then throws OrderFinalizationNotRequiredError errors instead', async () => {
                            jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(
                                incompleteOrder,
                            );
                            jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue(
                                'first-payment-id',
                            );
                            jest.spyOn(store.getState().order, 'getOrderMeta').mockReturnValue({
                                token: 'some-token',
                            });
                            jest.spyOn(store.getState().order, 'getOrder').mockReturnValue({
                                orderId: 'some-order-id',
                            });
                            jest.spyOn(paymentResumer, 'resume').mockRejectedValue(new Error());

                            const strategy = new PPSDKStrategy(
                                store,
                                orderActionCreator,
                                subStrategyRegistry,
                                paymentResumer,
                                new BrowserStorage('ppsdk'),
                            );

                            await expect(
                                strategy.finalize({ methodId: 'cabbagepay' }),
                            ).rejects.toBeInstanceOf(Error);

                            await expect(
                                strategy.finalize({ methodId: 'cabbagepay' }),
                            ).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);

                            jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue(
                                'second-payment-id',
                            );

                            await expect(
                                strategy.finalize({ methodId: 'cabbagepay' }),
                            ).rejects.toBeInstanceOf(Error);

                            await expect(
                                strategy.finalize({ methodId: 'cabbagepay' }),
                            ).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
                        });
                    });
                });
            });

            describe('when there is an existing order, but without a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('throws a OrderFinalizationNotRequiredError error, does not call the payment resumer', async () => {
                        jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(
                            incompleteOrder,
                        );
                        jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue(
                            undefined,
                        );

                        const resumerSpy = jest
                            .spyOn(paymentResumer, 'resume')
                            .mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(
                            store,
                            orderActionCreator,
                            subStrategyRegistry,
                            paymentResumer,
                            new BrowserStorage('ppsdk'),
                        );

                        await expect(
                            strategy.finalize({ methodId: 'cabbagepay' }),
                        ).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);

                        expect(resumerSpy).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when there is an existing order that is already completed', () => {
                describe('#finalize', () => {
                    it('resolves without needing to call any further endpoints', async () => {
                        jest.spyOn(store.getState().order, 'getOrderOrThrow').mockReturnValue(
                            completedOrder,
                        );

                        const requestSenderGetSpy = jest.spyOn(requestSender, 'get');
                        const requestSenderPostSpy = jest.spyOn(requestSender, 'post');

                        const strategy = new PPSDKStrategy(
                            store,
                            orderActionCreator,
                            subStrategyRegistry,
                            paymentResumer,
                            new BrowserStorage('ppsdk'),
                        );

                        await expect(
                            strategy.finalize({ methodId: 'cabbagepay' }),
                        ).resolves.not.toThrow();

                        expect(requestSenderGetSpy).not.toHaveBeenCalled();
                        expect(requestSenderPostSpy).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });

    describe('when initialized with a not yet supported PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                await expect(
                    strategy.initialize({ methodId: 'unsupported-cabbagepay' }),
                ).rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when initialized with a non PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                await expect(strategy.initialize({ methodId: 'braintree' })).rejects.toBeInstanceOf(
                    NotInitializedError,
                );
            });
        });
    });

    describe('when not successfully initialized', () => {
        describe('#execute', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(
                    store,
                    orderActionCreator,
                    subStrategyRegistry,
                    paymentResumer,
                    new BrowserStorage('ppsdk'),
                );

                await expect(strategy.execute({}, { methodId: '123' })).rejects.toBeInstanceOf(
                    NotInitializedError,
                );
            });
        });
    });
});
