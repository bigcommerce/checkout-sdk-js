import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { of, Observable } from 'rxjs';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { NotImplementedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType } from '../../../order';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { getPaypalCommerce } from '../../payment-methods.mock';

import { ButtonsOptions, ParamsRenderHostedFields, PaypalCommerceHostedFields, PaypalCommerceHostedFieldsApprove, PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceSDK } from './index';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommercePaymentProcessor', () => {
    let paypal: PaypalCommerceSDK;
    let paypalScriptLoader: PaypalCommerceScriptLoader;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let requestSender: RequestSender;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let eventEmitter: EventEmitter;
    let cardFieldsEventEmitter: EventEmitter;
    let hostedFormOptions: ParamsRenderHostedFields;
    let cardFields: PaypalCommerceHostedFields;
    let cart: Cart;
    let containers: HTMLElement[];
    let render: () => void;
    let renderApmFields: (container: string) => void;
    let submit: () => (PaypalCommerceHostedFieldsApprove);
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
        cardFieldsEventEmitter = new EventEmitter();

        orderID = 'ORDER_ID';
        fundingSource = 'paypal';
        cart = getCart();
        paymentMethodMock = getPaypalCommerce();
        submit = jest.fn(() => ({ orderId: orderID, liabilityShift: 'POSSIBLE' }));

        cardFields = {
            submit,
            on: jest.fn((eventName, callback) => {
                cardFieldsEventEmitter.on(eventName, callback);
            }),
            getState: jest.fn(() => ({
                cards: [],
                emittedBy: '',
                fields: {},
            })),
        };

        paypal = {
            ...getPaypalCommerceMock(),
            HostedFields: {
                render: jest.fn(() => Promise.resolve(cardFields)),
                isEligible: () => true,
            },
        };

        jest.spyOn(paypalCommerceRequestSender, 'setupPayment')
            .mockImplementation(jest.fn().mockReturnValue(Promise.resolve({ body: orderID })));

        renderApmFields = jest.fn();
        jest.spyOn(paypal, 'PaymentFields')
            .mockImplementation(jest.fn().mockReturnValue({ render: renderApmFields }));

        render = jest.fn();
        jest.spyOn(paypal, 'Buttons')
            .mockImplementation((options: ButtonsOptions) => {
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
                        options.onApprove({orderID}, { order: {
                                get: jest.fn(),
                            },
                            resolve: jest.fn(),
                            reject: jest.fn()},
                            );
                    }
                });

                return {
                    render,
                    isEligible: () => true,
                };
            });

        jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
            .mockReturnValue(Promise.resolve(paypal));

        hostedFormOptions = {
            fields: {
                number: { selector: 'cardCode', placeholder: 'Card code' },
                expirationDate: { selector: 'cardName', placeholder: 'Card name' },
                cvv: { selector: 'cardNumber', placeholder: 'Card number' },
            },
            styles: {
                input: {
                    color: '#000',
                },
                '.invalid': {
                    color: '#f00',
                    fontWeight: 'bold',
                },
                ':focus': {
                    color: '#00f',
                },
            },
        };

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
            paymentActionCreator
        );

    });

    afterEach(() => {
        containers.forEach(container => {
            container.parentElement?.removeChild(container);
        });
    });

    describe('initialize', () => {
        it('initializes PaypalCommerce and PayPal JS clients', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');

            expect(paypalScriptLoader.loadPaypalCommerce).toHaveBeenCalledWith(paymentMethodMock, 'USD', undefined);
        });

        it('throws error if unable to initialize PaypalCommerce or PayPal JS client', async () => {
            const expectedError = new Error('Unable to load JS client');

            jest.spyOn(paypalScriptLoader, 'loadPaypalCommerce')
                .mockReturnValue(Promise.reject(expectedError));

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

            jest.spyOn(paypal, 'Buttons')
                .mockImplementation(() => {
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

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.setupPayment)
                .toHaveBeenCalledWith(cart.id, { isCredit: false, isAPM: false, isVenmo: false });
        });

        it('create order with credit (post request to server) when PayPalCommerce payment details are setup payment', async () => {
            fundingSource = 'credit';

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container');

            eventEmitter.emit('onClick');

            eventEmitter.emit('createOrder');

            await new Promise(resolve => process.nextTick(resolve));

            expect(paypalCommerceRequestSender.setupPayment)
                .toHaveBeenCalledWith(cart.id, { isCredit: true, isAPM: false , isVenmo: false });
        });

        // it('call onApprove when PayPalCommerce payment details are tokenized', async () => {
        //     const onApprove = jest.fn();
        //     await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
        //     await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', { onApprove });
        //
        //     eventEmitter.emit('approve');
        //
        //     await new Promise(resolve => process.nextTick(resolve));
        //
        //     expect(onApprove).toHaveBeenCalledWith({ orderID }, {order: {
        //         get: jest.fn()
        //         },
        //         resolve: jest.fn(),
        //         reject: jest.fn()
        //     });
        // });

        it('call setShippingOptions', async () => {
            const setShippingDataMock = {
                amount: {
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: '100',
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: '100',
                        },
                        tax_total: {
                            currency_code: 'USD',
                            value: '100',
                        },
                    },
                    currency_code: 'USD',
                    value: '100',
                },
                orderID: '123',
                payment_token: 'PAYMENT_TOKEN',
                shipping_address: {
                    city: 'Los-Angeles',
                    postal_code: '08547',
                    country_code: 'US',
                    state: 'CA',
                },
                selected_shipping_option: {
                    id: '123',
                    amount: {
                        currency_code: 'USD',
                        value: '100',
                    },
                },
                availableShippingOptions: {},
                cartId: '1'
            };
            const setShippingOptions = paypalCommerceRequestSender.setShippingOptions = jest.fn();
            await paypalCommercePaymentProcessor.setShippingOptions(setShippingDataMock);
            expect(setShippingOptions).toHaveBeenCalled();
        });

        it('throw error if button is not eligible', async () => {
            const expectedError = new NotImplementedError(`PayPal credit is not available for your region. Please use PayPal Checkout instead.`);
            jest.spyOn(paypal, 'Buttons')
                .mockImplementation(() => ({ isEligible: () => false }));

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
                await paypalCommercePaymentProcessor.renderButtons(cart.id, 'container', {}, { fundingKey: 'CREDIT' });
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('render apmFields', () => {
        it('sets PaypalCommerce apmFields without styles and fields predifined values', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderFields({apmFieldsContainer: '#fieldsContainer', fundingKey: 'P24'});

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
            await paypalCommercePaymentProcessor.renderFields({apmFieldsContainer: '#fieldsContainer', fundingKey: 'P24'});

            expect(renderApmFields).toHaveBeenCalledWith('#fieldsContainer');
        });

        it('throws error if unable to set PayPalCommerce fields', async () => {
            /* tslint:disable-next-line */
            paypal.PaymentFields = undefined!;

            const expectedError = new PaymentMethodClientUnavailableError();

            try {
                await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
                await paypalCommercePaymentProcessor.renderFields({apmFieldsContainer: '#fieldsContainer', fundingKey: 'P24'});
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
            await paypalCommercePaymentProcessor.renderFields({apmFieldsContainer: '#fieldsContainer', fundingKey: 'P24'});

            expect(container.innerHTML).toEqual('');
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

    describe('Hosted Fields', () => {
        it('setting and render PaypalCommerce Hosted Fields without events', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions);

            expect(paypal.HostedFields.render).toHaveBeenCalledWith({
                ...hostedFormOptions,
                createOrder: expect.any(Function),
                paymentsSDK: true,
            });
        });

        it('notifies when field receives focus', async () => {
            const handleFocus = jest.fn();

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions, { focus: handleFocus });

            cardFieldsEventEmitter.emit('focus', { fieldType: 'cardCode' });

            expect(handleFocus)
                .toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies when field loses focus', async () => {
            const handleBlur = jest.fn();

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions, { blur: handleBlur });

            cardFieldsEventEmitter.emit('blur', { fieldType: 'cardCode' });

            expect(handleBlur)
                .toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies when input receives submit event', async () => {
            const handleEnter = jest.fn();

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions, { inputSubmitRequest: handleEnter });

            cardFieldsEventEmitter.emit('inputSubmitRequest', { fieldType: 'cardCode' });

            expect(handleEnter)
                .toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies when card number changes', async () => {
            const handleCardTypeChange = jest.fn();

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions, { cardTypeChange: handleCardTypeChange });

            cardFieldsEventEmitter.emit('cardTypeChange', { cardType: 'Visa' });

            expect(handleCardTypeChange)
                .toHaveBeenCalledWith({ cardType: 'Visa' });
        });

        it('notifies when there are validation errors', async () => {
            const handleValidate = jest.fn();
            const fields = {
                cardCode: { isValid: false },
                cardNumber: { isValid: false },
                cardExpiry: { isValid: false },
            };

            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions, { validityChange: handleValidate });

            cardFieldsEventEmitter.emit('validityChange', { fields });

            expect(handleValidate)
                .toHaveBeenCalledWith({ fields });
        });

        it('submit Hosted Fields when call submitHostedFields', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions);
            await paypalCommercePaymentProcessor.submitHostedFields({
                cardholderName: 'cardholderName',
                contingencies: undefined,
            });

            expect(submit).toHaveBeenCalledWith({ cardholderName: 'cardholderName' });
        });

        it('submitHostedFields should return orderId', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions);
            const result = await paypalCommercePaymentProcessor.submitHostedFields();

            expect(result.orderId).toEqual(orderID);
        });

        it('getHostedFieldsValidationState should return isValid = false and fields', async () => {
            const fields = {
                cvv: { isValid: false },
                expirationDate: { isValid: false },
                number: { isValid: false },
            };
            cardFields.getState = jest.fn(() => ({
                cards: [],
                emittedBy: '',
                fields,
            }));
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions);

            expect(await paypalCommercePaymentProcessor.getHostedFieldsValidationState()).toEqual({ isValid: false, fields });
        });

        it('getHostedFieldsValidationState should return isValid = true and fields', async () => {
            await paypalCommercePaymentProcessor.initialize(paymentMethodMock, 'USD');
            await paypalCommercePaymentProcessor.renderHostedFields(cart.id, hostedFormOptions);

            expect(await paypalCommercePaymentProcessor.getHostedFieldsValidationState()).toEqual({ isValid: true, fields: {} });
        });
    });

});
