import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerStrategy,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BoltCheckout, BoltHostWindow, BoltInitializationData } from './bolt';
import BoltCustomerStrategy from './bolt-customer-strategy';
import BoltScriptLoader from './bolt-script-loader';
import { getBolt } from './bolt.mock';

describe('BoltCustomerStrategy', () => {
    let boltScriptLoader: BoltScriptLoader;
    let boltCheckout: BoltCheckout;
    let paymentMethodMock: PaymentMethod<BoltInitializationData>;
    let strategy: CustomerStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        paymentMethodMock = getBolt();
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        boltCheckout = {} as BoltCheckout;
        boltCheckout.configure = jest.fn();
        boltCheckout.setClientCustomCallbacks = jest.fn();
        boltCheckout.openCheckout = jest.fn();
        boltCheckout.hasBoltAccount = jest.fn();
        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        boltScriptLoader.loadBoltClient = jest.fn(() => {
            (window as BoltHostWindow).BoltCheckout = boltCheckout;

            return Promise.resolve(boltCheckout);
        });

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
            getCustomer(),
        );

        strategy = new BoltCustomerStrategy(paymentIntegrationService, boltScriptLoader);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('creates an instance of BoltCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(BoltCustomerStrategy);
    });

    describe('#initialize()', () => {
        it('fails to initialize the strategy if methodId is not provided', async () => {
            await expect(strategy.initialize({ methodId: undefined })).rejects.toThrow(
                InvalidArgumentError,
            );
        });

        it('fails to initialize the strategy if publishableKey option is not provided', async () => {
            paymentMethodMock.initializationData = undefined;

            await expect(strategy.initialize({ methodId: 'bolt' })).rejects.toThrow(
                MissingDataError,
            );
        });

        it('loads bolt script loader', async () => {
            await strategy.initialize({ methodId: 'bolt' });

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalled();
        });

        it('calls Bolt on init callback', async () => {
            const onInitMock = jest.fn();

            await strategy.initialize({
                methodId: 'bolt',
                bolt: {
                    onInit: onInitMock,
                },
            });

            expect(onInitMock).toHaveBeenCalled();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('fails to execute payment method checkout if methodId is not provided', async () => {
            await expect(
                strategy.executePaymentMethodCheckout({ methodId: undefined }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('fails to execute payment method checkout if provided continueWithCheckoutCallback is not a function', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const continueWithCheckoutCallbackMock: any = 'string';

            await expect(
                strategy.executePaymentMethodCheckout({
                    methodId: 'bolt',
                    continueWithCheckoutCallback: continueWithCheckoutCallbackMock,
                }),
            ).rejects.toThrow(InvalidArgumentError);
        });

        it('successfully executes payment method checkout if continueWithCheckoutCallback is not provided (for suggestion block)', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

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

            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                {},
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue({});

            await strategy.executePaymentMethodCheckout(options);

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if Bolt embedded one click configuration mode is disabled', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = false;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if customer do not have Bolt account', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(false);

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('shows Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);

            await strategy.initialize({ methodId: 'bolt' });
            await strategy.executePaymentMethodCheckout(options);

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
            expect(boltCheckout.openCheckout).toHaveBeenCalled();
        });

        it('runs default BC checkout flow (calls continueWithCheckoutCallback) if customer close Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

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
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        it('fails to execute payment method checkout if Bolt has an error when open Bolt Checkout Modal', async () => {
            paymentMethodMock.initializationData!.embeddedOneClickEnabled = true;

            const mockCallback = jest.fn();
            const options = { methodId: 'bolt', continueWithCheckoutCallback: mockCallback };

            jest.spyOn(boltCheckout, 'hasBoltAccount').mockReturnValue(true);
            jest.spyOn(boltCheckout, 'openCheckout').mockImplementation(() => {
                throw new PaymentMethodFailedError('Error on Bolt side');
            });

            await strategy.initialize({ methodId: 'bolt' });

            await expect(strategy.executePaymentMethodCheckout(options)).rejects.toThrow(
                PaymentMethodFailedError,
            );

            expect(boltCheckout.hasBoltAccount).toHaveBeenCalledWith('test@bigcommerce.com');
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
