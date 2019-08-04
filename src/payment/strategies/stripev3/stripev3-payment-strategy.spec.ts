import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { getCartState } from '../../../cart/carts.mock';
import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutValidator
} from '../../../checkout';
import CheckoutStore from '../../../checkout/checkout-store';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    StandardError
} from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomer, getCustomerState } from '../../../customer/customers.mock';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import OrderActionCreator from '../../../order/order-action-creator';
import {
    createSpamProtection,
    SpamProtectionActionCreator
} from '../../../order/spam-protection';
import {
    createPaymentClient,
    PaymentInitializeOptions,
    PaymentMethodRequestSender,
    PaymentRequestSender
} from '../../../payment';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getPaymentMethodsState, getStripeV3 } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';

import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import {
    getStripeCardPaymentOptionsWithGuestUser, getStripeCardPaymentOptionsWithGuestUserWithoutAddress,
    getStripeCardPaymentOptionsWithSignedUser,
    getStripePaymentMethodOptionsWithGuestUser,
    getStripePaymentMethodOptionsWithGuestUserWithoutAddress,
    getStripePaymentMethodOptionsWithSignedUser,
    getStripeV3HandleCardResponse,
    getStripeV3InitializeOptionsMock,
    getStripeV3JsMock,
    getStripeV3OrderRequestBodyMock
} from './stripev3.mock';

describe('StripeV3PaymentStrategy', () => {
    let store: CheckoutStore;
    let strategy: StripeV3PaymentStrategy;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentRequestSender: PaymentRequestSender;
    let orderActionCreator: OrderActionCreator;
    let stripeScriptLoader: StripeV3ScriptLoader;
    let paymentRequestTransformer: PaymentRequestTransformer;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        const requestSender = createRequestSender();
        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const paymentClient = createPaymentClient(store);
        const scriptLoader = createScriptLoader();
        paymentRequestSender = new PaymentRequestSender(paymentClient);
        paymentRequestTransformer = new PaymentRequestTransformer();

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer);
        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(
                new CheckoutRequestSender(requestSender)
            ),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );
        stripeScriptLoader = new StripeV3ScriptLoader(scriptLoader);

        strategy = new StripeV3PaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            stripeScriptLoader,
            paymentRequestSender,
            paymentRequestTransformer
        );
    });

    describe('#initialize()', () => {
        const stripeV3JsMock = getStripeV3JsMock();
        let stripeV3Options: PaymentInitializeOptions;

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
        });

        it('loads stripe v3 script', async () => {
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const promise =  strategy.initialize(stripeV3Options);

            expect(stripeScriptLoader.load).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not load stripe V3 if initialization options are not provided', () => {
            stripeV3Options.stripev3 = undefined;

            expect(() => strategy.initialize(stripeV3Options))
                .toThrow(InvalidArgumentError);
        });

        it('does not load stripe V3 if paymentMethod is not provided', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            expect(() => strategy.initialize(stripeV3Options))
                .toThrow(MissingDataError);
        });
    });

    describe('#execute', () => {
        let stripeV3Options: PaymentInitializeOptions;
        let paymentMethodMock: PaymentMethod;
        const stripeV3JsMock = getStripeV3JsMock();

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve());
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentRequestTransformer, 'transform').mockReturnValue({
                state: 'state',
            });
        });

        it('creates the order and submit payment', async () => {
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('throws an error when payment is not set properly into payload', () => {
            const payload = {
                payment: undefined,
            };

            expect(() => strategy.execute(payload))
                .toThrow(PaymentArgumentInvalidError);
        });

        it('creates a payment when an instrument is being used', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                    paymentData: {
                        instrumentId: 'token',
                    },
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(payload);

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('throws an error when stripe card element has not been initialized', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const response = strategy.execute(payload);

            return expect(response).rejects.toThrow(NotInitializedError);
        });

        it('throws an error when stripe card element has not been initialized', async () => {
            const payload = {
                payment: {
                    methodId: 'stripev3',
                },
            };

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            const response = strategy.execute(payload);

            return expect(response).rejects.toThrow(NotInitializedError);
        });

        it('throws an error when trying to create stripe payment method', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve(stripeError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(response).rejects.toThrowError(stripeError.error.message);

            return expect(response).rejects.toThrow(StandardError);
        });

        it('throws an error when handle card payment to stripe', async () => {
            const stripeError = {
                error: {
                    message: 'stripe error',
                },
            };

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(stripeError)
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(response).rejects.toThrowError(stripeError.error.message);

            return expect(response).rejects.toThrow(StandardError);
        });

        it('throws an error when ClientToken is undefined', async () => {
            paymentMethodMock = {
                ...getStripeV3(),
                clientToken: undefined,
                initializationData: {
                    stripePublishableKey: 'key',
                },
            };
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(paymentMethodMock);
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toThrow(MissingDataError);
        });

        it('creates the order and submit payment with a signed user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithSignedUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'clientToken',
                {
                    ...getStripeCardPaymentOptionsWithSignedUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'clientToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a guest user and without shipping and billing address', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(undefined);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(undefined);

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUserWithoutAddress()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'clientToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUserWithoutAddress(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });

        it('creates the order and submit payment with a signed user but without email', async () => {
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});
            const customer = getCustomer();

            customer.email = '';
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            stripeV3JsMock.createPaymentMethod = jest.fn(
                () => Promise.resolve({
                    paymentMethod: {
                        id: 'paymentMethod',
                    },
                })
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);
            jest.spyOn(store.getState().customer, 'getCustomer').mockReturnValue(customer);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(getShippingAddress());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(getBillingAddress());

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.createPaymentMethod).toHaveBeenCalledWith(
                'card',
                cardElement,
                getStripePaymentMethodOptionsWithGuestUser()
            );
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalledWith(
                'clientToken',
                {
                    ...getStripeCardPaymentOptionsWithGuestUser(),
                    payment_method: 'paymentMethod',
                }
            );
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(response).toBe(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws an error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes stripe payment strategy', async () => {
            const stripeV3JsMock = getStripeV3JsMock();
            const elements = stripeV3JsMock.elements();
            const cardElement = elements.create('card', {});

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));
            jest.spyOn(stripeV3JsMock, 'elements').mockReturnValue(elements);
            jest.spyOn(stripeV3JsMock.elements(), 'create').mockReturnValue(cardElement);

            await strategy.initialize(getStripeV3InitializeOptionsMock());
            const promise = strategy.deinitialize();

            expect(cardElement.unmount).toHaveBeenCalled();

            return expect(promise).resolves.toBe(store.getState());
        });

        it('does not unmount when stripe card element is not available', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());

            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
