import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { InvalidArgumentError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Cart, CartRequestSender } from '../../../cart';
import { getCart, getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import {
    createGooglePayPaymentProcessor,
    GooglePayPaymentProcessor,
    GooglePayStripeUPEInitializer,
} from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonMethodType from '../checkout-button-method-type';

import GooglePayButtonStrategy from './googlepay-button-strategy';
import { getCheckoutButtonOptions, getPaymentMethod, Mode } from './googlepay-button.mock';

describe('GooglePayCheckoutButtonStrategy', () => {
    let cart: Cart;
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let cartRequestSender: CartRequestSender;
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

        cart = getCart();
        requestSender = createRequestSender();

        checkoutActionCreator = checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        paymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayStripeUPEInitializer(),
        );

        formPoster = createFormPoster();

        cartRequestSender = new CartRequestSender(createRequestSender());

        strategy = new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            paymentProcessor,
            cartRequestSender,
        );

        jest.spyOn(formPoster, 'postForm').mockReturnValue(Promise.resolve());
        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentProcessor, 'initialize').mockReturnValue(Promise.resolve());
        jest.spyOn(paymentProcessor, 'deinitialize');

        walletButton = document.createElement('a');
        walletButton.setAttribute('id', 'mockButton');
        jest.spyOn(paymentProcessor, 'createButton').mockImplementation(
            (onClick: (event: Event) => Promise<void>) => {
                walletButton.onclick = onClick;

                return walletButton;
            },
        );

        container = document.createElement('div');
        container.setAttribute('id', 'googlePayCheckoutButton');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        it('Creates the button', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.GooglePayStripeUPE,
            );
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.createButton).toHaveBeenCalled();
        });

        it('Validates if strategy has been initialized', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.GooglePayStripeUPE,
            );

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledTimes(1);
        });

        it('fails to initialize the strategy if no container id is supplied', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.UndefinedContainer,
            );

            try {
                await strategy.initialize(checkoutButtonOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if no valid container id is supplied', async () => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.InvalidContainer,
            );

            await expect(strategy.initialize(checkoutButtonOptions)).rejects.toThrow(
                InvalidArgumentError,
            );
        });
    });

    describe('#deinitialize()', () => {
        let containerId: string;

        beforeAll(() => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.GooglePayStripeUPE,
            );
            containerId = checkoutButtonOptions.containerId;
        });

        it('check if googlepay payment processor deinitialize is called', async () => {
            await strategy.initialize(checkoutButtonOptions);

            await strategy.deinitialize();

            expect(paymentProcessor.deinitialize).toHaveBeenCalled();
        });

        it('removes the child elements from attached to the containerId', async () => {
            await strategy.initialize(checkoutButtonOptions);

            const button = document.getElementById(containerId);

            expect(button).toHaveProperty('firstChild', walletButton);

            await strategy.deinitialize();

            expect(button).toHaveProperty('firstChild', null);
        });

        it('fails silently if strategy was not initialized', () => {
            expect(async () => strategy.deinitialize()).not.toThrow();
        });
    });

    describe('#handleWalletButtonClick', () => {
        const googlePaymentDataMock = getGooglePaymentDataMock();

        beforeEach(() => {
            checkoutButtonOptions = getCheckoutButtonOptions(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
                Mode.GooglePayStripeUPE,
            );

            jest.spyOn(paymentProcessor, 'displayWallet').mockResolvedValue(googlePaymentDataMock);
            jest.spyOn(paymentProcessor, 'handleSuccess').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentProcessor, 'updateShippingAddress').mockReturnValue(
                Promise.resolve(),
            );
        });

        it('handles wallet button event and updates shipping address', async () => {
            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
            );

            walletButton.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).toHaveBeenCalledWith(
                googlePaymentDataMock.shippingAddress,
            );
        });

        it('handles wallet button event and does not update shipping address if cart has digital products only', async () => {
            cart.lineItems.physicalItems = [];

            await strategy.initialize(checkoutButtonOptions);

            expect(paymentProcessor.initialize).toHaveBeenCalledWith(
                CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
            );

            walletButton.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).not.toHaveBeenCalled();
        });
    });
});
