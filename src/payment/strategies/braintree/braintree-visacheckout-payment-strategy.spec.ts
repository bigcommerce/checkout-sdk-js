import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import {
    createPaymentClient,
    createPaymentStrategyRegistry,
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentRequestSender,
    PaymentStrategyActionCreator,
} from '../..';
import { getBillingAddressState } from '../../../billing/billing-addresses.mock';
import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getCartState } from '../../../cart/internal-carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/internal-customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { getQuoteState } from '../../../quote/internal-quotes.mock';
import { getShippingAddress } from '../../../shipping/internal-shipping-addresses.mock';
import { SUBMIT_PAYMENT_REQUESTED } from '../../payment-action-types';
import { getBraintreeVisaCheckout, getPaymentMethodsState } from '../../payment-methods.mock';
import { PaymentStrategyActionType } from '../../payment-strategy-actions';

import {
    createBraintreeVisaCheckoutPaymentProcessor,
    BraintreeVisaCheckoutPaymentProcessor,
    BraintreeVisaCheckoutPaymentStrategy,
    VisaCheckoutScriptLoader,
} from '.';
import { VisaCheckoutSDK } from './visacheckout';

describe('BraintreeVisaCheckoutPaymentStrategy', () => {
    let braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor;
    let container: HTMLDivElement;
    let checkoutActionCreator: CheckoutActionCreator;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let store: CheckoutStore;
    let strategy: BraintreeVisaCheckoutPaymentStrategy;
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

        visaCheckoutSDK = {} as VisaCheckoutSDK;
        visaCheckoutSDK.init = jest.fn();
        visaCheckoutSDK.on = jest.fn();

        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(scriptLoader);
        jest.spyOn(visaCheckoutScriptLoader, 'load').mockImplementation(() => Promise.resolve(visaCheckoutSDK));

        const client = createCheckoutClient();
        const paymentClient = createPaymentClient(store);
        const registry = createPaymentStrategyRegistry(store, client, paymentClient);
        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender);
        orderActionCreator = new OrderActionCreator(client, checkoutValidator);
        paymentMethodActionCreator = new PaymentMethodActionCreator(client);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient(store)),
            orderActionCreator
        );

        strategy = new BraintreeVisaCheckoutPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
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

    it('creates an instance of BraintreeVisaCheckoutPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutPaymentStrategy);
    });

    describe('#initialize()', () => {
        let visaCheckoutOptions: PaymentInitializeOptions;

        beforeEach(() => {
            visaCheckoutOptions = { methodId: 'braintreevisacheckout', braintreevisacheckout: {} };
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

        it('initialises the visa checkout payment processor with the right data', async () => {
            await strategy.initialize(visaCheckoutOptions);

            expect(braintreeVisaCheckoutPaymentProcessor.initialize).toHaveBeenCalledWith('clientToken', {
                collectShipping: false,
                currencyCode: 'USD',
                locale: 'en_US',
                subtotal: 190,
            });
        });

        it('calls the visa checkout sdk init method with the processed options', async () => {
            const options = {
                settings: {
                    shipping: { collectShipping: false },
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
                jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction').mockImplementation(cb => cb());
            });

            it('triggers payment success handler in BraintreeVisaCheckoutPaymentProcessor', async () => {
                await strategy.initialize(visaCheckoutOptions);

                expect(braintreeVisaCheckoutPaymentProcessor.handleSuccess).toHaveBeenCalledWith(
                    'data',
                    getShippingAddress(),
                    getBillingAddress()
                );
            });

            it('reloads checkout and payment method', async () => {
                jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout');
                jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod');

                await strategy.initialize(visaCheckoutOptions);

                expect(checkoutActionCreator.loadCurrentCheckout).toHaveBeenCalledTimes(1);
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledTimes(2);
                expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('braintreevisacheckout');
            });

            it('triggers a widgetInteraction action', async () => {
                const widgetInteractionAction = Observable.of(createAction(PaymentStrategyActionType.WidgetInteractionStarted));
                jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction').mockImplementation(() => widgetInteractionAction);

                await strategy.initialize(visaCheckoutOptions);

                expect(store.dispatch).toHaveBeenCalledWith(widgetInteractionAction, { queueId: 'widgetInteraction' });
                expect(paymentStrategyActionCreator.widgetInteraction)
                    .toHaveBeenCalledWith(expect.any(Function), { methodId: 'braintreevisacheckout' });
            });

            it('fires onPaymentSelect when there is been a change in payment method', async () => {
                visaCheckoutOptions.braintreevisacheckout.onPaymentSelect = jest.fn();
                await strategy.initialize(visaCheckoutOptions);

                await new Promise(resolve => process.nextTick(resolve));

                expect(visaCheckoutOptions.braintreevisacheckout.onPaymentSelect).toHaveBeenCalled();
            });
        });

        it('triggers onError from the options when there is a payment error', async () => {
            visaCheckoutOptions.braintreevisacheckout.onError = jest.fn();
            const errorMock = new Error();
            visaCheckoutSDK.on = jest.fn((type, callback) => type === 'payment.error' ? callback('data', errorMock) : undefined);
            await strategy.initialize(visaCheckoutOptions);

            expect(visaCheckoutOptions.braintreevisacheckout.onError).toHaveBeenCalledWith(errorMock);
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;
        let visaCheckoutOptions: PaymentInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = Observable.of(createAction(SUBMIT_PAYMENT_REQUESTED));
            paymentMethodMock.initializationData = { nonce: 'payment-nonce-for-visacheckout' };

            visaCheckoutOptions = { methodId: 'braintreevisacheckout', braintreevisacheckout: {} };

            paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), visaCheckoutOptions);
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    nonce: 'payment-nonce-for-visacheckout',
                },
            };

            await strategy.initialize(visaCheckoutOptions);
            await strategy.execute(orderRequestBody, visaCheckoutOptions);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('throws if a nonce is not present', async () => {
            paymentMethodMock.initializationData = {};

            await strategy.initialize(visaCheckoutOptions);

            try {
                await strategy.execute(orderRequestBody, visaCheckoutOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#deinitialize()', () => {
        beforeEach(async () => {
            braintreeVisaCheckoutPaymentProcessor.deinitialize = jest.fn(() => Promise.resolve());
            await strategy.initialize({ methodId: 'braintreevisacheckout', braintreevisacheckout: {} });
        });

        it('deinitializes BraintreeVisaCheckoutPaymentProcessor', async () => {
            await strategy.deinitialize();
            expect(braintreeVisaCheckoutPaymentProcessor.deinitialize).toHaveBeenCalled();
        });
    });
});
