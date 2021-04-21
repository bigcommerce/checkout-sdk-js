import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentMethod, PaymentRequestSender } from '../../../payment';
import { getMoneris } from '../../../payment/payment-methods.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';

import MonerisPaymentStrategy from './moneris-payment-strategy';

describe('MonerisPaymentStrategy', () => {
    const containerId = 'moneris_iframe_container';
    const iframeId = 'moneris-payment-iframe';
    let applyStoreCreditAction: Observable<Action>;
    let checkoutMock: Checkout;
    let container: HTMLDivElement;
    let eventEmitter: EventEmitter;
    let initializeOptions: PaymentInitializeOptions;
    let options: PaymentRequestOptions;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentMethodMock: PaymentMethod;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let paymentRequestSender: PaymentRequestSender;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let strategy: MonerisPaymentStrategy;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    let submitOrderAction: Observable<SubmitOrderAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentRequestTransformer = new PaymentRequestTransformer();
        paymentRequestSender = new PaymentRequestSender(createPaymentClient());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            paymentRequestTransformer,
            paymentHumanVerificationHandler
        );

        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        eventEmitter = new EventEmitter();
        paymentMethodMock = getMoneris();
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender)
        );

        initializeOptions = {
            methodId: 'moneris',
            moneris: {
                containerId,
            },
        };

        checkoutMock = getCheckout();

        options = { methodId: 'moneris' };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: 'moneris',
                paymentData: null,
            },
        });

        container = document.createElement('div');
        container.setAttribute('id', containerId);
        document.body.appendChild(container);

        jest.spyOn(document, 'getElementById');
        jest.spyOn(document, 'createElement');
        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
            .mockReturnValue(paymentMethodMock);

        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit')
            .mockReturnValue(applyStoreCreditAction);

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.addListener(type, listener);
            });

        jest.spyOn(window, 'removeEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.removeListener(type, listener);
            });

        strategy = new MonerisPaymentStrategy(store, orderActionCreator, paymentActionCreator, storeCreditActionCreator);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize', () => {
        it('successfully initializes moneris strategy and creates the iframe', async () => {
            await expect(strategy.initialize(initializeOptions)).resolves.toEqual(store.getState());

            expect(document.getElementById).toHaveBeenCalledWith(containerId);
            expect(document.createElement).toHaveBeenCalledWith('iframe');
        });

        it('initializes moneris iframe and sets src to the live environment', async () => {
            paymentMethodMock.config.testMode = false;
            await expect(strategy.initialize(initializeOptions)).resolves.toEqual(store.getState());

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
            expect(iframe).toBeTruthy();
            expect(iframe.src).toMatch(/www3.moneris.com/);
        });

        it('initializes moneris iframe and sets src to the test environment', async () => {
            paymentMethodMock.config.testMode = true;
            await expect(strategy.initialize(initializeOptions)).resolves.toEqual(store.getState());

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
            expect(iframe).toBeTruthy();
            expect(iframe.src).toMatch(/esqa.moneris.com/);
        });

        it('fails to initialize moneris strategy when initialization options are not provided', () => {
            initializeOptions.moneris = undefined;
            expect(() => strategy.initialize(initializeOptions)).toThrow(InvalidArgumentError);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
            expect(iframe).toBeFalsy();
        });

        it('fails to initialize moneris strategy when initialization data is missing', () => {
            paymentMethodMock.initializationData = undefined;
            expect(() => strategy.initialize(initializeOptions)).toThrow(MissingDataError);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
            expect(iframe).toBeFalsy();
        });
    });

    describe('#execute', () => {
        it('successfully executes moneris strategy and submits payment', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    nonce: 'ABC123',
                },
            };
            checkoutMock.isStoreCreditApplied = true;

            await strategy.initialize(initializeOptions);
            const promise =  strategy.execute(payload, options);

            await new Promise(resolve => process.nextTick(resolve));

            eventEmitter.emit('message', { data: '{\"responseCode\":[\"001\"],\"errorMessage\":null,\"dataKey\":\"ABC123\",\"bin\":\"1234\"}'});

            await promise;

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('throws error when moneris response is not successful', async () => {
            await strategy.initialize(initializeOptions);
            const promise =  strategy.execute(payload, options);

            await new Promise(resolve => process.nextTick(resolve));

            eventEmitter.emit('message', { data: '{\"responseCode\":[\"400\"],\"errorMessage\":\"expected error message\",\"dataKey\":\"ABC123\",\"bin\":\"1234\"}'});

            await expect(promise).rejects.toThrow(new Error('expected error message'));
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to executes moneris strategy when payment is not provided', async () => {
            payload.payment = undefined;
            await strategy.initialize(initializeOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);

            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy and removes event listener if set', async () => {
            await strategy.initialize(initializeOptions);
            const promise =  strategy.execute(payload, options);

            await new Promise(resolve => process.nextTick(resolve));

            eventEmitter.emit('message', { data: '{\"responseCode\":[\"400\"],\"errorMessage\":\"expected error message\",\"dataKey\":\"ABC123\",\"bin\":\"1234\"}'});

            await expect(promise).rejects.toThrow(new Error('expected error message'));

            expect(await strategy.deinitialize()).toEqual(store.getState());
            expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
