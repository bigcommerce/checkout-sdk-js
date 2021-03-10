import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, Checkout, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentInitializeOptions, PaymentMethod, PaymentMethodRequestSender, PaymentRequestSender } from '../../../payment';
import { getBolt } from '../../../payment/payment-methods.mock';
import { getBoltScriptMock } from '../../../payment/strategies/bolt/bolt.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { StoreCreditActionCreator, StoreCreditActionType, StoreCreditRequestSender } from '../../../store-credit';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { BoltCheckout } from './bolt';
import BoltPaymentStrategy from './bolt-payment-strategy';
import BoltScriptLoader from './bolt-script-loader';

describe('BoltPaymentStrategy', () => {
    let applyStoreCreditAction: Observable<Action>;
    let boltClient: BoltCheckout;
    let boltClientScriptInitializationOptions: PaymentInitializeOptions;
    let boltScriptLoader: BoltScriptLoader;
    let boltTakeOverInitializationOptions: PaymentInitializeOptions;
    let checkoutMock: Checkout;
    let requestSender: RequestSender;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let scriptLoader: ScriptLoader;
    let store: CheckoutStore;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let strategy: BoltPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        paymentMethodMock = getBolt();
        scriptLoader = createScriptLoader();
        requestSender = createRequestSender();
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentRequestTransformer = new PaymentRequestTransformer();
        paymentRequestSender = new PaymentRequestSender(createPaymentClient());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(scriptLoader));
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
                    nonce: 'transactionReference',
                },
            },
        };
        boltClientScriptInitializationOptions = { methodId: 'bolt', bolt: { useBigCommerceCheckout: true }};
        boltTakeOverInitializationOptions = { methodId: 'bolt' };

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

        strategy = new BoltPaymentStrategy(
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
            await expect(strategy.initialize(boltClientScriptInitializationOptions)).resolves.toEqual(store.getState());
            expect(boltScriptLoader.load).toHaveBeenCalledWith('publishableKey', true, undefined);
        });

        it('successfully initializes the bolt strategy and loads the bolt client with developer params', async () => {
            paymentMethodMock.initializationData.developerConfig = { developerMode: 'bolt_sandbox', developerDomain: '' };
            await expect(strategy.initialize(boltClientScriptInitializationOptions)).resolves.toEqual(store.getState());
            expect(boltScriptLoader.load).toHaveBeenCalledWith('publishableKey', true, paymentMethodMock.initializationData.developerConfig);
        });

        it('fails to initialize the bolt strategy if publishableKey is not provided', async () => {
            paymentMethodMock.initializationData.publishableKey = null;
            await expect(strategy.initialize(boltClientScriptInitializationOptions)).rejects.toThrow(MissingDataError);
            expect(boltScriptLoader.load).not.toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy without loading the bolt client', async () => {
            await expect(strategy.initialize(boltTakeOverInitializationOptions)).resolves.toEqual(store.getState());
            expect(boltScriptLoader.load).not.toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        const expectedPayment = {
            methodId: 'bolt',
            paymentData: {
                nonce: 'transactionReference',
            },
        };

        it('successfully executes the bolt strategy and submits payment when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);
            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(boltClient.configure).toHaveBeenCalledWith(expect.objectContaining(expectedCart), {}, expect.objectContaining(expectedCallbacks));
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy and applies store credit when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);
            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(boltClient.configure).toHaveBeenCalledWith(expect.objectContaining(expectedCart), {}, expect.objectContaining(expectedCallbacks));
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy with checkout takeover', async () => {
            await strategy.initialize(boltTakeOverInitializationOptions);
            await strategy.execute(payload);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no payment is provided when using bolt client', async () => {
            payload.payment = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no client token is provided when using bolt client', async () => {
            paymentMethodMock.clientToken = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if the client script is not loaded when using bolt client', async () => {
            jest.spyOn(boltScriptLoader, 'load')
                .mockResolvedValue(undefined);
            await strategy.initialize(boltClientScriptInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled when using bolt client', async () => {
            boltClient = getBoltScriptMock(false);
            jest.spyOn(boltScriptLoader, 'load')
                .mockResolvedValue(boltClient);
            await strategy.initialize(boltClientScriptInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodCancelledError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment is provided with checkout takeover', async () => {
            payload.payment = undefined;

            await strategy.initialize(boltTakeOverInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no method id is provided with checkout takeover', async () => {
            payload.payment = {
                methodId: '',
            };

            await strategy.initialize(boltTakeOverInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no nonce is provided with checkout takeover', async () => {
            payload.payment = {
                methodId: 'bolt',
                paymentData: { },
            };

            await strategy.initialize(boltTakeOverInitializationOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await strategy.initialize(boltClientScriptInitializationOptions);
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
