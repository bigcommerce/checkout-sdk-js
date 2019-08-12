import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getChasePay, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { ChasePayEventType, ChasePayScriptLoader, JPMC } from '../../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../../payment/strategies/chasepay/chasepay.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import ChasePayCustomerStrategy from './chasepay-customer-strategy';

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

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
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

        it('does not load chasepay if initialization options are not provided', () => {
            chasePayOptions = { methodId: 'chasepay' };
            expect(() => strategy.initialize(chasePayOptions)).toThrowError(InvalidArgumentError);
            expect(chasePayScriptLoader.load).not.toHaveBeenCalled();
        });

        it('does not load chase  pay if initialization data is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {
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

        it('sets the configuration for chasepay lightbox', async () => {
            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.insertButtons).toHaveBeenCalled();
        });

        it('sets the configuration for chasepay lightbox', async () => {
            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.configure).toHaveBeenCalled();
        });

        it('fails to initialize the strategy if no methodid is supplied', async () => {
            chasePayOptions = { methodId: undefined, chasepay: { container: 'login' } };
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if no cart is supplied', async () => {
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('fails to initialize the strategy if no digitalSessionID is supplied', async () => {
            paymentMethodMock.initializationData.digitalSessionId = undefined;
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(NotInitializedError);
            }
        });

        it('registers the start and complete callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((_, callback) => callback);

            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.StartCheckout, expect.any(Function));
            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
        });

        it('fails to initialize the strategy if no methodid is supplied', async () => {
            chasePayOptions = { methodId: undefined, chasepay: { container: 'login' } };
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if no cart is supplied', async () => {
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('fails to initialize the strategy if no digitalSessionID is supplied', async () => {
            paymentMethodMock.initializationData.digitalSessionId = undefined;
            try {
                await strategy.initialize(chasePayOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'chasepay', chasepay: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', () => {
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
