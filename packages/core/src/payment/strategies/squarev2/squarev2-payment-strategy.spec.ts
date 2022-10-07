import { createCheckoutStore, CheckoutStore, CheckoutRequestSender, CheckoutValidator } from '../../../checkout';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import { createScriptLoader } from '@bigcommerce/script-loader';
import SquareV2ScriptLoader from './squarev2-script-loader';
import { createPaymentClient, PaymentActionCreator, PaymentInitializeOptions, PaymentRequestSender, PaymentRequestTransformer } from '../..';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { Observable, of } from 'rxjs';
import { createAction } from '@bigcommerce/data-store';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfig } from '../../../config/configs.mock';

describe('SquareV2PaymentStrategy', () => {
    let store: CheckoutStore;
    let strategy: SquareV2PaymentStrategy;
    let processor: SquareV2PaymentProcessor;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let options: PaymentInitializeOptions;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        const requestSender = createRequestSender();

        store = createCheckoutStore(getCheckoutStoreState());

        processor = new SquareV2PaymentProcessor(
            new SquareV2ScriptLoader(scriptLoader),
            store
        );

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient(store)),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader))
        );

        jest.spyOn(processor, 'initialize')
            .mockResolvedValue(undefined);

        jest.spyOn(processor, 'deinitialize')
            .mockResolvedValue(undefined);

        jest.spyOn(processor, 'initializeCard')
            .mockResolvedValue(undefined);

        jest.spyOn(processor, 'tokenize')
            .mockResolvedValue('cnon:xxx');

        jest.spyOn(processor, 'verifyBuyer')
            .mockResolvedValue('verf:yyy');

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new SquareV2PaymentStrategy(
            store,
            processor,
            orderActionCreator,
            paymentActionCreator
        );

        options = {
            methodId: 'squarev2',
            squarev2: {
                containerId: 'card-container',
                style: { input: { color: 'foo' } },
                onValidationChange: () => {},
            },
        };
    });

    describe('#initialize', () => {
        afterEach(async () => {
            await processor.deinitialize();
        });

        it('initializes the strategy successfully', async () => {
            const initialize = strategy.initialize(options);

            await expect(initialize).resolves.toBe(store.getState());
        });

        it('should initialize the processor', async () => {
            await strategy.initialize(options);

            expect(processor.initialize).toHaveBeenCalledWith({
                applicationId: 'test',
                locationId: 'foo',
                testMode: true,
            });
        });

        it('should initialize the card', async () => {
            await strategy.initialize(options);

            expect(processor.initializeCard).toHaveBeenCalledWith(options.squarev2);
        });

        describe('should fail if...', () => {
            test('containerId is not provided', async () => {
                delete options.squarev2;

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
                expect(processor.initialize).not.toHaveBeenCalled();
                expect(processor.initializeCard).not.toHaveBeenCalled();
            });

            test('there is no payment method data', async () => {
                options.methodId = '';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(MissingDataError);
                expect(processor.initialize).not.toHaveBeenCalled();
                expect(processor.initializeCard).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'squarev2',
                },
            };

            await strategy.initialize(options);
        });

        afterEach(async () => {
            await processor.deinitialize();
        });

        it('executes the strategy successfully', async () => {
            const execute = strategy.execute(payload);

            await expect(execute).resolves.toBe(store.getState());
        });

        it('should tokenize the card to get the nonce', async () => {
            await strategy.execute(payload);

            expect(processor.tokenize).toHaveBeenCalled();
        });

        it('should verify the buyer to get the verification token', async () => {
            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3828.add_3ds_support_on_squarev2': true,
            };
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                .mockReturnValue(storeConfigMock);

            await strategy.execute(payload);

            expect(processor.verifyBuyer).toHaveBeenCalledWith('cnon:xxx');
        });

        it('should submit the order', async () => {
            jest.spyOn(store, 'dispatch');

            await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenNthCalledWith(1, submitOrderAction);
        });

        it('should submit the payment', async () => {
            const expectedPayment = {
                methodId: 'squarev2',
                paymentData: { nonce: 'cnon:xxx' },
            };
            jest.spyOn(store, 'dispatch');

            await strategy.execute(payload);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(store.dispatch).toHaveBeenNthCalledWith(2, submitPaymentAction);
        });

        it('should submit the payment with verification token', async () => {
            const expectedPayment = {
                methodId: 'squarev2',
                paymentData: { nonce: '{"nonce":"cnon:xxx","token":"verf:yyy"}' },
            };
            const storeConfigMock = getConfig().storeConfig;
            storeConfigMock.checkoutSettings.features = {
                'PROJECT-3828.add_3ds_support_on_squarev2': true,
            };
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow')
                .mockReturnValue(storeConfigMock);

            await strategy.execute(payload);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });
    });

    describe('#finalize', () => {
        it('throws error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes the strategy successfully', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBe(store.getState());
        });

        it('should deinitialize the processor', async () => {
            await strategy.deinitialize();

            expect(processor.deinitialize).toHaveBeenCalled();
        });
    });
});
