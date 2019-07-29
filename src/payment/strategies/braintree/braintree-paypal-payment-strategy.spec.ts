import { createAction, Action } from '@bigcommerce/data-store';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentMethodCancelledError } from '../../errors';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import { getBraintreePaypal } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreePaypalPaymentStrategy from './braintree-paypal-payment-strategy';

describe('BraintreePaypalPaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreePaypalPaymentStrategy: PaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let loadPaymentMethodAction: Observable<Action>;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    beforeEach(() => {
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.preloadPaypal = jest.fn(() => Promise.resolve());
        braintreePaymentProcessorMock.paypal = jest.fn(() => Promise.resolve({ nonce: 'my_tokenized_card' }));
        braintreePaymentProcessorMock.appendSessionId = jest.fn(tokenizedCard => tokenizedCard.then((card: NonceInstrument) => ({ ...card, deviceSessionId: 'my_session_id' })));
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintreePaypal(), clientToken: 'myToken' };
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));

        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch');

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        paymentMethodActionCreator = {} as PaymentMethodActionCreator;
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);

        braintreePaypalPaymentStrategy = new BraintreePaypalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessorMock
        );
    });

    it('creates an instance of the braintree payment strategy', () => {
        expect(braintreePaypalPaymentStrategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree payment processor with the client token and the set of options', async () => {
            const options = { methodId: paymentMethodMock.id, braintree: {} };

            await braintreePaypalPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledWith('myToken', options.braintree);
        });

        it('preloads paypal', async () => {
            await braintreePaypalPaymentStrategy.initialize({ methodId: paymentMethodMock.id });

            expect(braintreePaymentProcessorMock.preloadPaypal).toHaveBeenCalled();
        });

        it('skips all initialization if a nonce is present in the paymentProvider', async () => {
            store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
                paymentMethods: {
                    data: [
                        { ...paymentMethodMock, nonce: 'some-nonce' },
                    ],
                },
            }));

            braintreePaypalPaymentStrategy = new BraintreePaypalPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessorMock
            );

            await braintreePaypalPaymentStrategy.initialize({ methodId: paymentMethodMock.id });

            expect(braintreePaymentProcessorMock.preloadPaypal).not.toHaveBeenCalled();
            expect(braintreePaymentProcessorMock.initialize).not.toHaveBeenCalled();
        });

        it('throws error if unable to initialize', async () => {
            paymentMethodMock.clientToken = undefined;

            try {
                await braintreePaypalPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
            options = { methodId: getBraintreePaypal().id };
        });

        it('calls submit order with the order request information', async () => {
            await braintreePaypalPaymentStrategy.initialize(options);
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await braintreePaypalPaymentStrategy.initialize(options);
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), options);
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

            await braintreePaypalPaymentStrategy.initialize(options);
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(190, 'en_US', 'USD', false);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('passes grand total with store credit to PayPal if it is applied', async () => {
            await braintreePaypalPaymentStrategy.initialize(options);

            const { checkout } = store.getState();

            jest.spyOn(checkout, 'getOutstandingBalance')
                .mockImplementation(useStoreCredit => useStoreCredit ? 150 : 190);

            await braintreePaypalPaymentStrategy.execute({ ...orderRequestBody, useStoreCredit: true }, options);

            expect(checkout.getOutstandingBalance).toHaveBeenCalledWith(true);
            expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(150, 'en_US', 'USD', false);

            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(checkout.getOutstandingBalance).toHaveBeenCalledWith(false);
            expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(190, 'en_US', 'USD', false);
        });

        it('does not call paypal if a nonce is present', async () => {
            paymentMethodMock.nonce = 'some-nonce';

            const expected = expect.objectContaining({
                paymentData: {
                    method: 'paypal',
                    nonce: 'some-nonce',
                },
            });

            await braintreePaypalPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

            expect(braintreePaymentProcessorMock.paypal).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('converts any error returned by braintree in a StandardError', async () => {
            braintreePaymentProcessorMock.paypal = () => Promise.reject({ name: 'BraintreeError', message: 'my_message'});

            await braintreePaypalPaymentStrategy.initialize(options);
            await expect(braintreePaypalPaymentStrategy.execute(orderRequestBody, options)).rejects.toEqual(expect.any(StandardError));
        });

        it('if paypal fails we do not submit an order', async () => {
            braintreePaymentProcessorMock.paypal = () => Promise.reject({ name: 'BraintreeError', message: 'my_message'});
            await braintreePaypalPaymentStrategy.initialize(options);

            try {
                await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
            }
        });

        it('throws cancellation error if shopper dismisses PayPal modal before completing authorization flow', async () => {
            jest.spyOn(braintreePaymentProcessorMock, 'paypal')
                .mockRejectedValue({
                    code: 'PAYPAL_POPUP_CLOSED',
                    message: 'Customer closed PayPal popup before authorizing.',
                    name: 'BraintreeError',
                });

            await braintreePaypalPaymentStrategy.initialize(options);

            try {
                await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodCancelledError);
            }
        });

        describe('if paypal credit', () => {
            beforeEach(() => {
                braintreePaypalPaymentStrategy = new BraintreePaypalPaymentStrategy(
                    store,
                    orderActionCreator,
                    paymentActionCreator,
                    paymentMethodActionCreator,
                    braintreePaymentProcessorMock,
                    true
                );
            });

            it('submitPayment with the right information and sets credit to true', async () => {
                const expected = {
                    ...orderRequestBody.payment,
                    paymentData: {
                        deviceSessionId: 'my_session_id',
                        method: 'paypal',
                        nonce: 'my_tokenized_card',
                    },
                };

                await braintreePaypalPaymentStrategy.initialize(options);
                await braintreePaypalPaymentStrategy.execute(orderRequestBody, options);

                expect(braintreePaymentProcessorMock.paypal).toHaveBeenCalledWith(190, 'en_US', 'USD', true);
                expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
                expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            });
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            braintreePaymentProcessorMock.deinitialize = jest.fn(() => Promise.resolve());

            await braintreePaypalPaymentStrategy.deinitialize({ methodId: paymentMethodMock.id });

            expect(braintreePaymentProcessorMock.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await braintreePaypalPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
