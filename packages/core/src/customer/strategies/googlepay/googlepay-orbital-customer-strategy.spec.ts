import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster/';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { of } from 'rxjs';

import { getCart, getCartState } from '../../../cart/carts.mock';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import {
    createGooglePayPaymentProcessor,
    GooglePayOrbitalInitializer,
    GooglePayPaymentProcessor,
} from '../../../payment/strategies/googlepay';
import { getGooglePaymentDataMock } from '../../../payment/strategies/googlepay/googlepay.mock';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender,
} from '../../../remote-checkout';
import { CustomerInitializeOptions } from '../../customer-request-options';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import { getOrbitalCustomerInitializeOptions, Mode } from './googlepay-customer-mock';
import GooglePayCustomerStrategy from './googlepay-customer-strategy';

describe('GooglePayCustomerStrategy', () => {
    let checkoutActionCreator: CheckoutActionCreator;
    let container: HTMLDivElement;
    let formPoster: FormPoster;
    let customerInitializeOptions: CustomerInitializeOptions;
    let paymentProcessor: GooglePayPaymentProcessor;
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
            paymentMethods: getPaymentMethodsState(),
        });

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

        paymentProcessor = createGooglePayPaymentProcessor(
            store,
            new GooglePayOrbitalInitializer(),
        );

        formPoster = createFormPoster();

        strategy = new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            paymentProcessor,
            formPoster,
        );

        formPoster.postForm = jest.fn().mockResolvedValue(null);
        store.dispatch = jest.fn().mockResolvedValue(store.getState());
        paymentProcessor.initialize = jest.fn().mockResolvedValue(true);

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

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        describe('Payment method exist', () => {
            it('Creates the button', async () => {
                customerInitializeOptions = getOrbitalCustomerInitializeOptions();

                await strategy.initialize(customerInitializeOptions);

                expect(paymentProcessor.createButton).toHaveBeenCalled();
            });

            it('fails to initialize the strategy if no GooglePayCustomerInitializeOptions is provided', () => {
                customerInitializeOptions = getOrbitalCustomerInitializeOptions(Mode.Incomplete);

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(
                    InvalidArgumentError,
                );
            });

            it('fails to initialize the strategy if no methodid is supplied', () => {
                customerInitializeOptions = getOrbitalCustomerInitializeOptions(
                    Mode.UndefinedMethodId,
                );

                expect(() => strategy.initialize(customerInitializeOptions)).toThrow(
                    InvalidArgumentError,
                );
            });

            it('fails to initialize the strategy if no valid container id is supplied', async () => {
                customerInitializeOptions = getOrbitalCustomerInitializeOptions(
                    Mode.InvalidContainer,
                );

                await expect(strategy.initialize(customerInitializeOptions)).rejects.toThrow(
                    InvalidArgumentError,
                );
            });
        });
    });

    describe('#deinitialize()', () => {
        let containerId: string;

        beforeAll(() => {
            customerInitializeOptions = getOrbitalCustomerInitializeOptions();
            containerId = customerInitializeOptions.googlepayorbital
                ? customerInitializeOptions.googlepayorbital.container
                : '';
        });

        it('successfully deinitializes the strategy', async () => {
            await strategy.initialize(customerInitializeOptions);

            const button = document.getElementById(containerId);

            expect(button).toHaveProperty('firstChild', walletButton);

            await strategy.deinitialize();

            expect(button).toHaveProperty('firstChild', null);
        });

        it('Validates if strategy is loaded before call deinitialize', async () => {
            await strategy.deinitialize();

            const button = document.getElementById(containerId);

            expect(button).toHaveProperty('firstChild', null);
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', async () => {
            customerInitializeOptions = getOrbitalCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            customerInitializeOptions = getOrbitalCustomerInitializeOptions();

            await strategy.initialize(customerInitializeOptions);
        });

        it('successfully signs out', async () => {
            const paymentId = {
                providerId: 'googlepayorbital',
            };

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'forgetCheckout').mockReturnValue(
                of(
                    createAction(
                        RemoteCheckoutActionType.ForgetCheckoutRemoteCustomerSucceeded,
                        undefined,
                        { methodId: 'googlepayorbital' },
                    ),
                ),
            );

            const options = {
                methodId: 'googlepayorbital',
            };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.forgetCheckout).toHaveBeenCalledWith(
                'googlepayorbital',
                options,
            );
            expect(store.dispatch).toHaveBeenCalled();
        });

        it('Returns state if no payment method exist', async () => {
            const paymentId = undefined;

            jest.spyOn(store, 'getState');

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            const options = {
                methodId: 'googlepayorbital',
            };

            expect(await strategy.signOut(options)).toEqual(store.getState());
            expect(store.getState).toHaveBeenCalledTimes(4);
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

    describe('#handleWalletButtonClick', () => {
        const googlePaymentDataMock = getGooglePaymentDataMock();

        beforeEach(() => {
            customerInitializeOptions = {
                methodId: 'googlepayorbital',
                googlepayorbital: {
                    container: 'googlePayCheckoutButton',
                    onClick: jest.fn(),
                },
            };

            paymentProcessor.updatePaymentDataRequest = jest.fn().mockResolvedValue(null);
            paymentProcessor.displayWallet = jest.fn().mockResolvedValue(googlePaymentDataMock);
            paymentProcessor.handleSuccess = jest.fn().mockResolvedValue(null);
            paymentProcessor.updateShippingAddress = jest.fn().mockResolvedValue(null);
        });

        it('displays the wallet and updates the shipping address', async () => {
            await strategy.initialize(customerInitializeOptions);

            walletButton.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).toHaveBeenCalledWith(
                googlePaymentDataMock.shippingAddress,
            );
        });

        it('displays the wallet and does not update the shipping address if cart has digital products only', async () => {
            const cart = getCart();

            cart.lineItems.physicalItems = [];
            jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cart);

            await strategy.initialize(customerInitializeOptions);

            walletButton.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentProcessor.displayWallet).toHaveBeenCalled();
            expect(paymentProcessor.handleSuccess).toHaveBeenCalledWith(googlePaymentDataMock);
            expect(paymentProcessor.updateShippingAddress).not.toHaveBeenCalled();
        });

        it('triggers onClick callback on wallet button click', async () => {
            await strategy.initialize(customerInitializeOptions);

            walletButton.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(customerInitializeOptions.googlepayorbital?.onClick).toHaveBeenCalled();
        });
    });
});
