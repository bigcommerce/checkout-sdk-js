import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getFormFieldsState } from '../../../form/form.mock';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor } from '../../../payment/strategies/amazon-pay-v2';
import { getPaymentMethodMockUndefinedMerchant } from '../../../payment/strategies/amazon-pay-v2/amazon-pay-v2.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import { AmazonPayV2CustomerInitializeOptions } from '.';
import AmazonPayV2CustomerStrategy from './amazon-pay-v2-customer-strategy';
import { getAmazonPayV2CustomerInitializeOptions, Mode } from './amazon-pay-v2-customer.mock';

describe('AmazonPayV2CustomerStrategy', () => {
    let container: HTMLDivElement;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentProcessor: AmazonPayV2PaymentProcessor;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            formFields: getFormFieldsState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender)
        );

        paymentProcessor = createAmazonPayV2PaymentProcessor();

        strategy = new AmazonPayV2CustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            paymentProcessor
        );

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paymentProcessor, 'signout')
            .mockReturnValue(Promise.resolve());

        container = document.createElement('div');
        container.setAttribute('id', 'amazonpayCheckoutButton');
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

        it('creates the button', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalled();
        });

        it('creates the button and validates if cart contains physical items', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();
            jest.spyOn(store.getState().cart, 'getCart')
                .mockReturnValue({...store.getState().cart.getCart(), lineItems: {physicalItems: []}});

            await strategy.initialize(customerInitializeOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalled();
        });

        it('fails to initialize the strategy if no AmazonPayV2CustomerInitializeOptions is provided ', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(Mode.Incomplete);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if no methodid is supplied', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(Mode.UndefinedMethodId);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to create button if method is not assigned', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if config is not initialized', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue(undefined);
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('fails to create button if merchantId is not supplied', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getPaymentMethodMockUndefinedMerchant());
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if no valid container id is supplied', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions(Mode.InvalidContainer);

            await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#deinitialize()', () => {
        let customerInitializeOptions: CustomerInitializeOptions;

        beforeEach(() => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();
        });

        it('succesfully deinitializes the strategy', async () => {
            const amazonInitializeOptions = customerInitializeOptions.amazonpay as AmazonPayV2CustomerInitializeOptions;

            await strategy.initialize(customerInitializeOptions);
            expect(document.getElementById(amazonInitializeOptions.container)).not.toBeNull();

            await strategy.deinitialize();
            expect(document.getElementById(amazonInitializeOptions.container)).toBeNull();

            document.body.appendChild(container);
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getAmazonPayV2CustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('throws error if trying to sign out programmatically', async () => {
            const paymentId = {
                providerId: 'amazonpay',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');

            const options = {
                methodId: 'amazonpay',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('amazonpay', options);
            expect(paymentProcessor.signout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;
            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId')
                .mockReturnValue(paymentId);

            const options = {
                methodId: 'amazonpay',
            };

            await strategy.signOut(options);

            expect(store.getState).toHaveBeenCalledTimes(3);
        });
    });
});
