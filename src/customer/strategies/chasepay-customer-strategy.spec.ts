import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../cart/carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { getCheckoutState } from '../../checkout/checkouts.mock';
import { getConfigState } from '../../config/configs.mock';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { getChasePay, getPaymentMethodsState } from '../../payment/payment-methods.mock';
import { ChasePayScriptLoader, JPMC } from '../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../payment/strategies/chasepay/chasepay.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { CustomerInitializeOptions } from '../customer-request-options';
import { getCustomerState } from '../customers.mock';

import ChasePayCustomerStrategy from './chasepay-customer-strategy';
import CustomerStrategy from './customer-strategy';

describe('ChasePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let chasePayScriptLoader: ChasePayScriptLoader;
    let JPMC: JPMC;
    let requestSender: RequestSender;
    let formPoster;

    beforeEach(() => {
        paymentMethodMock = { ...getChasePay(), initializationData: { digitalSessionId: 'digitalSessionId', merchantRequestId: '1234567890' } };

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

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );

        JPMC = getChasePayScriptMock();

        chasePayScriptLoader = new ChasePayScriptLoader(createScriptLoader());

        jest.spyOn(chasePayScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(JPMC));

        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
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
        let chasePayOptions: CustomerInitializeOptions;

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

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith('START_CHECKOUT', expect.any(Function));
            expect(JPMC.ChasePay.on).toHaveBeenCalledWith('COMPLETE_CHECKOUT', expect.any(Function));
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
            const paymentId = {
                providerId: 'chasepay',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

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
