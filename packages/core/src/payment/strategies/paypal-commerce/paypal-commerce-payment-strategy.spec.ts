import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';
import { omit } from 'lodash';
import { Observable, of } from 'rxjs';

import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { getPaypalCommerce } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategyType from '../../payment-strategy-type';
import PaymentStrategy from '../payment-strategy';

import {
    ClickActions,
    PaypalCommerceFundingKeyResolver,
    PaypalCommercePaymentInitializeOptions,
    PaypalCommercePaymentProcessor,
    PaypalCommercePaymentStrategy,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
} from './index';

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
    let paypalcommerceOptions: PaypalCommercePaymentInitializeOptions;
    let paypalCommerceFundingKeyResolver: PaypalCommerceFundingKeyResolver;
    let eventEmitter: EventEmitter;
    let cart: Cart;
    let orderID: string;
    let container: HTMLElement;
    let loader: LoadingIndicator;
    let onClickActions: ClickActions;
    let submitForm: () => void;

    beforeEach(() => {
        paymentMethod = getPaypalCommerce();
        cart = getCart();
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        requestSender = createRequestSender();
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(
            new PaypalCommerceScriptLoader(getScriptLoader()),
            new PaypalCommerceRequestSender(requestSender),
            store,
            orderActionCreator,
            paymentActionCreator,
        );
        eventEmitter = new EventEmitter();
        paypalCommerceFundingKeyResolver = new PaypalCommerceFundingKeyResolver();

        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        store = createCheckoutStore(getCheckoutStoreState());
        submitForm = jest.fn();

        paypalcommerceOptions = {
            container: '#container',
            clientId: '123',
            apmFieldsContainer: '#fieldsContainer',
            apmFieldsStyles: { variables: { colorBackground: 'white' } },
            submitForm,
            onRenderButton: jest.fn(),
            onValidate: jest.fn((resolve, _) => {
                return resolve();
            }),
        };

        loader = new LoadingIndicator();
        jest.spyOn(loader, 'show');

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

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderButtons').mockImplementation((...arg) => {
            const [, , options] = arg;

            eventEmitter.on('onApprove', () => {
                if (options.onApprove) {
                    options.onApprove({ orderID });
                }
            });

            onClickActions = {
                resolve: jest.fn(),
                reject: jest.fn(),
            };

            eventEmitter.on('onClick', () => {
                if (options.onClick) {
                    options.onClick(null, onClickActions);
                }
            });
        });

        paypalCommercePaymentProcessor.renderFields = jest.fn();

        jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('PAYPAL');

        paypalCommercePaymentStrategy = new PaypalCommercePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paypalCommercePaymentProcessor,
            paypalCommerceFundingKeyResolver,
            new PaypalCommerceRequestSender(requestSender),
            loader,
        );
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getPaypalCommerce(),
                initializationData: {
                    ...getPaypalCommerce().initializationData,
                    orderId: undefined,
                    shouldRenderFields: true,
                },
            });
        });

        it('returns checkout state', async () => {
            const output = await paypalCommercePaymentStrategy.initialize(options);

            expect(output).toEqual(store.getState());
        });

        it("doesn't initialize paypalCommercePaymentProcessor if orderId is not undefined", async () => {
            paymentMethod.initializationData.orderId = 'Xz213das';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );

            await paypalCommercePaymentStrategy.initialize(options);

            expect(paypalCommercePaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('initializes paypalCommercePaymentProcessor if orderId is undefined', async () => {
            paymentMethod.initializationData.orderId = undefined;

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethod,
            );

            await paypalCommercePaymentStrategy.initialize(options);

            expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );
        });

        it('renders PayPal button if orderId is undefined', async () => {
            await paypalCommercePaymentStrategy.initialize(options);

            const buttonOption = {
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const optionalParams = {
                fundingKey: 'PAYPAL',
                paramsForProvider: { isCheckout: true },
                onRenderButton: expect.any(Function),
            };

            expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(
                cart.id,
                `${paypalcommerceOptions.container}`,
                { ...buttonOption, style: paymentMethod.initializationData.buttonStyle },
                optionalParams,
            );
        });

        it('renders Credit PayPal button if orderId is undefined', async () => {
            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('PAYLATER');

            options.methodId = PaymentStrategyType.PAYPAL_COMMERCE_CREDIT;

            await paypalCommercePaymentStrategy.initialize(options);

            const buttonOption = {
                onApprove: expect.any(Function),
                onClick: expect.any(Function),
                onCancel: expect.any(Function),
                onError: expect.any(Function),
            };

            const optionalParams = {
                fundingKey: 'PAYLATER',
                paramsForProvider: { isCheckout: true },
                onRenderButton: expect.any(Function),
            };

            expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(
                cart.id,
                `${paypalcommerceOptions.container}`,
                { ...buttonOption, style: paymentMethod.initializationData.buttonStyle },
                optionalParams,
            );
        });

        it('renders Przelewy24 button if orderIdis undefined and methodId is przelewy24', async () => {
            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('P24');

            await paypalCommercePaymentStrategy.initialize({
                ...options,
                gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
                methodId: 'p24',
            });

            expect(paypalCommercePaymentProcessor.renderButtons).toHaveBeenCalledWith(
                cart.id,
                `${paypalcommerceOptions.container}`,
                {
                    onApprove: expect.any(Function),
                    onClick: expect.any(Function),
                    onCancel: expect.any(Function),
                    onError: expect.any(Function),
                    style: paymentMethod.initializationData.buttonStyle,
                },
                {
                    paramsForProvider: { isCheckout: true },
                    onRenderButton: expect.any(Function),
                    fundingKey: 'P24',
                },
            );
        });

        it('renders Przelewy24 fields if orderIdis undefined and methodId is p24', async () => {
            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('P24');

            await paypalCommercePaymentStrategy.initialize({
                ...options,
                gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
                methodId: 'p24',
            });

            const { firstName, lastName, email } = getBillingAddress();

            expect(paypalCommercePaymentProcessor.renderFields).toHaveBeenCalledWith({
                apmFieldsContainer: paypalcommerceOptions.apmFieldsContainer,
                fundingKey: 'P24',
                apmFieldsStyles: paypalcommerceOptions.apmFieldsStyles,
                fullName: `${firstName} ${lastName}`,
                email,
            });
        });

        it('does not render APM fields when shouldRenderFields is false', async () => {
            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('P24');
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getPaypalCommerce(),
                initializationData: {
                    ...getPaypalCommerce().initializationData,
                    orderId: undefined,
                    shouldRenderFields: false,
                },
            });

            await paypalCommercePaymentStrategy.initialize({
                ...options,
                gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
                methodId: 'p24',
            });

            expect(paypalCommercePaymentProcessor.renderFields).not.toHaveBeenCalled();
        });

        it("throws an error if apmFieldsContainer wasn't provided when trying to initialize Przelewy24 method", async () => {
            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('P24');
            paypalcommerceOptions.apmFieldsContainer = undefined;

            const expectedError = new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce" argument should contain "apmFieldsContainer".',
            );

            try {
                await paypalCommercePaymentStrategy.initialize({
                    ...options,
                    gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
                    methodId: 'p24',
                });
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });

        it('calls submitForm after approve', async () => {
            await paypalCommercePaymentStrategy.initialize(options);

            eventEmitter.emit('onApprove');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(submitForm).toHaveBeenCalled();
        });

        it('calls onValidate onclick', async () => {
            await paypalCommercePaymentStrategy.initialize(options);

            eventEmitter.emit('onClick');

            expect(paypalcommerceOptions.onValidate).toHaveBeenCalled();
        });

        it('shows loader if validation is passed onclick', async () => {
            await paypalCommercePaymentStrategy.initialize(options);

            eventEmitter.emit('onClick');

            expect(loader.show).toHaveBeenCalled();
        });

        it('throws error if paypalcommerce is undefined', async () => {
            const expectedError = new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce" argument is not provided.',
            );

            try {
                await paypalCommercePaymentStrategy.initialize({
                    ...options,
                    paypalcommerce: undefined,
                });
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = { payment: { methodId: PaymentStrategyType.PAYPAL_COMMERCE } };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getPaypalCommerce(),
            });
        });

        it('passes the options to submitOrder', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                omit(orderRequestBody, 'payment'),
                options,
            );
        });

        it('calls submit order', async () => {
            await paypalCommercePaymentStrategy.initialize(options);
            await paypalCommercePaymentStrategy.execute(orderRequestBody, options);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('submits Payment with orderId and method_id if method is paypalcommerce', async () => {
            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        method_id: 'paypalcommerce',
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

        it('submits Payment with orderId and method_id if method is alternative', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getPaypalCommerce(),
                id: 'p24',
                gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
            });

            jest.spyOn(paypalCommerceFundingKeyResolver, 'resolve').mockReturnValue('P24');

            const alternativeOptions = {
                gatewayId: PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
                methodId: 'p24',
            };

            options = { ...options, ...alternativeOptions };
            orderRequestBody = { payment: alternativeOptions };

            const expected = {
                ...orderRequestBody.payment,
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        method_id: 'p24',
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

        it('throws error without payment data', async () => {
            orderRequestBody.payment = undefined;

            await paypalCommercePaymentStrategy.initialize(options);

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentArgumentInvalidError(['payment']));
            }
        });

        it('throws error without orderId', async () => {
            orderID = '';

            try {
                await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
            } catch (error) {
                expect(error).toEqual(new PaymentMethodInvalidError());
            }
        });
    });
});
