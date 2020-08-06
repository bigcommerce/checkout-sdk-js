import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentInitializeOptions, PaymentMethod, PaymentMethodRequestSender, PaymentRequestSender } from '../../../payment';
import { getBolt } from '../../../payment/payment-methods.mock';
import { getBoltScriptMock } from '../../../payment/strategies/bolt/bolt.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { BoltCheckout } from './bolt';
import BoltAppPaymentStrategy from './bolt-app-payment-strategy';
import BoltScriptLoader from './bolt-script-loader';

describe('BoltAppPaymentStrategy', () => {
    let applyStoreCreditAction: Observable<Action>;
    let boltClient: BoltCheckout;
    let boltScriptLoader: BoltScriptLoader;
    let checkoutMock: Checkout;
    let options: PaymentRequestOptions;
    let orderActionCreator: OrderActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: BoltAppPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let storeCreditActionCreator: StoreCreditActionCreator;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodMock = getBolt();
        const scriptLoader = createScriptLoader();
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
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender)
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        boltClient = getBoltScriptMock(true);
        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        checkoutMock = getCheckout();

        payload = {
            payment: {
                methodId: 'bolt',
                paymentData: {
                    nonce: 'fooNonce',
                },
            },
        };
        options = { methodId: 'bolt' };

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);
        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);
        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow')
            .mockReturnValue(checkoutMock);
        jest.spyOn(boltScriptLoader, 'load')
            .mockResolvedValue(boltClient);
        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit')
            .mockReturnValue(applyStoreCreditAction);

        strategy = new BoltAppPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            boltScriptLoader
        );
    });

    describe('#initialize', () => {
        it('successfully initializes the bolt strategy and loads the bolt client', async () => {
            await expect(strategy.initialize(options)).resolves.toEqual(store.getState());
            expect(boltScriptLoader.load).toHaveBeenCalledWith('publishableKey', true);
        });

        it('fails to initialize the bolt strategy if publishableKey is not provided', async () => {
            paymentMethodMock.initializationData.publishableKey = null;
            await expect(strategy.initialize(options)).rejects.toThrow(MissingDataError);
            expect(boltScriptLoader.load).not.toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        let options: PaymentInitializeOptions;
        const expectedPayment = {
            methodId: 'bolt',
            paymentData: {
                nonce: 'transactionReference',
            },
        };
        options = {
            methodId: 'bolt',
        };

        it('successfully executes the bolt strategy and submits payment', async () => {
            const expectedCart = {
              orderToken: 'clientToken',
            };
            const expectedCallbacks = {
              success: expect.any(Function),
              close: expect.any(Function),
            };

            await strategy.initialize(options);
            await strategy.execute(payload);
            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(boltClient.configure).toHaveBeenCalledWith(expect.objectContaining(expectedCart), {}, expect.objectContaining(expectedCallbacks));
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt straregy and applies store credit', async () => {
            const expectedCart = {
              orderToken: 'clientToken',
            };
            const expectedCallbacks = {
              success: expect.any(Function),
              close: expect.any(Function),
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.initialize(options);
            await strategy.execute(payload);
            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(boltClient.configure).toHaveBeenCalledWith(expect.objectContaining(expectedCart), {}, expect.objectContaining(expectedCallbacks));
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('fails to execute the bolt strategy if no payment is provided', async () => {
            payload.payment = undefined;
            await strategy.initialize(options);
            await expect(strategy.execute(payload)).rejects.toThrow(InvalidArgumentError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no client token is provided', async () => {
            paymentMethodMock.clientToken = undefined;
            await strategy.initialize(options);
            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if the client script is not loaded', async () => {
            jest.spyOn(boltScriptLoader, 'load')
                .mockResolvedValue(undefined);
            await strategy.initialize(options);
            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled', async () => {
            boltClient = getBoltScriptMock(false);
            jest.spyOn(boltScriptLoader, 'load')
                .mockResolvedValue(boltClient);
            await strategy.initialize(options);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodCancelledError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const zipOptions: PaymentInitializeOptions = { methodId: 'zip' };
            await strategy.initialize(zipOptions);
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
