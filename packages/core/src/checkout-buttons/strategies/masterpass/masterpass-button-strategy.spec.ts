import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutButtonInitializeOptions } from '../..';
import { getCartState } from '../../../cart/carts.mock';
import {
    Checkout,
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckout, getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getMasterpass, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { Masterpass, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { getMasterpassScriptMock } from '../../../payment/strategies/masterpass/masterpass.mock';
import CheckoutButtonMethodType from '../checkout-button-method-type';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import MasterpassButtonStrategy from './masterpass-button-strategy';

describe('MasterpassButtonStrategy', () => {
    let container: HTMLDivElement;
    let containerFoo: HTMLDivElement;
    let masterpass: Masterpass;
    let masterpassScriptLoader: MasterpassScriptLoader;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodMock: PaymentMethod;
    let checkoutMock: Checkout;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CheckoutButtonStrategy;

    beforeEach(() => {
        paymentMethodMock = {
            ...getMasterpass(),
            initializationData: {
                checkoutId: 'checkoutId',
                allowedCardTypes: ['visa', 'amex', 'mastercard'],
                isMasterpassSrcEnabled: false,
            },
        };

        checkoutMock = getCheckout();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
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

        jest.spyOn(store.getState().checkout, 'getCheckout').mockReturnValue(checkoutMock);

        requestSender = createRequestSender();

        masterpass = getMasterpassScriptMock();

        masterpassScriptLoader = new MasterpassScriptLoader(createScriptLoader());

        jest.spyOn(masterpassScriptLoader, 'load').mockReturnValue(Promise.resolve(masterpass));

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        strategy = new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            masterpassScriptLoader,
            'en-US',
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);

        containerFoo = document.createElement('div');
        containerFoo.setAttribute('id', 'foo');
        document.body.appendChild(containerFoo);
    });

    afterEach(() => {
        document.body.removeChild(container);
        document.body.removeChild(containerFoo);
    });

    describe('#initialize()', () => {
        let masterpassOptions: CheckoutButtonInitializeOptions;
        const methodId = CheckoutButtonMethodType.MASTERPASS;
        const masterpassScriptLoaderParams = {
            useMasterpassSrc: false,
            language: 'en_us',
            testMode: true,
            checkoutId: 'checkoutId',
        };

        beforeEach(() => {
            masterpassOptions = { methodId, containerId: 'login' };
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

        it('fails to initialize the strategy if no container is supplied', async () => {
            masterpassOptions = { methodId, containerId: '' };

            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(InvalidArgumentError);
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

        it('fails to initialize the strategy if no container is supplied', async () => {
            document.body.removeChild(container);

            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);

                document.body.appendChild(container);
            }
        });

        it('fails to initialize the strategy if no payment method is supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValueOnce(
                null,
            );

            try {
                await strategy.initialize(masterpassOptions);
            } catch (e) {
                expect(e).toBeInstanceOf(MissingDataError);
            }
        });

        it('proceeds to checkout if masterpass button is clicked', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);

            const masterpassButton = document.getElementById(masterpassOptions.containerId);

            if (masterpassButton) {
                const btn = masterpassButton.firstChild as HTMLElement;

                if (btn) {
                    btn.click();

                    expect(masterpass.checkout).toHaveBeenCalled();
                }
            }
        });

        it('loads masterpass script with correct locale when locale contains "-" character', async () => {
            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });

        it('loads masterpass script with correct locale', async () => {
            strategy = new MasterpassButtonStrategy(
                store,
                checkoutActionCreator,
                masterpassScriptLoader,
                'FR',
            );
            masterpassScriptLoaderParams.language = 'fr_fr';

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });

        it('loads masterpass script with default locale for unsupported country code', async () => {
            strategy = new MasterpassButtonStrategy(
                store,
                checkoutActionCreator,
                masterpassScriptLoader,
                'es_fr',
            );
            masterpassScriptLoaderParams.language = 'es_es';

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });

        it('loads masterpass script with default locale for unsupported language', async () => {
            strategy = new MasterpassButtonStrategy(
                store,
                checkoutActionCreator,
                masterpassScriptLoader,
                'tr',
            );
            masterpassScriptLoaderParams.language = 'en_us';

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });

        it('loads masterpass script with correct locale for supported language and country', async () => {
            strategy = new MasterpassButtonStrategy(
                store,
                checkoutActionCreator,
                masterpassScriptLoader,
                'zh_hk',
            );
            masterpassScriptLoaderParams.language = 'zh_hk';

            await strategy.initialize(masterpassOptions);

            expect(masterpassScriptLoader.load).toHaveBeenLastCalledWith(
                masterpassScriptLoaderParams,
            );
        });
    });

    describe('#deinitialize()', () => {
        let masterpassOptions: CheckoutButtonInitializeOptions;
        const methodId = CheckoutButtonMethodType.MASTERPASS;

        beforeEach(() => {
            masterpassOptions = { methodId, containerId: 'login' };
        });

        it('succesfully deinitializes the strategy', async () => {
            jest.spyOn(masterpass, 'checkout');
            await strategy.initialize(masterpassOptions);
            strategy.deinitialize();

            const masterpassButton = document.getElementById(masterpassOptions.containerId);

            if (masterpassButton) {
                expect(masterpassButton.firstChild).toBeNull();
            }

            // Prevent "After Each" failure
            container = document.createElement('div');
            document.body.appendChild(container);
        });
    });
});
