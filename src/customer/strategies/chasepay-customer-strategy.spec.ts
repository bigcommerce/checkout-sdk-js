import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';

import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '..';
import { getCartState } from '../../cart/internal-carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { getConfigState } from '../../config/configs.mock';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { getChasePay, getPaymentMethodsState } from '../../payment/payment-methods.mock';
import { ChasePayScriptLoader } from '../../payment/strategies/chasepay';
import { ChasePayEventMap, ChasePayScript, JPMC } from '../../payment/strategies/chasepay/chasepay';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { getCustomerState, getRemoteCustomer } from '../internal-customers.mock';

import { ChasePayCustomerStrategy, CustomerStrategy } from './';

describe('ChasePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let customerStrategyActionCreator: CustomerStrategyActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let chasePayScriptLoader: ChasePayScriptLoader;
    let ChasePayScript: ChasePayScript;
    let JPMC: JPMC;
    let requestSender: RequestSender;
    let formPoster;
    let EventType: ChasePayEventMap;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        paymentMethodMock = { ...getChasePay(), initializationData: {digitalSessionId: 'digitalSessionId'} };

        store = createCheckoutStore({
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(createRequestSender());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender);

        JPMC = {} as JPMC;
        JPMC.insertButtons = jest.fn();
        JPMC.isChasePayUp = jest.fn();
        EventType = {} as ChasePayEventMap;
        EventType.START_CHECKOUT = 'startCheckout';
        EventType.COMPLETE_CHECKOUT = 'completeCheckout';

        ChasePayScript = {} as ChasePayScript;
        ChasePayScript.ChasePay = JPMC;
        ChasePayScript.ChasePay.EventType = EventType;
        ChasePayScript.ChasePay.on = jest.fn();

        chasePayScriptLoader = new ChasePayScriptLoader(scriptLoader);
        chasePayScriptLoader.load = jest.fn(() => Promise.resolve(ChasePayScript));

        const client = createCheckoutClient();
        const registry = createCustomerStrategyRegistry(store, client);

        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        customerStrategyActionCreator = new CustomerStrategyActionCreator(registry);
        requestSender = createRequestSender();
        formPoster = createFormPoster();
        strategy = new ChasePayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            chasePayScriptLoader,
            requestSender,
            formPoster
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of ChasePayCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(ChasePayCustomerStrategy);
    });

    describe('#initialize()', () => {
        let chasePayOptions;

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
            ChasePayScript.ChasePay.on = jest.fn((type, callback) => callback);
            await strategy.initialize(chasePayOptions);

            expect(ChasePayScript.ChasePay.on).toHaveBeenCalledWith('startCheckout', expect.any(Function));
            expect(ChasePayScript.ChasePay.on).toHaveBeenCalledWith('completeCheckout', expect.any(Function));
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'chasepay', chasepay: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', async () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const customer = merge({}, getRemoteCustomer(), {
                remote: {
                    provider: 'chasepay',
                },
            });

            jest.spyOn(store.getState().customer, 'getCustomer')
                .mockReturnValue(customer);

            remoteCheckoutActionCreator.signOut = jest.fn(() => 'data');

            await strategy.initialize({ methodId: 'chasepay', chasepay: { container: 'login' } });
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = {
                methodId: 'chasepay',
            };

            await strategy.signOut(options);
            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('chasepay', options);
            expect(store.dispatch).toHaveBeenCalled();
        });
    });
});
