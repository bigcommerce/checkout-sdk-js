import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import createPaymentClient from '../../create-payment-client';
import createPaymentStrategyRegistry from '../../create-payment-strategy-registry';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getBraintreeVisaCheckout } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import { PaymentStrategyActionType } from '../../payment-strategy-actions';

import BraintreeVisaCheckoutPaymentProcessor from './braintree-visacheckout-payment-processor';
import BraintreeVisaCheckoutPaymentStrategy from './braintree-visacheckout-payment-strategy';
import createBraintreeVisaCheckoutPaymentProcessor from './create-braintree-visacheckout-payment-processor';
import { VisaCheckoutSDK } from './visacheckout';
import VisaCheckoutScriptLoader from './visacheckout-script-loader';

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
        const requestSender = createRequestSender();
        braintreeVisaCheckoutPaymentProcessor = createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender);
        braintreeVisaCheckoutPaymentProcessor.initialize = jest.fn(() => Promise.resolve());
        braintreeVisaCheckoutPaymentProcessor.handleSuccess = jest.fn(() => Promise.resolve());

        paymentMethodMock = { ...getBraintreeVisaCheckout(), clientToken: 'clientToken' };

        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        visaCheckoutSDK = {} as VisaCheckoutSDK;
        visaCheckoutSDK.init = jest.fn();
        visaCheckoutSDK.on = jest.fn();

        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(scriptLoader);
        jest.spyOn(visaCheckoutScriptLoader, 'load').mockImplementation(() => Promise.resolve(visaCheckoutSDK));

        const paymentClient = createPaymentClient(store);
        const spamProtection = createSpamProtection(createScriptLoader());
        const registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const configRequestSender = new ConfigRequestSender(createRequestSender());
        const configActionCreator = new ConfigActionCreator(configRequestSender);
        const checkoutValidator = new CheckoutValidator(checkoutRequestSender);

        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            checkoutValidator,
            new SpamProtectionActionCreator(spamProtection)
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient(store)),
            orderActionCreator,
            new PaymentRequestTransformer()
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
            visaCheckoutSDK.on = jest.fn((_, callback) => callback());
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
                const widgetInteractionAction = of(createAction(PaymentStrategyActionType.WidgetInteractionStarted));
                jest.spyOn(paymentStrategyActionCreator, 'widgetInteraction').mockImplementation(() => widgetInteractionAction);

                await strategy.initialize(visaCheckoutOptions);

                expect(store.dispatch).toHaveBeenCalledWith(widgetInteractionAction, { queueId: 'widgetInteraction' });
                expect(paymentStrategyActionCreator.widgetInteraction)
                    .toHaveBeenCalledWith(expect.any(Function), { methodId: 'braintreevisacheckout' });
            });

            it('fires onPaymentSelect when there is been a change in payment method', async () => {
                const onPaymentSelect = jest.fn();

                await strategy.initialize({
                    ...visaCheckoutOptions,
                    braintreevisacheckout: {
                        onPaymentSelect,
                    },
                });

                await new Promise(resolve => process.nextTick(resolve));

                expect(onPaymentSelect).toHaveBeenCalled();
            });
        });

        it('triggers onError from the options when there is a payment error', async () => {
            const onError = jest.fn();
            const errorMock = new Error();

            visaCheckoutSDK.on = jest.fn((type, callback) => type === 'payment.error' ? callback('data', errorMock) : undefined);

            await strategy.initialize({
                ...visaCheckoutOptions,
                braintreevisacheckout: {
                    onError,
                },
            });

            expect(onError).toHaveBeenCalledWith(errorMock);
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;
        let visaCheckoutOptions: PaymentInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
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

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
