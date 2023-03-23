import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { Observable, of } from 'rxjs';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { NotImplementedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType } from '../../../order';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { getPaypalCommerce } from '../../payment-methods.mock';

import { getPaypalCommerceMock } from './paypal-commerce.mock';

import {
    ButtonsOptions,
    PaypalCommercePaymentProcessor,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
    PaypalCommerceSDK,
} from './index';

describe('PaypalCommercePaymentProcessor', () => {
    let paypal: PaypalCommerceSDK;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let requestSender: RequestSender;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let eventEmitter: EventEmitter;
    let cart: Cart;
    let containers: HTMLElement[];
    let render: () => void;
    let renderApmFields: (container: string) => void;
    let orderID: string;
    let fundingSource: string;
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let paymentMethodMock: PaymentMethod;

    function appendContainer(id: string): HTMLElement {
        const container = document.createElement('div');

        container.id = id;
        document.body.appendChild(container);

        return container;
    }

    beforeEach(() => {
        requestSender = createRequestSender();
        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
        eventEmitter = new EventEmitter();

        orderID = 'ORDER_ID';
        fundingSource = 'paypal';
        cart = getCart();
        paymentMethodMock = getPaypalCommerce();

        paypal = getPaypalCommerceMock();

        jest.spyOn(paypalCommerceRequestSender, 'setupPayment').mockImplementation(
            jest.fn().mockReturnValue(Promise.resolve({ body: orderID })),
        );

        renderApmFields = jest.fn();
        jest.spyOn(paypal, 'PaymentFields').mockImplementation(
            jest.fn().mockReturnValue({ render: renderApmFields }),
        );

        render = jest.fn();
        jest.spyOn(paypal, 'Buttons').mockImplementation((options: ButtonsOptions) => {
            eventEmitter.on('onClick', () => {
                if (options.onClick) {
                    options.onClick({ fundingSource }, { reject: jest.fn(), resolve: jest.fn() });
                }
            });

            eventEmitter.on('createOrder', () => {
                if (options.createOrder) {
                    options.createOrder();
                }
            });

            eventEmitter.on('approve', () => {
                if (options.onApprove) {
                    options.onApprove({ orderID });
                }
            });

            return {
                render,
                isEligible: () => true,
            };
        });

        jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(Promise.resolve(paypal));

        containers = [
            appendContainer('cardCode'),
            appendContainer('cardName'),
            appendContainer('cardNumber'),
            appendContainer('cardExpiry'),
        ];

        store = createCheckoutStore(getCheckoutStoreState());
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(
            paypalScriptLoader,
            paypalCommerceRequestSender,
            store,
            orderActionCreator,
            paymentActionCreator,
        );
    });

    afterEach(() => {
        containers.forEach((container) => {
            container.parentElement?.removeChild(container);
        });
    });

    describe('initialize', () => {
        it('initializes PaypalCommerce and PayPal JS clients', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');

            expect(paypalScriptLoader.getPayPalSDK).toHaveBeenCalledWith(
                paymentMethodMock,
                'USD',
                undefined,
            );
        });

        it('throws error if unable to initialize PaypalCommerce or PayPal JS client', async () => {
            const expectedError = new Error('Unable to load JS client');

            jest.spyOn(paypalScriptLoader, 'getPayPalSDK').mockReturnValue(
                Promise.reject(expectedError),
            );

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('renderButtons', () => {
        it('setting PaypalCommerce checkout button without button options', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');

            expect(paypal.Buttons).toHaveBeenCalledWith({
                onClick: expect.any(Function),
                createOrder: expect.any(Function),
            });
        });

        it('render PayPalCommerce checkout button', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');

            expect(render).toHaveBeenCalledWith('container');
        });

        it('throws error if unable to setting PayPalCommerce button', async () => {
            const expectedError = new Error('Unable to setting PayPal button');

            jest.spyOn(paypal, 'Buttons').mockImplementation(() => {
                throw expectedError;
            });

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
                await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });

        it('create order (post request to server) when PayPalCommerce payment details are setup payment', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');

            eventEmitter.emit('onClick');

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.setupPayment).toHaveBeenCalledWith(cart.id, {
                isCredit: false,
                isAPM: false,
                isVenmo: false,
            });
        });

        it('create order with credit (post request to server) when PayPalCommerce payment details are setup payment', async () => {
            fundingSource = 'credit';

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');

            eventEmitter.emit('onClick');

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.setupPayment).toHaveBeenCalledWith(cart.id, {
                isCredit: true,
                isAPM: false,
                isVenmo: false,
            });
        });

        it('call onApprove when PayPalCommerce payment details are tokenized', async () => {
            const onApprove = jest.fn();

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', { onApprove });

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(onApprove).toHaveBeenCalledWith({ orderID });
        });

        it('throw error if button is not eligible', async () => {
            const expectedError = new NotImplementedError(
                `PayPal credit is not available for your region. Please use PayPal Checkout instead.`,
            );

            jest.spyOn(paypal, 'Buttons').mockImplementation(() => ({ isEligible: () => false }));

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
                await paypalCommercePaymentProcessor.renderButtons(
                    cart.id,
                    'container',
                    {},
                    { fundingKey: 'CREDIT' },
                );
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('render apmFields', () => {
        it('sets PaypalCommerce apmFields without styles and fields predifined values', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderFields({
                apmFieldsContainer: '#fieldsContainer',
                fundingKey: 'P24',
            });

            expect(paypal.PaymentFields).toHaveBeenCalledWith({
                fundingSource: 'p24',
                style: undefined,
                fields: {
                    name: {
                        value: undefined,
                    },
                    email: {
                        value: undefined,
                    },
                },
            });
        });

        it('render PaypalCommerce apmFields', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderFields({
                apmFieldsContainer: '#fieldsContainer',
                fundingKey: 'P24',
            });

            expect(renderApmFields).toHaveBeenCalledWith('#fieldsContainer');
        });

        it('throws error if unable to set PayPalCommerce fields', async () => {
            /* tslint:disable-next-line */
            paypal.PaymentFields = undefined!;

            const expectedError = new PaymentMethodClientUnavailableError();

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
                await paypalCommercePaymentProcessor.renderFields({
                    apmFieldsContainer: '#fieldsContainer',
                    fundingKey: 'P24',
                });
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });

        it('should clear PaypalCommerce apmFields container on re-render', async () => {
            const container = document.createElement('div');

            container.id = 'fieldsContainer';
            container.innerHTML = 'Test';
            document.body.appendChild(container);

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderFields({
                apmFieldsContainer: '#fieldsContainer',
                fundingKey: 'P24',
            });

            expect(container.innerHTML).toBe('');
        });
    });

    describe('validate style for PaypalCommerce checkout button', () => {
        it('invalid all data', async () => {
            const style: any = {
                layout: 'aaa',
                color: 'aaa',
                shape: 'aaa',
                height: 5,
                label: 'aaa',
                tagline: true,
            };

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', { style });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                onClick: expect.any(Function),
                createOrder: expect.any(Function),
                style: { height: 25 },
            });
        });

        it('invalid height and valid other', async () => {
            const style: any = {
                height: 100,
                tagline: true,
                layout: 'horizontal',
            };

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', { style });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                onClick: expect.any(Function),
                createOrder: expect.any(Function),
                style: { tagline: true, layout: 'horizontal', height: 55 },
            });
        });

        it('invalid height - not number', async () => {
            const style: any = { height: '' };

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', { style });

            expect(paypal.Buttons).toHaveBeenCalledWith({
                onClick: expect.any(Function),
                createOrder: expect.any(Function),
                style: {},
            });
        });
    });
});
