import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getBraintreeVisaCheckout } from '../../../payment/payment-methods.mock';
import { createBraintreeVisaCheckoutPaymentProcessor, BraintreeVisaCheckoutPaymentProcessor, VisaCheckoutScriptLoader, VisaCheckoutSDK } from '../../../payment/strategies/braintree';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import createCustomerStrategyRegistry from '../../create-customer-strategy-registry';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerStrategyActionCreator from '../../customer-strategy-action-creator';
import { CustomerStrategyActionType } from '../../customer-strategy-actions';
import { getRemoteCustomer } from '../../internal-customers.mock';
import CustomerStrategy from '../customer-strategy';

import BraintreeVisaCheckoutCustomerStrategy from './braintree-visacheckout-customer-strategy';

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
    let formPoster: FormPoster;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();
        const requestSender = createRequestSender();
        braintreeVisaCheckoutPaymentProcessor = createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender);
        braintreeVisaCheckoutPaymentProcessor.initialize = jest.fn(() => Promise.resolve());
        braintreeVisaCheckoutPaymentProcessor.handleSuccess = jest.fn(() => Promise.resolve());

        paymentMethodMock = { ...getBraintreeVisaCheckout(), clientToken: 'clientToken' };

        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender, checkoutActionCreator);

        visaCheckoutSDK = {} as VisaCheckoutSDK;
        visaCheckoutSDK.init = jest.fn();
        visaCheckoutSDK.on = jest.fn();

        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(scriptLoader);
        visaCheckoutScriptLoader.load = jest.fn(() => Promise.resolve(visaCheckoutSDK));

        formPoster = createFormPoster();

        const registry = createCustomerStrategyRegistry(store, requestSender, '');

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        customerStrategyActionCreator = new CustomerStrategyActionCreator(registry);

        strategy = new BraintreeVisaCheckoutCustomerStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            customerStrategyActionCreator,
            remoteCheckoutActionCreator,
            braintreeVisaCheckoutPaymentProcessor,
            visaCheckoutScriptLoader,
            formPoster
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
        let visaCheckoutOptions: CustomerInitializeOptions;

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
            try {
                await strategy.initialize(merge({}, visaCheckoutOptions, {
                    braintreevisacheckout: { container: 'non-existing' },
                }));
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
            visaCheckoutSDK.on = jest.fn((_, callback) => callback());
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
                const widgetInteractionAction = of(createAction(CustomerStrategyActionType.WidgetInteractionStarted));
                jest.spyOn(customerStrategyActionCreator, 'widgetInteraction').mockImplementation(() => widgetInteractionAction);

                await strategy.initialize(visaCheckoutOptions);

                expect(store.dispatch).toHaveBeenCalledWith(widgetInteractionAction, { queueId: 'widgetInteraction' });
                expect(customerStrategyActionCreator.widgetInteraction)
                    .toHaveBeenCalledWith(expect.any(Function), { methodId: 'braintreevisacheckout' });
            });
        });

        it('payment error triggers onError from the options', async () => {
            const onError = jest.fn();
            const errorMock = new Error();

            visaCheckoutSDK.on = jest.fn((type, callback) => type === 'payment.error' ? callback('data', errorMock) : undefined);

            await strategy.initialize(merge({}, visaCheckoutOptions, {
                braintreevisacheckout: { onError },
            }));

            expect(onError).toHaveBeenCalledWith(errorMock);
        });
    });

    describe('#signIn()', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: 'visaCheckout', braintreevisacheckout: { container: 'login' } });
        });

        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(async () => {
            const remoteCustomer = merge({}, getRemoteCustomer(), {
                remote: { provider: 'braintreevisacheckout' },
            });

            jest.spyOn(store.getState().customer, 'getCustomer')
                .mockReturnValue(remoteCustomer);

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

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback: mockCallback });

            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });
});
