import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getMasterpass, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { Masterpass, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { getMasterpassScriptMock } from '../../../payment/strategies/masterpass/masterpass.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import MasterpassCustomerStrategy from './masterpass-customer-strategy';

describe('MasterpassCustomerStrategy', () => {
    let checkoutActionCreator: CheckoutActionCreator;
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
                isMasterpassSrcEnabled: false,
            },
        };

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(
            getConfig().storeConfig,
        );

        requestSender = createRequestSender();

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );

        masterpass = getMasterpassScriptMock();

        masterpassScriptLoader = new MasterpassScriptLoader(createScriptLoader());

        jest.spyOn(masterpassScriptLoader, 'load').mockReturnValue(Promise.resolve(masterpass));

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );
        strategy = new MasterpassCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            masterpassScriptLoader,
            'en-US',
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
        const masterpassScriptLoaderParams = {
            useMasterpassSrc: false,
            language: 'en_us',
            testMode: true,
            checkoutId: 'checkoutId',
        };

        beforeEach(() => {
            masterpassOptions = { methodId: 'masterpass', masterpass: { container: 'login' } };
        });

        it('loads masterpass script in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });

        it('loads masterpass without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;
            masterpassScriptLoaderParams.testMode = false;

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
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
            jest.spyOn(store.getState().cart, 'getCart').mockReturnValue(undefined);

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
                const masterpassButton = document.getElementById(
                    masterpassOptions.masterpass.container,
                );

                if (masterpassButton) {
                    const btn = masterpassButton.firstChild as HTMLElement;

                    if (btn) {
                        btn.click();

                        expect(masterpass.checkout).toHaveBeenCalled();
                    }
                }
            }
        });

        it('loads masterpass script with correct locale when locale contains "-" character', async () => {
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith({
                ...masterpassScriptLoaderParams,
                language: 'en_us',
            });
        });

        it('loads masterpass script with correct locale', async () => {
            strategy = new MasterpassCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                masterpassScriptLoader,
                'FR',
            );
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith({
                ...masterpassScriptLoaderParams,
                language: 'fr_fr',
            });
        });

        it('loads masterpass script with default locale for unsupported country code', async () => {
            strategy = new MasterpassCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                masterpassScriptLoader,
                'es_fr',
            );
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith({
                ...masterpassScriptLoaderParams,
                language: 'es_es',
            });
        });

        it('loads masterpass script with default locale for unsupported language', async () => {
            strategy = new MasterpassCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                masterpassScriptLoader,
                'tr',
            );
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith({
                ...masterpassScriptLoaderParams,
                language: 'en_us',
            });
        });

        it('loads masterpass script with correct locale for supported language and country', async () => {
            strategy = new MasterpassCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                masterpassScriptLoader,
                'zh_hk',
            );
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith({
                ...masterpassScriptLoaderParams,
                language: 'zh_hk',
            });
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
                const masterpassButton = document.getElementById(
                    masterpassOptions.masterpass.container,
                );

                if (masterpassButton) {
                    expect(masterpassButton.firstChild).toBeNull();
                }
            }

            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({
                methodId: 'masterpass',
                masterpass: { container: 'login' },
            });
        });

        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const paymentId = {
                providerId: 'masterpass',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(remoteCheckoutActionCreator, 'signOut').mockReturnValue('data');

            await strategy.initialize({
                methodId: 'masterpass',
                masterpass: { container: 'login' },
            });
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

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });
});
