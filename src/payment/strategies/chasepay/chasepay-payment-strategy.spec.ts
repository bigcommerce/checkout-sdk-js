import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getChasePay, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { ChasePayEventType, ChasePayScriptLoader, JPMC } from '../../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../../payment/strategies/chasepay/chasepay.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';
import { WepayRiskClient } from '../wepay';

import ChasePayInitializeOptions from './chasepay-initialize-options';
import ChasePayPaymentStrategy from './chasepay-payment-strategy';

describe('ChasePayPaymentStrategy', () => {
    const testRiskToken = 'test-risk-token';
    let container: HTMLDivElement;
    let walletButton: HTMLAnchorElement;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let chasePayScriptLoader: ChasePayScriptLoader;
    let JPMC: JPMC;
    let requestSender: RequestSender;
    let wepayRiskClient: WepayRiskClient;
    let scriptLoader: ScriptLoader;

    beforeEach(() => {
        paymentMethodMock = { ...getChasePay(), initializationData: { digitalSessionId: 'digitalSessionId', merchantRequestId: '1234567890' } };
        scriptLoader = createScriptLoader();
        wepayRiskClient = new WepayRiskClient(scriptLoader);

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        jest.spyOn(store, 'getState');

        jest.spyOn(wepayRiskClient, 'initialize')
            .mockReturnValue(Promise.resolve(wepayRiskClient));

        jest.spyOn(wepayRiskClient, 'getRiskToken')
            .mockReturnValue(testRiskToken);

        JPMC = getChasePayScriptMock();

        chasePayScriptLoader = new ChasePayScriptLoader(createScriptLoader());

        jest.spyOn(chasePayScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(JPMC));
        jest.spyOn(JPMC.ChasePay, 'isChasePayUp')
            .mockReturnValue(true);
        jest.spyOn(JPMC.ChasePay, 'insertBrandings');
        jest.spyOn(JPMC.ChasePay, 'showLoadingAnimation');
        jest.spyOn(JPMC.ChasePay, 'startCheckout');

        requestSender = createRequestSender();

        const paymentClient = createPaymentClient(store);
        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const configRequestSender = new ConfigRequestSender(createRequestSender());
        const configActionCreator = new ConfigActionCreator(configRequestSender);
        const spamProtection = createSpamProtection(createScriptLoader());
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);

        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(spamProtection)
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer()
        );
        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

        jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction');
        jest.spyOn(requestSender, 'post');
        JPMC.ChasePay.showLoadingAnimation = jest.fn(() => jest.fn(() => {}))
            .mockReturnValue(Promise.resolve(store.getState()));

        strategy = new ChasePayPaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            chasePayScriptLoader,
            wepayRiskClient
        );

        container = document.createElement('div');
        walletButton = document.createElement('a');
        container.setAttribute('id', 'login');
        walletButton.setAttribute('id', 'mockButton');
        document.body.appendChild(container);
        document.body.appendChild(walletButton);

        jest.spyOn(walletButton, 'addEventListener');
        jest.spyOn(walletButton, 'removeEventListener');
        jest.spyOn(requestSender, 'post')
            .mockReturnValue(checkoutActionCreator);
        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout');
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod');
        jest.spyOn(document, 'getElementById');
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(walletButton);
    });

    it('creates an instance of ChasePayPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(ChasePayPaymentStrategy);
    });

    describe('#initialize()', () => {
        let chasePayInitializeOptions: ChasePayInitializeOptions;
        let initializeOptions: PaymentInitializeOptions;

        beforeEach(() => {
            chasePayInitializeOptions = { logoContainer: 'login', walletButton: 'mockButton' };
            initializeOptions = { methodId: 'chasepay', chasepay: chasePayInitializeOptions };
        });

        it('loads chasepay in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads chasepay in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads chasepay without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(initializeOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('registers the start and complete callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((_, callback) => callback);

            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
        });

        it('expect the chasepay complete checkout to call request sender', async () => {
            const payload = {
                sessionToken: '1111111111',
            };

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

            JPMC.ChasePay.on = jest.fn((_, callback) => callback(payload));

            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
            expect(requestSender.post).toBeCalled();
        });

        it('registers the start and cancel callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((_, callback) => callback);

            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CancelCheckout, expect.any(Function));
        });

        it('does not load chasepay if initialization options are not provided', () => {
            initializeOptions = { methodId: 'chasepay'};
            expect(() => strategy.initialize(initializeOptions)).toThrowError(InvalidArgumentError);
            expect(chasePayScriptLoader.load).not.toHaveBeenCalled();
        });

        it('does not load chase  pay if initialization data is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(initializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('does not load chase  pay if store config is not provided', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(initializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('adds the event listener to the wallet button', async () => {
            await strategy.initialize(initializeOptions);

            expect(walletButton.addEventListener).toHaveBeenCalled();
        });

        it('insert the brandings if initialized', async () => {
            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.insertBrandings).toHaveBeenCalledWith({
                color: 'white',
                containers: [chasePayInitializeOptions.logoContainer],
            });
        });

        it('does not insert the branding if logo container does not exist', async () => {
            initializeOptions = { methodId: 'chasepay', chasepay: { logoContainer: '' } };
            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.insertBrandings).not.toHaveBeenCalled();
        });

        it('configure chasepay lightbox', async () => {
            await strategy.initialize(initializeOptions);

            expect(JPMC.ChasePay.configure).toHaveBeenCalled();
        });

        it('configure chasepay lightbox', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(initializeOptions);
            } catch (error) {

                expect(error).toBeInstanceOf(Error);
            }

        });

        it('check if element exist in the DOM', async () => {
            await strategy.initialize(initializeOptions);

            expect(document.getElementById).toHaveBeenCalledWith(chasePayInitializeOptions.logoContainer);
        });

        it('dispatch widget interaction when wallet button is clicked', async () => {
            await strategy.initialize(initializeOptions);

            const chasepayButton = document.getElementById(chasePayInitializeOptions.walletButton || '');

            if (chasepayButton) {
                await chasepayButton.click();
            }

            expect(store.dispatch).toBeCalledWith(expect.any(Observable), { queueId: 'widgetInteraction' });
        });

        it('triggers widget interaction when wallet button is clicked', async () => {
            await strategy.initialize(initializeOptions);

            const chasepayButton = document.getElementById(chasePayInitializeOptions.walletButton || '');

            if (chasepayButton) {
                await chasepayButton.click();
            }

            expect(paymentStrategyActionCreator.widgetInteraction).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        let initializeOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;

        beforeEach(async () => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
            initializeOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login', walletButton: 'mockButton' } };
            paymentMethodMock.initializationData = {
                paymentCryptogram: '11111111111111',
                eci: '11111111111',
                reqTokenId: '111111111',
                expDate: '11/11',
                accountNum: '1111',
                accountMask: '1111',
                transactionId: 'MTExMTExMTEx',
            };

            paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
            await strategy.initialize(initializeOptions);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('calls submit payment with the payment information', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(store.dispatch).toHaveBeenCalled();
        });

        it('calls payment method actioncreator and loads the payment method', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(initializeOptions.methodId);
        });

        it('returns the payment information', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(store.getState).toHaveBeenCalled();
        });

        it('does not execute the payment if initialization data is not provided', async () => {
            paymentMethodMock.initializationData = {};
            try {
                await strategy.execute(orderRequestBody, initializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('pass the options to submitOrder', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), initializeOptions);
        });

        it('expect the wepayRiskClient not to be called', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(wepayRiskClient.initialize).not.toHaveBeenCalled();
        });

        it('expect the not to obtain the risk token', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(wepayRiskClient.getRiskToken).not.toHaveBeenCalled();
        });

        it('expect to get the payment method', async () => {
            await strategy.execute(orderRequestBody, initializeOptions);

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalledWith(initializeOptions.methodId);
        });

        it('initialize wepayRiskClient', async () => {
            initializeOptions = { methodId: 'wepay', chasepay: { logoContainer: 'login' } };
            await strategy.initialize(initializeOptions);

            await strategy.execute(orderRequestBody, initializeOptions);

            expect(wepayRiskClient.initialize).toHaveBeenCalled();
        });

        it('calls get risk token function', async () => {
            initializeOptions = { methodId: 'wepay', chasepay: { logoContainer: 'login' } };
            await strategy.initialize(initializeOptions);

            await strategy.execute(orderRequestBody, initializeOptions);

            expect(wepayRiskClient.getRiskToken).toHaveBeenCalled();
        });

    });

    describe('#deinitialize()', () => {
        let initializeOptions: PaymentInitializeOptions;
        let submitOrderAction: Observable<Action>;

        beforeEach(async () => {
            initializeOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login', walletButton: 'mockButton' } };
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

            await strategy.initialize(initializeOptions);
        });

        it('deinitializes wallet button', async () => {
            await strategy.deinitialize();

            expect(walletButton.removeEventListener).toHaveBeenCalled();
        });

        it('expect to not call the orderActionCreator', async () => {
            await strategy.deinitialize(initializeOptions);

            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
