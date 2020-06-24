import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createGooglePayPaymentProcessor, GooglePayCheckoutcomInitializer, GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import GooglePayButtonStrategy from './googlepay-button-strategy';
import { getCheckoutButtonOptions, getPaymentMethod, Mode } from './googlepay-button.mock';

describe('GooglePayCheckoutButtonStrategy', () => {
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let checkoutButtonOptions: CheckoutButtonInitializeOptions;
    let paymentMethod: PaymentMethod;
    let paymentProcessor: GooglePayPaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: GooglePayButtonStrategy;
    let walletButton: HTMLAnchorElement;

    beforeEach(() => {
        paymentMethod = getPaymentMethod();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        requestSender = createRequestSender();

        checkoutActionCreator = checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender))
        );

        paymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayCheckoutcomInitializer(requestSender)
        );

        formPoster = createFormPoster();

        strategy = new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            paymentProcessor
        );

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(paymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethod);

        jest.spyOn(formPoster, 'postForm')
            .mockReturnValue(Promise.resolve());

        container = document.createElement('div');
        container.setAttribute('id', 'googlePayCheckoutButton');
        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');

        jest.spyOn(paymentProcessor, 'createButton')
            .mockReturnValue(walletButton);

        jest.spyOn(paymentProcessor, 'deinitialize');

        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        it('Creates the button', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM);

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalled();
        });

        it('initializes paymentProcessor only once', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM);

            await strategy.initialize(checkoutButtonOptions);

            strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('fails to initialize the strategy if no container id is supplied', () => {
            checkoutButtonOptions = getCheckoutButtonOptions(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM, Mode.UndefinedContainer);

            expect(() => strategy.initialize(checkoutButtonOptions)).toThrow(InvalidArgumentError);
        });

        it('fails to initialize the strategy if no valid container id is supplied', () => {
            checkoutButtonOptions = getCheckoutButtonOptions(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM, Mode.InvalidContainer);

            expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(InvalidArgumentError);
        });
    });

    describe('#deinitialize()', () => {
        beforeAll(() => {
            checkoutButtonOptions = getCheckoutButtonOptions(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM, Mode.GooglePayCheckoutcom);
        });

        it('check if googlepay payment processor deinitialize is called', async () => {
            await strategy.initialize(checkoutButtonOptions);

            strategy.deinitialize();

            expect(paymentProcessor.deinitialize).toBeCalled();
        });

        it('succesfully deinitializes the strategy', async () => {
            await strategy.initialize(checkoutButtonOptions);

            strategy.deinitialize();

            // tslint:disable-next-line:no-non-null-assertion
            const button = document.getElementById(checkoutButtonOptions.containerId!);

            expect(button).toHaveProperty('firstChild', null);
        });

        it('Validates if strategy is loaded before call deinitialize', async () => {
            await strategy.deinitialize();

            // tslint:disable-next-line:no-non-null-assertion
            const button = document.getElementById(checkoutButtonOptions.containerId!);

            expect(button).toHaveProperty('firstChild', null);
        });
    });
});
