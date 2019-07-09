import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getMasterpass, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { Masterpass, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { getMasterpassScriptMock } from '../../../payment/strategies/masterpass/masterpass.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import MasterpassCustomerStrategy from './masterpass-customer-strategy';

describe('MasterpassCustomerStrategy', () => {
    let container: HTMLDivElement;
    let masterpass: Masterpass;
    let masterpassScriptLoader: MasterpassScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        paymentMethodMock = {
            ...getMasterpass(),
            initializationData: {
                checkoutId: 'checkoutId',
                allowedCardTypes: ['visa', 'amex', 'mastercard'],
            },
        };

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

        requestSender = createRequestSender();

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
        );

        masterpass = getMasterpassScriptMock();

        masterpassScriptLoader = new MasterpassScriptLoader(createScriptLoader());

        jest.spyOn(masterpassScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(masterpass));

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );
        strategy = new MasterpassCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            masterpassScriptLoader
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of MasterpassCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(MasterpassCustomerStrategy);
    });

    describe('#initialize()', () => {
        let masterpassOptions: CustomerInitializeOptions;

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: { container: 'login' } };
        });

        it('loads masterpass script in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads masterpass without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('fails to initialize the strategy if no methodId is supplied', async () => {
            masterpassOptions = { methodId: undefined, masterpass: { container: 'login' } };
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if no cart is supplied', async () => {
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('fails to initialize the strategy if no checkoutId is supplied', async () => {
            paymentMethodMock.initializationData.checkoutId = undefined;
            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('proceeds to checkout if masterpass button is clicked', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);
            if (masterpassOptions.masterpass) {
                const masterpassButton = document.getElementById(masterpassOptions.masterpass.container);
                if (masterpassButton) {
                    const btn = masterpassButton.firstChild as HTMLElement;
                    if (btn) {
                        btn.click();
                        expect(masterpass.checkout).toHaveBeenCalled();
                    }
                }
            }
        });
    });

    describe('#deinitialize()', () => {
        let masterpassOptions: CustomerInitializeOptions;

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: { container: 'login' } };
        });

        it('successfully deinitializes the strategy', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);
            strategy.deinitialize();
            if (masterpassOptions.masterpass) {
                const masterpassButton = document.getElementById(masterpassOptions.masterpass.container);
                if (masterpassButton) {
                    expect(masterpassButton.firstChild).toBe(null);
                }
            }
            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const paymentId = {
                providerId: 'masterpass',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            await strategy.initialize({ methodId: 'masterpass', masterpass: { container: 'login' } });
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = {
                methodId: 'masterpass',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('masterpass', options);
            expect(store.dispatch).toHaveBeenCalled();
        });
    });
});
