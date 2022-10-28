import {
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    PaymentIntegrationService
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { BrowserStorage } from 'packages/core/src/common/storage';
import { createSpamProtection, PaymentHumanVerificationHandler } from 'packages/core/src/spam-protection';
import { getOrder } from 'packages/core/src/order/orders.mock';

import { createSubStrategyRegistry } from './create-ppsdk-sub-strategy-registry';
import { PaymentResumer } from './ppsdk-payment-resumer';
import { PPSDKStrategy } from './ppsdk-strategy';
import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';
import { createStepHandler } from './step-handler';
import { createCheckoutStore } from 'packages/core/src/checkout';
import { HostedFormFactory } from 'packages/core/src/hosted-form';
import { getCheckoutStoreState } from 'packages/core/src/checkout/checkouts.mock';

describe('PPSDKStrategy', () => {
    const stepHandler = createStepHandler(new FormPoster(), new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())));
    const requestSender = createRequestSender();
    const browserStorage = new BrowserStorage('ppsdk');
    let paymentIntegrationService: PaymentIntegrationService;
    let subStrategyRegistry: SubStrategyRegistry;
    const paymentResumer = new PaymentResumer(requestSender, stepHandler);
    const completedOrder = getOrder();
    const incompleteOrder = { ...completedOrder, isComplete: false };
    let store: ReturnType<typeof createCheckoutStore>;
    let hostedFormFactory: HostedFormFactory;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        store = createCheckoutStore(getCheckoutStoreState());
        hostedFormFactory = new HostedFormFactory(store);
        subStrategyRegistry = createSubStrategyRegistry(
            paymentIntegrationService,
            requestSender,
            stepHandler,
            hostedFormFactory
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('when initialized with a valid PPSDK payment method', () => {
        describe('#initialize', () => {
            it('does not throw an error', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                await expect(strategy.initialize({ methodId: 'cabbagepay' })).resolves.toBeTruthy();
            });

            it('calls the sub-strategy initialize method', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };
                jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(mockSubStrategy);

                await strategy.initialize({ methodId: 'cabbagepay' });

                expect(mockSubStrategy.initialize).toHaveBeenCalled();
            });
        });

        describe('#deinitialize', () => {
            it('does not throw an error', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                await expect(strategy.deinitialize({ methodId: 'cabbagepay' })).resolves.toBeTruthy();
            });

            it('calls the sub-strategy deinitialize method', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                const mockSubStrategy = { initialize: jest.fn() , deinitialize: jest.fn() };
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
                        const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                        const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };
                        jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(mockSubStrategy);

                        await strategy.initialize({ methodId: 'cabbagepay' });
                        await strategy.execute({}, { methodId: 'cabbagepay' });

                        expect(mockSubStrategy.execute).toHaveBeenCalled();
                    });
                });
            });

            describe('when an order token is not set by the submitOrder call', () => {
                describe('#execute', () => {
                    it('throws a MissingDataError error, does not call the sub-strategy', async () => {
                        const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                        const mockSubStrategy = { execute: jest.fn(), initialize: jest.fn() };
                        jest.spyOn(subStrategyRegistry, 'getByMethod').mockReturnValue(mockSubStrategy);
                        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentTokenOrThrow').mockReturnValue({ token: undefined });

                        await strategy.initialize({ methodId: 'cabbagepay' });

                        await expect(strategy.execute({}, { methodId: 'cabbagepay' }))
                            .rejects.toBeInstanceOf(MissingDataError);

                        expect(mockSubStrategy.execute).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when there is an existing order with a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('calls the payment resumer', async () => {
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrderOrThrow').mockReturnValue(incompleteOrder);
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrderPaymentId').mockReturnValue('abc');
                        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentTokenOrThrow').mockReturnValue({ token: 'some-token' });
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue({ orderId: 'some-order-id' });

                        const resumerSpy = jest.spyOn(paymentResumer, 'resume').mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                        await strategy.finalize({ methodId: 'cabbagepay' });

                        expect(resumerSpy).toHaveBeenCalled();
                    });

                    describe('when the payment resumer throws an error', () => {
                        it('rethrows the error once per unique paymentId, then throws OrderFinalizationNotRequiredError errors instead', async () => {
                            jest.spyOn(paymentIntegrationService.getState(), 'getOrderOrThrow').mockReturnValue(incompleteOrder);
                            jest.spyOn(paymentIntegrationService.getState(), 'getOrderPaymentId').mockReturnValue('first-payment-id');
                            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentTokenOrThrow').mockReturnValue({ token: 'some-token' });
                            jest.spyOn(paymentIntegrationService.getState(), 'getOrder').mockReturnValue({ orderId: 'some-order-id' });
                            jest.spyOn(paymentResumer, 'resume').mockRejectedValue(new Error());

                            const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                            await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                                .rejects.toBeInstanceOf(Error);

                            await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                                .rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);

                            jest.spyOn(paymentIntegrationService.getState(), 'getOrderPaymentId').mockReturnValue('second-payment-id');

                            await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                                .rejects.toBeInstanceOf(Error);

                            await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                                .rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
                        });
                    });
                });
            });

            describe('when there is an existing order, but without a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('throws a OrderFinalizationNotRequiredError error, does not call the payment resumer', async () => {
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrderOrThrow').mockReturnValue(incompleteOrder);
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrderPaymentId').mockReturnValue(undefined);

                        const resumerSpy = jest.spyOn(paymentResumer, 'resume').mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                        await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                            .rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);

                        expect(resumerSpy).not.toHaveBeenCalled();
                    });
                });
            });

            describe('when there is an existing order that is already completed', () => {
                describe('#finalize', () => {
                    it('resolves without needing to call any further endpoints', async () => {
                        jest.spyOn(paymentIntegrationService.getState(), 'getOrderOrThrow').mockReturnValue(completedOrder);
                        const requestSenderGetSpy = jest.spyOn(requestSender, 'get');
                        const requestSenderPostSpy = jest.spyOn(requestSender, 'post');

                        const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                        await expect(strategy.finalize({ methodId: 'cabbagepay' })).resolves.not.toThrow();

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
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                await expect(strategy.initialize({ methodId: 'unsupported-cabbagepay' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when initialized with a non PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                await expect(strategy.initialize({ methodId: 'braintree' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when not successfully initialized', () => {
        describe('#execute', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(paymentIntegrationService, subStrategyRegistry, paymentResumer, browserStorage);

                await expect(strategy.execute({}, { methodId: '123' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });
});
