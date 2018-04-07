import { omit } from 'lodash';

import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getCart } from '../../../cart/internal-carts.mock';
import { CheckoutSelector, CheckoutStore } from '../../../checkout';
import { MissingDataError, StandardError } from '../../../common/error/errors';
import { getLegacyAppConfig } from '../../../config/configs.mock.js';
import { OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PlaceOrderService from '../../../order/place-order-service';
import PaymentMethod from '../../payment-method';
import { getBraintreePaypal } from '../../payment-methods.mock';
import { InitializeOptions } from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

describe('BraintreePaypalPaymentStrategy', () => {
    let placeOrderService: PlaceOrderService;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreePaypalPaymentStrategy: BraintreePaypalPaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let checkoutMock: CheckoutSelector;
    let store: CheckoutStore;

    beforeEach(() => {
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.preloadPaypal = jest.fn(() => Promise.resolve());
        braintreePaymentProcessorMock.paypal = jest.fn(() => Promise.resolve({ nonce: 'my_tokenized_card' }));
        braintreePaymentProcessorMock.appendSessionId = jest.fn(tokenizedCard => tokenizedCard.then(card => ({ ...card, deviceSessionId: 'my_session_id' })));
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintreePaypal(), clientToken: 'myToken' };

        checkoutMock = {} as CheckoutSelector;
        checkoutMock.isPaymentDataRequired = jest.fn((useStoreCredit: boolean) => true);
        store = {} as CheckoutStore;
        store.getState = jest.fn(() => ({ checkout: checkoutMock }));

        placeOrderService = {} as PlaceOrderService;
        placeOrderService.submitPayment = jest.fn(() => Promise.resolve());
        placeOrderService.submitOrder = jest.fn(() => Promise.resolve());
        placeOrderService.loadPaymentMethod = jest.fn(() => Promise.resolve(store.getState()));

        braintreePaypalPaymentStrategy = new BraintreePaypalPaymentStrategy(store, placeOrderService, braintreePaymentProcessorMock);
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(braintreePaypalPaymentStrategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree payment processor with the client token and the set of options', async () => {
            checkoutMock.getPaymentMethod = jest.fn(() => ({ ...getBraintreePaypal(), clientToken: 'myToken' }));
            const options = {} as InitializeOptions;
            options.paymentMethod = getBraintreePaypal();
            await braintreePaypalPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledWith('myToken', options);
        });

        it('preloads paypal', async () => {
            checkoutMock.getPaymentMethod = jest.fn(() => ({ ...getBraintreePaypal(), clientToken: 'myToken' }));
            const options = {} as InitializeOptions;
            options.paymentMethod = getBraintreePaypal();
            await braintreePaypalPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.preloadPaypal).toHaveBeenCalled();
        });

        it('skips all initialization if a nonce is present in the paymentProvider', async () => {
            const options = {} as InitializeOptions;
            options.paymentMethod = { ...getBraintreePaypal(), nonce: 'some-nonce' };
            await braintreePaypalPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.preloadPaypal).not.toHaveBeenCalled();
            expect(braintreePaymentProcessorMock.initialize).not.toHaveBeenCalled();
        });

        it('throws error if unable to initialize', async () => {
            const paymentMethod = getBraintreePaypal();
            checkoutMock.getPaymentMethod = jest.fn(() => paymentMethod);

            try {
                await braintreePaypalPaymentStrategy.initialize({ paymentMethod });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let options: InitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            options = { paymentMethod: getBraintreePaypal() };
            checkoutMock.getCart = jest.fn(() => getCart());
            checkoutMock.getBillingAddress = jest.fn(() => getBillingAddress());
            checkoutMock.getPaymentMethod = jest.fn(() => paymentMethodMock);
            checkoutMock.getConfig = jest.fn(() => getLegacyAppConfig());
            return braintreePaypalPaymentStrategy.initialize(options);
        });

        it('calls submit order with the order request information', async () => {
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), expect.any(Boolean), expect.any(Object));
        });

        it('asks for cart verification', async () => {
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(expect.any(Object), true, expect.any(Object));
        });

        it('pass the options to submitOrder', async () => {
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);
            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), options);
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    deviceSessionId: 'my_session_id',
                    method: 'paypal',
                    nonce: 'my_tokenized_card',
                },
            };

            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(190, 'en_US', 'USD', false);
            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(expected, false, options);
        });

        it('does not call paypal if a nonce is present', async () => {
            options.paymentMethod = { ...getBraintreePaypal(), nonce: 'some-nonce' };
            await braintreePaypalPaymentStrategy.initialize(options);
            const expected = expect.objectContaining({
                paymentData: {
                    method: 'paypal',
                    nonce: 'some-nonce',
                },
            });

            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.paypal).not.toHaveBeenCalled();
            expect(placeOrderService.submitPayment)
                .toHaveBeenCalledWith(expected, false, options);
        });

        it('converts any error returned by braintree in a StandardError', async () => {
            braintreePaymentProcessorMock.paypal = () => Promise.reject({ name: 'BraintreeError', message: 'my_message'});
            await expect(braintreePaypalPaymentStrategy.execute(orderRequestBody, options)).rejects.toEqual(expect.any(StandardError));
        });

        describe('if paypal credit', () => {
            beforeEach(() => {
                braintreePaypalPaymentStrategy = new BraintreePaypalPaymentStrategy(store, placeOrderService, braintreePaymentProcessorMock, true);
            });

            it('submitPayment with the right information and sets credit to true', async () => {
                options.paymentMethod = getBraintreePaypal();
                await braintreePaypalPaymentStrategy.initialize(options);
                const expected = {
                    ...orderRequestBody.payment,
                    paymentData: {
                        deviceSessionId: 'my_session_id',
                        method: 'paypal',
                        nonce: 'my_tokenized_card',
                    },
                };

                await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

                expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(190, 'en_US', 'USD', true);
                expect(placeOrderService.submitPayment)
                    .toHaveBeenCalledWith(expected, false, options);
            });
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            braintreePaymentProcessorMock.deinitialize = jest.fn(() => Promise.resolve());
            await braintreePaypalPaymentStrategy.deinitialize({});
            expect(braintreePaymentProcessorMock.deinitialize).toHaveBeenCalled();
        });
    });
});
