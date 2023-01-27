import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getBolt } from '../../../payment/payment-methods.mock';
import { BoltCheckout, BoltScriptLoader } from '../../../payment/strategies/bolt';
import { getQuote } from '../../../quote/internal-quotes.mock';
import {
    GoogleRecaptcha,
    GoogleRecaptchaScriptLoader,
    GoogleRecaptchaWindow,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../../../spam-protection';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerRequestSender from '../../customer-request-sender';
import CustomerStrategy from '../customer-strategy';

import BoltCustomerStrategy from './bolt-customer-strategy';

describe('BoltCustomerStrategy', () => {
    let boltScriptLoader: BoltScriptLoader;
    let boltCheckout: BoltCheckout;
    let customerActionCreator: CustomerActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        paymentMethodMock = getBolt();
        store = createCheckoutStore(getCheckoutStoreState());

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(
            createScriptLoader(),
            googleRecaptchaMockWindow,
        );
        googleRecaptcha = new GoogleRecaptcha(
            googleRecaptchaScriptLoader,
            new MutationObserverFactory(),
        );

        boltCheckout = {} as BoltCheckout;
        boltCheckout.configure = jest.fn();
        boltCheckout.setClientCustomCallbacks = jest.fn();
        boltCheckout.openCheckout = jest.fn();
        boltCheckout.hasBoltAccount = jest.fn();

        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        boltScriptLoader.loadBoltClient = jest.fn(() => Promise.resolve(boltCheckout));

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender())),
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender()),
            ),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(createRequestSender()),
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );

        strategy = new BoltCustomerStrategy(
            store,
            boltScriptLoader,
            customerActionCreator,
            paymentMethodActionCreator,
        );
    });

    it('creates an instance of BoltCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(BoltCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('fails to initialize the strategy if methodId is not provided', async () => {
            try {
                await strategy.initialize({ methodId: undefined });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to initialize the strategy if publishableKey option is not provided', async () => {
            paymentMethodMock.initializationData.publishableKey = undefined;

            try {
                await strategy.initialize({ methodId: 'bolt' });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads bolt script loader', async () => {
            await strategy.initialize({ methodId: 'bolt' });

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalled();
        });
    });

    describe('#signIn()', () => {
        it('dispatches action to sign in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const options = {};
            const action = of(createAction(CustomerActionType.SignInCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'signInCustomer').mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signIn(credentials, options);

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#signOut()', () => {
        it('dispatches action to sign out customer', async () => {
            const options = {};
            const action = of(
                createAction(CustomerActionType.SignOutCustomerRequested, getQuote()),
            );

            jest.spyOn(customerActionCreator, 'signOutCustomer').mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            await strategy.signOut(options);

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith(options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('fails to execute payment method checkout if methodId is not provided', async () => {
            try {
                await strategy.executePaymentMethodCheckout({ methodId: undefined });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('fails to execute payment method checkout if provided continueWithCheckoutCallback is not a function', async () => {
            try {
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                await strategy.executePaymentMethodCheckout({
                    methodId: 'bolt',
                    // @ts-ignore
                    continueWithCheckoutCallback: 'string',
                });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('successfully executes payment method checkout if continueWithCheckoutCallback is not provided (for suggestion block)', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            const options = { methodId: 'bolt' };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(boltCheckout.openCheckout).toHaveBeenCalled();
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if the customer does not have an email', async () => {
            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue({});
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue({});

            await strategy.executePaymentMethodCheckout(options);

            expect(mockCallback.mock.calls).toHaveLength(1);
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if Bolt embedded one click configuration mode is disabled', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = false;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(mockCallback.mock.calls).toHaveLength(1);
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if customer do not have Bolt account', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(false);

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(mockCallback.mock.calls).toHaveLength(1);
        });

        it('shows Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(boltCheckout.openCheckout).toHaveBeenCalled();
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if customer close Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };
            const callbacks = {
                close: () => {
                    options.continueWithCheckoutCallback();
                },
            };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);
            jest.spyOn(boltCheckout, 'openCheckout').mockImplementation(() => callbacks.close());

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(boltCheckout.openCheckout).toHaveBeenCalled();
            expect(mockCallback.mock.calls).toHaveLength(1);
        });

        it('fails to execute payment method checkout if Bolt has an error when open Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);
            jest.spyOn(boltCheckout, 'openCheckout').mockImplementation(() => {
                throw new PaymentMethodFailedError('Error on Bolt side');
            });

            await strategy.initialize({ methodId: 'bolt' });

            try {
                await strategy.executePaymentMethodCheckout(options);
            } catch (error) {
                expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
                expect(error).toBeInstanceOf(PaymentMethodFailedError);
            }
        });
    });
});
