import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

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
    StandardError
} from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
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
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getPaymentMethodsState, getStripeV3 } from '../../payment-methods.mock';

import { StripeResponse } from './stripev3';
import StripeV3PaymentStrategy from './stripev3-payment-strategy';
import StripeV3ScriptLoader from './stripev3-script-loader';
import {
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
    let orderActionCreator: OrderActionCreator;
    let stripeScriptLoader: StripeV3ScriptLoader;

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

        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
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
            stripeScriptLoader
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
        const stripeV3JsMock = getStripeV3JsMock();

        beforeEach(() => {
            stripeV3Options = getStripeV3InitializeOptionsMock();
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
            jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(Promise.resolve());
            jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(Promise.resolve());
        });

        it('creates the order and submit payment', async () => {
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(getStripeV3HandleCardResponse())
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = await strategy.execute(getStripeV3OrderRequestBodyMock());

            expect(store.getState().paymentMethods.getPaymentMethod).toHaveBeenCalled();
            expect(stripeV3JsMock.handleCardPayment).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
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

        it('throws an error when store dispatch does not load paymentMethod', async () => {
            const error = {message: 'error'};
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.reject(error));

            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toBe(error);
        });

        it('throws an error when getPaymentMethod will not retrieve clientToken', async () => {
            const stripeV3 = {
                id: 'stripev3',
                logoUrl: '',
                method: 'stripev3',
                supportedCards: [],
                config: {
                    displayName: 'Stripe',
                    merchantId: '',
                    testMode: true,
                },
                type: 'PAYMENT_TYPE_API',
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(stripeV3);

            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toBeInstanceOf(StandardError);
        });

        it('throws an error when handleCardPayment retrieve an error', async () => {
            const stripeV3HandleCardResponseError: StripeResponse = {
                error: {
                    type: 'error',
                    code: 'ABC',
                    message: 'Error from stripe js',
                },
                paymentIntent: {},
            };
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(stripeV3HandleCardResponseError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toBeInstanceOf(StandardError);
        });

        it('throws an error when handleCardPayment will not retrieve a paymentIntent id', async () => {
            const stripeV3HandleCardResponseError: StripeResponse = {
                paymentIntent: {},
            };
            stripeV3JsMock.handleCardPayment = jest.fn(
                () => Promise.resolve(stripeV3HandleCardResponseError)
            );

            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(stripeV3Options);
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toBeInstanceOf(StandardError);
        });

        it('throws an error when stripe js is not loaded', async () => {
            const response = strategy.execute(getStripeV3OrderRequestBodyMock());

            return expect(response).rejects.toBeInstanceOf(StandardError);
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            const promise = strategy.finalize();

            return expect(promise).rejects.toBeInstanceOf(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes stripe payment strategy', async () => {
            const stripeV3JsMock = getStripeV3JsMock();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getStripeV3());
            jest.spyOn(stripeScriptLoader, 'load').mockReturnValue(Promise.resolve(stripeV3JsMock));

            await strategy.initialize(getStripeV3InitializeOptionsMock());
            const promise = strategy.deinitialize();

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
