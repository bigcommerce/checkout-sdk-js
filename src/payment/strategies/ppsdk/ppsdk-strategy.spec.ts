import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore, CheckoutRequestSender, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { NotInitializedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';

import { createPaymentProcessorRegistry } from './create-ppsdk-payment-processor-registry';
import { PaymentResumer } from './ppsdk-payment-resumer';
import { PPSDKStrategy } from './ppsdk-strategy';
import { createStepHandler } from './step-handler';

describe('PPSDKStrategy', () => {
    const stepHandler = createStepHandler(new FormPoster());
    const requestSender = createRequestSender();
    const paymentProcessorRegistry = createPaymentProcessorRegistry(requestSender, stepHandler);
    const paymentResumer = new PaymentResumer(requestSender, stepHandler);
    let store: ReturnType<typeof createCheckoutStore>;
    let orderActionCreator: InstanceType<typeof OrderActionCreator>;
    let submitSpy: jest.SpyInstance;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
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
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                await expect(strategy.initialize({ methodId: 'cabbagepay' })).resolves.toBeTruthy();
            });
        });

        describe('when the bigpayBaseUrl is correctly set within store config', () => {
            describe('#execute', () => {
                it('submits the order and calls the payment processor', async () => {
                    const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                    const mockPaymentProcessor = { process: jest.fn() };
                    jest.spyOn(paymentProcessorRegistry, 'getByMethod').mockReturnValue(mockPaymentProcessor);

                    await strategy.initialize({ methodId: 'cabbagepay' });
                    await strategy.execute({}, { methodId: 'cabbagepay' });

                    expect(store.dispatch).toBeCalledWith(submitSpy.mock.results[0].value);
                    expect(mockPaymentProcessor.process).toHaveBeenCalled();
                });
            });

            describe('when there is an existing order with a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('calls the payment resumer', async () => {
                        const store = createCheckoutStore(getCheckoutStoreState());

                        jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue('abc');

                        const resumerSpy = jest.spyOn(paymentResumer, 'resume').mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                        await strategy.finalize({ methodId: 'cabbagepay' });

                        expect(resumerSpy).toHaveBeenCalled();
                    });
                });
            });

            describe('when there is an existing order, but without a matching PPSDK Payment', () => {
                describe('#finalize', () => {
                    it('throws a OrderFinalizationNotRequiredError error, does not call the payment resumer', async () => {
                        const store = createCheckoutStore(getCheckoutStoreState());

                        jest.spyOn(store.getState().order, 'getPaymentId').mockReturnValue(undefined);

                        const resumerSpy = jest.spyOn(paymentResumer, 'resume').mockResolvedValue(undefined);

                        const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                        await expect(strategy.finalize({ methodId: 'cabbagepay' }))
                            .rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);

                        expect(resumerSpy).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });

    describe('when initialized with a not yet supported PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                await expect(strategy.initialize({ methodId: 'unsupported-cabbagepay' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when initialized with a non PPSDK payment method', () => {
        describe('#initialize', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                await expect(strategy.initialize({ methodId: 'braintree' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });

    describe('when not successfully initialized', () => {
        describe('#execute', () => {
            it('throws a NotInitializedError error', async () => {
                const strategy = new PPSDKStrategy(store, orderActionCreator, paymentProcessorRegistry, paymentResumer);

                await expect(strategy.execute({}, { methodId: '123' }))
                    .rejects.toBeInstanceOf(NotInitializedError);
            });
        });
    });
});
