import { createAction, Action, DataStore } from '@bigcommerce/data-store';
import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getChasePay, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { ChasePayScriptLoader, JPMC } from '../../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../../payment/strategies/chasepay/chasepay.mock';
import { PaymentActionType } from '../../payment-actions';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategyRegistry from '../../payment-strategy-registry';
import PaymentStrategy from '../payment-strategy';
import WepayRiskClient from '../wepay/wepay-risk-client';

import ChasePayPaymentStrategy from './chasepay-payment-strategy';

describe('ChasePayPaymentStrategy', () => {
    let container: HTMLDivElement;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let chasePayScriptLoader: ChasePayScriptLoader;
    let JPMC: JPMC;
    let requestSender: RequestSender;
    let wepayRiskClient: WepayRiskClient;
    const scriptLoader = createScriptLoader();

    beforeEach(() => {
        paymentMethodMock = { ...getChasePay(), initializationData: { digitalSessionId: 'digitalSessionId', merchantRequestId: '1234567890' } };
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

        jest.spyOn(wepayRiskClient, 'initialize')
            .mockReturnValue(Promise.resolve(wepayRiskClient));

        JPMC = getChasePayScriptMock();

        chasePayScriptLoader = new ChasePayScriptLoader(createScriptLoader());

        jest.spyOn(chasePayScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(JPMC));

        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        orderActionCreator = new OrderActionCreator(createCheckoutClient(), new CheckoutValidator(new CheckoutRequestSender(createRequestSender())));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(createCheckoutClient()), orderActionCreator);
        checkoutActionCreator = new CheckoutActionCreator(new CheckoutRequestSender(createRequestSender()), new ConfigActionCreator(new ConfigRequestSender(requestSender)));
        requestSender = createRequestSender();
        strategy = new ChasePayPaymentStrategy(
            store,
            paymentMethodActionCreator,
            chasePayScriptLoader,
            paymentActionCreator,
            orderActionCreator,
            requestSender,
            createFormPoster(),
            wepayRiskClient,
            paymentStrategyActionCreator, 
            checkoutActionCreator,
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of ChasePayPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(ChasePayPaymentStrategy);
    });

    describe('#initialize()', () => {
        let chasePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            chasePayOptions = { methodId: 'chasepay', chasepay: { container: 'login' } };
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

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith('COMPLETE_CHECKOUT', expect.any(Function));
        });

        it('should initialize the WePay risk client', () => {
            jest.spyOn(wepayRiskClient, 'initialize');

            strategy.initialize(chasePayOptions);

            expect(wepayRiskClient.initialize).toHaveBeenCalled();
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
            chasePayOptions = { methodId: 'chasepay', chasepay: { container: 'login' } };
            paymentMethodMock.initializationData = {
                paymentCryptogram: '11111111111111',
                eci: '11111111111',
                reqTokenId: '111111111',
                expDate: '111111111',
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

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), chasePayOptions);
        });

    });

});
