import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '..';
import { getBillingAddressState } from '../../billing/billing-addresses.mock';
import { getBillingAddress } from '../../billing/internal-billing-addresses.mock';
import { getCartState } from '../../cart/internal-carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../checkout';
import { getCheckoutState } from '../../checkout/checkouts.mock';
import { getConfigState } from '../../config/configs.mock';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { getBraintreeVisaCheckout, getPaymentMethodsState } from '../../payment/payment-methods.mock';
import {
    createBraintreeVisaCheckoutPaymentProcessor,
    BraintreeVisaCheckoutPaymentProcessor,
} from '../../payment/strategies/braintree';
import { VisaCheckoutSDK } from '../../payment/strategies/braintree/visacheckout';
import VisaCheckoutScriptLoader from '../../payment/strategies/braintree/visacheckout-script-loader';
import { getQuoteState } from '../../quote/internal-quotes.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { getShippingAddress } from '../../shipping/internal-shipping-addresses.mock';
import { CustomerStrategyActionType } from '../customer-strategy-actions';
import { getCustomerState, getRemoteCustomer } from '../internal-customers.mock';

import { BraintreeVisaCheckoutCustomerStrategy, CustomerStrategy } from './';

describe('BraintreeVisaCheckoutCustomerStrategy', () => {
    let braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor;
    let checkoutActionCreator: CheckoutActionCreator;
    let container: HTMLDivElement;
    let customerStrategyActionCreator: CustomerStrategyActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let visaCheckoutScriptLoader: VisaCheckoutScriptLoader;
    let visaCheckoutSDK: VisaCheckoutSDK;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        braintreeVisaCheckoutPaymentProcessor = createBraintreeVisaCheckoutPaymentProcessor(scriptLoader);
        braintreeVisaCheckoutPaymentProcessor.initialize = jest.fn(() => Promise.resolve());
        braintreeVisaCheckoutPaymentProcessor.handleSuccess = jest.fn(() => Promise.resolve());

        paymentMethodMock = { ...getBraintreeVisaCheckout(), clientToken: 'clientToken' };

        store = createCheckoutStore({
            billingAddress: getBillingAddressState(),
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
            quote: getQuoteState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(createRequestSender());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender);

        visaCheckoutSDK = {} as VisaCheckoutSDK;
        visaCheckoutSDK.init = jest.fn();
        visaCheckoutSDK.on = jest.fn();

        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(scriptLoader);
        visaCheckoutScriptLoader.load = jest.fn(() => Promise.resolve(visaCheckoutSDK));

        const client = createCheckoutClient();
        const registry = createCustomerStrategyRegistry(store, client);
        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender);
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        customerStrategyActionCreator = new CustomerStrategyActionCreator(registry);

        strategy = new BraintreeVisaCheckoutCustomerStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            customerStrategyActionCreator,
            remoteCheckoutActionCreator,
            braintreeVisaCheckoutPaymentProcessor,
            visaCheckoutScriptLoader
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of BraintreeVisaCheckoutCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutCustomerStrategy);
    });

    describe('#initialize()', () => {
        let visaCheckoutOptions;

        beforeEach(() => {
            visaCheckoutOptions = { methodId: 'braintreevisacheckout', braintreevisacheckout: { container: 'login' } };
        });

        it('loads visacheckout in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads visacheckout without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('throws if the container is not available', async () => {
            visaCheckoutOptions.braintreevisacheckout.container = 'non-existing';

            try {
                await strategy.initialize(visaCheckoutOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('creates a visa checkout button', async () => {
            await strategy.initialize(visaCheckoutOptions);

            expect(container.querySelector('.v-button')).not.toBeNull();
        });

        it('initialises the visa checkout payment processor with the right data', async () => {
            await strategy.initialize(visaCheckoutOptions);

            expect(braintreeVisaCheckoutPaymentProcessor.initialize).toHaveBeenCalledWith('clientToken', {
                collectShipping: true,
                currencyCode: 'USD',
                locale: 'en_US',
                subtotal: 190,
            });
        });

        it('calls the visa checkout sdk init method with the processed options', async () => {
            const options = {
                settings: {
                    shipping: { collectShipping: true },
                },
                paymentRequest: {},
            };

            braintreeVisaCheckoutPaymentProcessor.initialize = jest.fn(() => options);

            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutSDK.init).toHaveBeenCalledWith(options);
        });

        it('registers the error and success callbacks', async () => {
            visaCheckoutSDK.on = jest.fn((type, callback) => callback());
            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutSDK.on).toHaveBeenCalledWith('payment.success', expect.any(Function));
            expect(visaCheckoutSDK.on).toHaveBeenCalledWith('payment.error', expect.any(Function));
        });

        describe('when payment.success', () => {
            beforeEach(() => {
                visaCheckoutSDK.on = jest.fn((type, callback) => type === 'payment.success' ? callback('data') : undefined);
                jest.spyOn(customerStrategyActionCreator, 'widgetInteraction').mockImplementation(cb => cb());
            });

            it('payment success triggers handle success in BraintreeVisaCheckoutPaymentProcessor', async () => {
                await strategy.initialize(visaCheckoutOptions);

                expect(braintreeVisaCheckoutPaymentProcessor.handleSuccess).toHaveBeenCalledWith(
                    'data',
                    getShippingAddress(),
                    getBillingAddress()
                );
            });

            it('reloads quote and payment method', async () => {
                jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout');

                await strategy.initialize(visaCheckoutOptions);

                expect(checkoutActionCreator.loadCurrentCheckout).toHaveBeenCalled();
            });

            it('triggers a widgetInteraction action', async () => {
                const widgetInteractionAction = Observable.of(createAction(CustomerStrategyActionType.WidgetInteractionStarted));
                jest.spyOn(customerStrategyActionCreator, 'widgetInteraction').mockImplementation(() => widgetInteractionAction);

                await strategy.initialize(visaCheckoutOptions);

                expect(store.dispatch).toHaveBeenCalledWith(widgetInteractionAction, { queueId: 'widgetInteraction' });
                expect(customerStrategyActionCreator.widgetInteraction)
                    .toHaveBeenCalledWith(expect.any(Function), { methodId: 'braintreevisacheckout' });
            });
        });

        it('payment error triggers onError from the options', async () => {
            visaCheckoutOptions.braintreevisacheckout.onError = jest.fn();
            const errorMock = new Error();
            visaCheckoutSDK.on = jest.fn((type, callback) => type === 'payment.error' ? callback('data', errorMock) : undefined);
            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutOptions.braintreevisacheckout.onError).toHaveBeenCalledWith(errorMock);
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'visaCheckout', braintreevisacheckout: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', async () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const remoteCustomer = getRemoteCustomer();
            remoteCustomer.remote.provider = 'braintreevisacheckout';
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(remoteCustomer);

            store.getState().customer.getCustomer().remote.provider = 'braintreevisacheckout';
            remoteCheckoutActionCreator.signOut = jest.fn(() => 'data');
            await strategy.initialize({ methodId: 'visaCheckout', braintreevisacheckout: { container: 'login' } });
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = {
                methodId: 'braintreevisacheckout',
            };

            await strategy.signOut(options);
            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('braintreevisacheckout', options);
            expect(store.dispatch).toHaveBeenCalledWith('data');
        });
    });

    describe('#deinitialize()', () => {
        beforeEach(async () => {
            braintreeVisaCheckoutPaymentProcessor.deinitialize = jest.fn(() => Promise.resolve());
            await strategy.initialize({ methodId: 'visaCheckout', braintreevisacheckout: { container: 'login' } });
        });

        it('deinitializes BraintreeVisaCheckoutPaymentProcessor', async () => {
            await strategy.deinitialize();
            expect(braintreeVisaCheckoutPaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });
});
