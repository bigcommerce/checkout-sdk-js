import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { PaymentMethod } from '../../../payment';
import { getAmazonMaxo, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonMaxoPaymentProcessor, AmazonMaxoPaymentProcessor } from '../../../payment/strategies/amazon-maxo';
import { getPaymentMethodMockUndefinedMerchant } from '../../../payment/strategies/amazon-maxo/amazon-maxo.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import AmazonMaxoCustomerStrategy from './amazon-maxo-customer-strategy';
import { getAmazonMaxoCustomerInitializeOptions, Mode } from './amazon-maxo-customer.mock';

describe('AmazonMaxoCustomerStrategy', () => {
    let container: HTMLDivElement;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: AmazonMaxoPaymentProcessor;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        paymentMethod = getAmazonMaxo();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
        );

        paymentProcessor = createAmazonMaxoPaymentProcessor(store);

        strategy = new AmazonMaxoCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            paymentProcessor
        );

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethod);

        container = document.createElement('div');
        container.setAttribute('id', 'amazonmaxoCheckoutButton');
        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');

        jest.spyOn(paymentProcessor, 'createButton')
            .mockReturnValue(walletButton);

        container.appendChild(walletButton);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {

        it('Creates the button', async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalled();
        });

        it('fails to initialize the strategy if no AmazonMaxoCustomerInitializeOptions is provided ', async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions(Mode.Incomplete);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if no methodid is supplied', async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions(Mode.UndefinedMethodId);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if method is not assigned', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if config is not initialized', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if merchantId is not supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getPaymentMethodMockUndefinedMerchant());
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if no valid container id is supplied', async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions(Mode.InvalidContainer);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#deinitialize()', () => {
        let customerInitializeOptions: CustomerInitializeOptions;

        beforeEach(() => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(customerInitializeOptions);
            strategy.deinitialize();
            if (customerInitializeOptions.amazonmaxo) {
                // tslint:disable-next-line:no-non-null-assertion
                const button = document.getElementById(customerInitializeOptions.amazonmaxo!.container);
                // tslint:disable-next-line:no-non-null-assertion
                expect(button!.firstChild).toBe(null);
            }
        });

        it('run deinitializes without calling initialize', () => {
            strategy.deinitialize();
            if (customerInitializeOptions.amazonmaxo) {
                // tslint:disable-next-line:no-non-null-assertion
                const button = document.getElementById(customerInitializeOptions.amazonmaxo!.container);
                // tslint:disable-next-line:no-non-null-assertion
                expect(button!.firstChild).not.toBe(null);
            }
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getAmazonMaxoCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('throws error if trying to sign out programmatically', async () => {
            const paymentId = {
                providerId: 'amazonmaxo',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            const options = {
                methodId: 'amazonmaxo',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('amazonmaxo', options);
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;
            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            const options = {
                methodId: 'amazonmaxo',
            };

            await strategy.signOut(options);

            expect(store.getState).toHaveBeenCalledTimes(3);
        });
    });
});
