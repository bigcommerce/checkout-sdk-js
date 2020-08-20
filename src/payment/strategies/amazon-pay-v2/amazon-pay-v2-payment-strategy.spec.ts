import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../..';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getResponse } from '../../../common/http-request/responses.mock';
import { FinalizeOrderAction, OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getAmazonPayV2, getPaymentMethodsState } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import { PaymentStrategyActionType } from '../../payment-strategy-actions';
import { getErrorPaymentResponseBody } from '../../payments.mock';

import { AmazonPayV2PaymentProcessor } from '.';
import AmazonPayV2PaymentInitializeOptions from './amazon-pay-v2-payment-initialize-options';
import AmazonPayV2PaymentStrategy from './amazon-pay-v2-payment-strategy';
import { getPaymentMethodMockUndefinedMerchant } from './amazon-pay-v2.mock';
import createAmazonPayV2PaymentProcessor from './create-amazon-pay-v2-payment-processor';

describe('AmazonPayV2PaymentStrategy', () => {
    let amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor;
    let editMethodButton: HTMLDivElement;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let formPoster: FormPoster;
    let orderActionCreator: OrderActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: AmazonPayV2PaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        amazonPayV2PaymentProcessor = createAmazonPayV2PaymentProcessor();
        requestSender = createRequestSender();
        formPoster = createFormPoster();

        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(createScriptLoader());
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const widgetInteractionAction = of(createAction(PaymentStrategyActionType.WidgetInteractionStarted));
        let submitPaymentAction: Observable<SubmitPaymentAction>;

        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentStrategyActionCreator = new PaymentStrategyActionCreator(
            registry,
            orderActionCreator,
            new SpamProtectionActionCreator(spamProtection, new SpamProtectionRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            paymentHumanVerificationHandler
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        paymentMethodMock = getAmazonPayV2();

        editMethodButton = document.createElement('div');
        editMethodButton.setAttribute('id', 'editButtonId');
        document.body.appendChild(editMethodButton);

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(store, 'dispatch');

        jest.spyOn(amazonPayV2PaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(amazonPayV2PaymentProcessor, 'deinitialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(amazonPayV2PaymentProcessor, 'createButton')
            .mockReturnValue(document.createElement('div'));

        jest.spyOn(amazonPayV2PaymentProcessor, 'bindButton')
            .mockImplementation(() => {});

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction')
            .mockImplementation(() => widgetInteractionAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        strategy = new AmazonPayV2PaymentStrategy(store,
            paymentStrategyActionCreator,
            paymentMethodActionCreator,
            orderActionCreator,
            paymentActionCreator,
            amazonPayV2PaymentProcessor
        );
    });

    afterEach(async () => {
        await strategy.deinitialize();

        if (editMethodButton.parentElement === document.body) {
            document.body.removeChild(editMethodButton);
        } else {
            const shippingButton = document.getElementById('editButtonId');
            if (shippingButton) {
                document.body.removeChild(shippingButton);
            }
        }
    });

    it('creates an instance of AmazonPayV2PaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(AmazonPayV2PaymentStrategy);
    });

    describe('#initialize()', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;
        const paymentToken = 'abc123';
        const changeMethodId = 'editButtonId';

        beforeEach(() => {
            amazonpayv2InitializeOptions = { editButtonId: changeMethodId };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
        });

        it('creates the signin button if no paymentToken is present on initializationData', async () => {
            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
            expect(amazonPayV2PaymentProcessor.createButton).toHaveBeenCalledWith(`#AmazonPayButton`, expect.any(Object));
        });

        it('fails to initialize the strategy if there is no payment method data', async () => {
            const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
            const state = { ...getCheckoutStoreState(), paymentMethods };
            store = createCheckoutStore(state);
            strategy = new AmazonPayV2PaymentStrategy(
                store,
                paymentStrategyActionCreator,
                paymentMethodActionCreator,
                orderActionCreator,
                paymentActionCreator,
                amazonPayV2PaymentProcessor
            );

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('initialize the strategy and validates if cart contains physical items', async () => {
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue({...store.getState().cart.getCart(), lineItems: {physicalItems: []}});

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.createButton).toHaveBeenCalled();
        });

        it('fails to initialize the strategy if no methodid is supplied', async () => {
            initializeOptions.methodId = '';

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if config is not initialized', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails initialize the strategy if merchantId is not supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getPaymentMethodMockUndefinedMerchant());

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
        });
        it('binds edit method button if paymentToken is present on initializationData', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
            expect(amazonPayV2PaymentProcessor.bindButton).toHaveBeenCalledWith(changeMethodId, paymentToken, 'changePayment');
            expect(amazonPayV2PaymentProcessor.createButton).not.toHaveBeenCalled();
        });

        it('dispatches widgetInteraction when clicking previously binded edit method button', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            const editButton = document.getElementById(changeMethodId);

            if (editButton) {
                editButton.click();
            }

            expect(paymentStrategyActionCreator.widgetInteraction).toHaveBeenCalled();
        });

        it('does not initialize the paymentProcessor if no options.amazonpayv2 are provided', () => {
            initializeOptions.amazonpay = undefined;

            expect(strategy.initialize(initializeOptions)).rejects.toThrow(InvalidArgumentError);
            expect(amazonPayV2PaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('does not initialize the paymentProcessor if payment method is missing', async () => {
            initializeOptions.methodId = '';

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(InvalidArgumentError);

            expect(amazonPayV2PaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('does not bind edit method button if button do not exist', async () => {
            document.body.removeChild(editMethodButton);
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.createButton).not.toHaveBeenCalled();

            document.body.appendChild(editMethodButton);
        });
    });

    describe('#execute()', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        const paymentToken = 'abc123';

        beforeEach(async () => {
            amazonpayv2InitializeOptions = { editButtonId: 'editButtonId' };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
            orderRequestBody = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'amazonpay',
                },
            };

            await strategy.initialize(initializeOptions);
        });

        it('clicks sign-in button if no paymentToken is found on intializationData', async () => {
            const walletButton = document.getElementById('AmazonPayButton') as HTMLDivElement;
            jest.spyOn(walletButton, 'click');

            strategy.execute(orderRequestBody, initializeOptions);
            await new Promise(resolve => process.nextTick(resolve));

            expect(walletButton.click).toHaveBeenCalled();
        });

        it('starts flow if paymentToken is found on intializationData', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.deinitialize();
            await strategy.initialize(initializeOptions);
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(orderRequestBody, initializeOptions);
        });

        it('fails to execute if strategy is not initialized', async () => {
            await strategy.deinitialize();

            return expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(NotInitializedError);
        });

        it('fails to execute if payment method is not found', () => {
            orderRequestBody.payment = { methodId: '' };

            expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to execute if payment argument is invalid', () => {
            orderRequestBody.payment = undefined;

            expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('redirects to Amazon url', async () => {
            const error = new RequestError(getResponse({
                ...getErrorPaymentResponseBody(),
                status: 'additional_action_required',
                additional_action_required: {
                    type: 'external_redirect',
                    data: {
                        redirect_url: 'http://some-url',
                    },
                } ,
            }));
            window.location.replace = jest.fn();

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, error)));

            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.deinitialize();
            await strategy.initialize(initializeOptions);
            strategy.execute(orderRequestBody, initializeOptions);
            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.replace).toBeCalledWith('http://some-url');
        });

        it('does not redirect to Amazon url', async () => {
            const response = new RequestError(getResponse(getErrorPaymentResponseBody()));
            window.location.replace = jest.fn();

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, response)));

            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(paymentMethodMock);

            await strategy.deinitialize();
            await strategy.initialize(initializeOptions);
            await expect(strategy.execute(orderRequestBody, initializeOptions)).rejects.toThrow(response);
            await new Promise(resolve => process.nextTick(resolve));

            expect(window.location.replace).not.toBeCalledWith('http://some-url');
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        let amazonpayv2InitializeOptions: AmazonPayV2PaymentInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;

        beforeEach(async () => {
            amazonpayv2InitializeOptions = { editButtonId: 'editButtonId' };
            initializeOptions = { methodId: 'amazonpay', amazonpay: amazonpayv2InitializeOptions };
            await strategy.initialize(initializeOptions);
        });

        it('expect to deinitialize the payment processor', async () => {
            await strategy.deinitialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.deinitialize).toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            expect(document.getElementById('AmazonPayButton')).not.toBeNull();
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
            expect(document.getElementById('AmazonPayButton')).toBeNull();
        });
    });
});
