import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getPaypalCommerce } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { PaypalCommercePaymentInitializeOptions, PaypalCommercePaymentProcessor, PaypalCommercePaymentStrategy, PaypalCommerceRequestSender, PaypalCommerceScriptLoader } from './index';

describe('PaypalCommercePaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paypalCommercePaymentStrategy: PaymentStrategy;
    let paymentMethod: PaymentMethod;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let options: PaymentInitializeOptions;
    let requestSender: RequestSender;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paypalcommerceOptions: PaypalCommercePaymentInitializeOptions;
    let eventEmitter: EventEmitter;
    let cart: Cart;
    let orderID: string;
    let submitForm: () => void;

    beforeEach(() => {
        paymentMethod = { ...getPaypalCommerce() };
        cart = { ...getCart() };
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        requestSender = createRequestSender();
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(new PaypalCommerceScriptLoader(getScriptLoader()), new PaypalCommerceRequestSender(requestSender));
        eventEmitter = new EventEmitter();

        store = createCheckoutStore(getCheckoutStoreState());
        submitForm = jest.fn();

        paypalcommerceOptions = {
            container: '#container',
            style: {},
            submitForm,
            onRenderButton: jest.fn(),
        };

        options = {
            methodId: paymentMethod.id,
            paypalcommerce: paypalcommerceOptions,
        };

        orderID = 'ORDER_ID';

        jest.spyOn(store, 'dispatch');

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod, { methodId: paymentMethod.id })));

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderButtons')
            .mockImplementation((...arg) => {
                const [, , options] = arg;

                eventEmitter.on('onApprove', () => {
                    if (options.onApprove) {
                        options.onApprove({ orderID });
                    }
                });
            });

        paypalCommercePaymentStrategy = new PaypalCommercePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paypalCommercePaymentProcessor
        );
    });

    describe('#initialize()', () => {
        it('returns checkout state', async () => {
            const output = await paypalCommercePaymentStrategy.initialize(options);

            expect(output).toEqual(store.getState());
        });

        it('not initialize paypalCommercePaymentProcessor if orderId is not undefined', async () => {
            await paypalCommercePaymentStrategy.initialize(options);

            expect(paypalCommercePaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('initialize paypalCommercePaymentProcessor if orderId is undefined', async () => {
            paymentMethod.initializationData.orderId = undefined;
            await paypalCommercePaymentStrategy.initialize(options);

            const obj = {
                    'client-id': 'abc',
                    commit: true,
                    currency: 'USD',
                    intent: 'capture',
                };

            expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(obj);
        });

        it('render PayPal button if orderId is undefined', async () => {
            paymentMethod.initializationData.orderId = undefined;
            await paypalCommercePaymentStrategy.initialize(options);

            const buttonOption = {
                onApprove: expect.any(Function),
                style: paypalcommerceOptions.style,
            };

            const optionalParams = { fundingKey: 'PAYPAL', paramsForProvider: { isCheckout: true }, onRenderButton: expect.any(Function) };

            expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(cart.id, `${paypalcommerceOptions.container}`, buttonOption, optionalParams);
        });

        it('render Credit PayPal button if orderId is undefined', async () => {
            paypalCommercePaymentStrategy = new PaypalCommercePaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                paypalCommercePaymentProcessor,
                true
            );

            paymentMethod.initializationData.orderId = undefined;
            await paypalCommercePaymentStrategy.initialize(options);

            const buttonOption = {
                onApprove: expect.any(Function),
                style: paypalcommerceOptions.style,
            };

            const optionalParams = { fundingKey: 'PAYLATER', paramsForProvider: { isCheckout: true }, onRenderButton: expect.any(Function) };

            expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(cart.id, `${paypalcommerceOptions.container}`, buttonOption, optionalParams);
        });

        it('call submitForm after approve', async () => {
            paymentMethod.initializationData.orderId = undefined;

            await paypalCommercePaymentStrategy.initialize(options);

            eventEmitter.emit('onApprove');

            await new Promise(resolve => process.nextTick(resolve));

            expect(submitForm).toHaveBeenCalled();
        });

        it('throw error if paypalcommerce is undefined', async () => {
            paymentMethod.initializationData.orderId = undefined;
            const expectedError = new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument is not provided.');

            try {
                await paypalCommercePaymentStrategy.initialize({ ...options, paypalcommerce: undefined });
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
        });

        it('pass the options to submitOrder', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), options);
        });

        it('calls submit order', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submitPayment with the right information', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: {
                            order_id: paymentMethod.initializationData.orderId,
                        },
                    },
                },
            };

            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
        });

        it('calls submit payment', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('throw error without payment data', async () => {
            orderRequestBody.payment = undefined;

            await paypalCommercePaymentStrategy.initialize(options);

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentArgumentInvalidError(['payment']));
            }
        });

        it('throw error without orderId', async () => {
            orderID = '';

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentMethodInvalidError());
            }
        });
    });
});
