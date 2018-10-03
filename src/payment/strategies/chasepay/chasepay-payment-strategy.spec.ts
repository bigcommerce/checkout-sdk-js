import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import InvalidArgumentError from '../../../common/error/errors/invalid-argument-error';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getChasePay, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { ChasePayEventType, ChasePayScriptLoader, JPMC } from '../../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../../payment/strategies/chasepay/chasepay.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';
import WepayRiskClient from '../wepay/wepay-risk-client';

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
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);

        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        orderActionCreator = new OrderActionCreator(paymentClient, new CheckoutValidator(new CheckoutRequestSender(createRequestSender())));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
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
        let chasePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login', walletButton: 'mockButton' } };
        });

        it('loads chasepay in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(chasePayOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads chasepay in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(chasePayOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads chasepay without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(chasePayOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('registers the start and complete callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((type, callback) => callback);

            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
        });

        it('expect the chasepay complete checkout to call request sender', async () => {
            const payload = {
                sessionToken: '1111111111',
            };

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

            JPMC.ChasePay.on = jest.fn((type, callback) => callback(payload));

            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
            expect(requestSender.post).toBeCalled();
        });

        it('registers the start and cancel callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((type, callback) => callback);

            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CancelCheckout, expect.any(Function));
        });

        it('does not load chasepay if initialization options are not provided', async () => {
            chasePayOptions = { methodId: 'chasepay'};
            expect(() => strategy.initialize(chasePayOptions)).toThrowError(InvalidArgumentError);
            expect(chasePayScriptLoader.load).not.toHaveBeenCalled();
        });

        it('does not load chase  pay if initialization data is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('does not load chase  pay if store config is not provided', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('adds the event listener to the wallet button', async () => {
            await strategy.initialize(chasePayOptions);

            expect(walletButton.addEventListener).toHaveBeenCalled();
        });

        it('insert the brandings if initialized', async () => {
            if (chasePayOptions.chasepay) {
                await strategy.initialize(chasePayOptions);

                expect(JPMC.ChasePay.insertBrandings).toHaveBeenCalledWith({
                    color: 'white',
                    containers: [chasePayOptions.chasepay.logoContainer],
                });
            }
        });

        it('does not insert the branding if logo container does not exist', async () => {
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: '' } };
            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.insertBrandings).not.toHaveBeenCalled();
        });

        it('configure chasepay lightbox', async () => {
            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.configure).toHaveBeenCalled();
        });

        it('configure chasepay lightbox', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {

                expect(error).toBeInstanceOf(Error);
            }

        });

        it('check if element exist in the DOM', async () => {
            if (chasePayOptions.chasepay) {
                await strategy.initialize(chasePayOptions);

                expect(document.getElementById).toHaveBeenCalledWith(chasePayOptions.chasepay.logoContainer);
            }

        });

        it('dispatch widget interaction when wallet button is clicked', async () => {
            if (chasePayOptions.chasepay) {
                await strategy.initialize(chasePayOptions);

                const chasepayButton = document.getElementById(chasePayOptions.chasepay.walletButton || '');

                if (chasepayButton) {
                    await chasepayButton.click();
                }

                expect(store.dispatch).toBeCalledWith(expect.any(Function), { queueId: 'widgetInteraction' });
            }
        });

        it('triggers widget interaction when wallet button is clicked', async () => {
            if (chasePayOptions.chasepay) {
                await strategy.initialize(chasePayOptions);

                const chasepayButton = document.getElementById(chasePayOptions.chasepay.walletButton || '');

                if (chasepayButton) {
                    await chasepayButton.click();
                }

                expect(paymentStrategyActionCreator.widgetInteraction).toHaveBeenCalled();
            }
        });
    });

    describe('#execute()', () => {
        let chasePayOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;

        beforeEach(async () => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login', walletButton: 'mockButton' } };
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
            await strategy.initialize(chasePayOptions);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('calls submit payment with the payment information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(store.dispatch).toHaveBeenCalled();
        });

        it('calls payment method actioncreator and loads the payment method', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith(chasePayOptions.methodId);
        });

        it('returns the payment information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(store.getState).toHaveBeenCalled();
        });

        it('does not execute the payment if initialization data is not provided', async () => {
            paymentMethodMock.initializationData = {};
            try {
                await strategy.execute(orderRequestBody, chasePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('pass the options to submitOrder', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), chasePayOptions);
        });

        it('expect the wepayRiskClient not to be called', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(wepayRiskClient.initialize).not.toHaveBeenCalled();
        });

        it('expect the not to obtain the risk token', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(wepayRiskClient.getRiskToken).not.toHaveBeenCalled();
        });

        it('expect to get the payment method', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalledWith(chasePayOptions.methodId);
        });

        it('initialize wepayRiskClient', async () => {
            if (chasePayOptions.chasepay) {
                chasePayOptions = { methodId: 'wepay', chasepay: { logoContainer: 'login' } };
                await strategy.initialize(chasePayOptions);

                await strategy.execute(orderRequestBody, chasePayOptions);

                expect(wepayRiskClient.initialize).toHaveBeenCalled();
            }
        });

        it('calls get risk token function', async () => {
            if (chasePayOptions.chasepay) {
                chasePayOptions = { methodId: 'wepay', chasepay: { logoContainer: 'login' } };
                await strategy.initialize(chasePayOptions);

                await strategy.execute(orderRequestBody, chasePayOptions);

                expect(wepayRiskClient.getRiskToken).toHaveBeenCalled();
            }
        });

    });

    describe('#deinitialize()', () => {
        let chasePayOptions: PaymentInitializeOptions;
        let submitOrderAction: Observable<Action>;

        beforeEach(async () => {
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login', walletButton: 'mockButton' } };
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

            await strategy.initialize(chasePayOptions);
        });

        it('deinitializes wallet button', async () => {
            if (chasePayOptions.chasepay) {
                await strategy.deinitialize();

                expect(walletButton.removeEventListener).toHaveBeenCalled();
            }
        });

        it('expect to not call the orderActionCreator', async () => {
            await strategy.deinitialize(chasePayOptions);

            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });

    });

});
