import { Action, createAction } from '@bigcommerce/data-store';
import { omit } from 'lodash';
import { Observable, of } from 'rxjs';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import { getBraintreeVenmo } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BraintreeTokenizePayload, BraintreeVenmoCheckout } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeVenmoPaymentStrategy from './braintree-venmo-payment-strategy';

describe('BraintreeVenmoPaymentStrategy', () => {
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let braintreePaymentProcessorMock: BraintreePaymentProcessor;
    let braintreeVenmoPaymentStrategy: PaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let loadPaymentMethodAction: Observable<Action>;
    let store: CheckoutStore;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;
    let tokenizeMock: BraintreeVenmoCheckout['tokenize'];
    let options: PaymentInitializeOptions;

    beforeEach(() => {
        const braintreeTokenizePayload: Partial<BraintreeTokenizePayload> = {
            nonce: 'nonce-key',
            details: {
                email: 'braintreeTokenize@email.com',
            },
        };

        tokenizeMock = jest.fn((callback) => callback(undefined, braintreeTokenizePayload));
        braintreePaymentProcessorMock = {} as BraintreePaymentProcessor;
        braintreePaymentProcessorMock.initialize = jest.fn();
        braintreePaymentProcessorMock.getVenmoCheckout = jest.fn(
            (): Promise<Partial<BraintreeVenmoCheckout>> =>
                Promise.resolve({
                    tokenize: tokenizeMock,
                    isBrowserSupported: () => true,
                }),
        );
        braintreePaymentProcessorMock.getSessionId = jest.fn(() => 'my_session_id');
        braintreePaymentProcessorMock.deinitialize = jest.fn();

        paymentMethodMock = { ...getBraintreeVenmo(), clientToken: 'myToken' };
        options = { methodId: paymentMethodMock.id };
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        loadPaymentMethodAction = of(
            createAction(
                PaymentMethodActionType.LoadPaymentMethodSucceeded,
                paymentMethodMock,
                options,
            ),
        );

        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);

        paymentMethodActionCreator = {} as PaymentMethodActionCreator;
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);

        braintreeVenmoPaymentStrategy = new BraintreeVenmoPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessorMock,
        );
    });

    it('creates an instance of the braintree venmo payment strategy', () => {
        expect(braintreeVenmoPaymentStrategy).toBeInstanceOf(BraintreeVenmoPaymentStrategy);
    });

    describe('#initialize()', () => {
        it('initializes the braintree venmo payment processor with the client token', async () => {
            const options = { methodId: paymentMethodMock.id };

            await braintreeVenmoPaymentStrategy.initialize(options);

            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentMethodMock.initializationData,
            );
            expect(braintreePaymentProcessorMock.getVenmoCheckout).toHaveBeenCalled();
        });

        it('throws error if clientToken does not exist', async () => {
            paymentMethodMock.clientToken = undefined;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            try {
                await braintreeVenmoPaymentStrategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throw error if getVenmoCheckout fails', async () => {
            jest.spyOn(braintreePaymentProcessorMock, 'getVenmoCheckout').mockReturnValue(
                Promise.reject({
                    name: 'notBraintreeError',
                    message: 'my_message',
                }),
            );

            try {
                await braintreeVenmoPaymentStrategy.initialize(options);
            } catch (error) {
                expect(error.message).toBe('my_message');
            }
        });
    });

    describe('#execute()', () => {
        let orderRequestBody: OrderRequestBody;

        beforeEach(() => {
            orderRequestBody = getOrderRequestBody();
        });

        it('calls submit order with the order request information', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                omit(orderRequestBody, 'payment'),
                expect.any(Object),
            );
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('refresh the state if paymentMethod has nonce value', async () => {
            paymentMethodMock.nonce = 'some-nonce';
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledTimes(1);
            expect(braintreePaymentProcessorMock.initialize).toHaveBeenCalledTimes(1);
            expect(orderActionCreator.submitOrder).toHaveBeenCalledTimes(1);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledTimes(1);
        });

        it('pass the options to submitOrder', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(
                expect.any(Object),
                options,
            );
        });

        it('does not call braintreeVenmoCheckout.tokenize if a nonce is present', async () => {
            paymentMethodMock.nonce = 'some-nonce';

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodMock,
            );

            const expected = expect.objectContaining({
                paymentData: {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        paypal_account: {
                            token: 'some-nonce',
                            email: null,
                        },
                    },
                },
            });

            await braintreeVenmoPaymentStrategy.initialize({ methodId: paymentMethodMock.id });
            await braintreeVenmoPaymentStrategy.execute(orderRequestBody, options);

            expect(tokenizeMock).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
        });

        it('throw error after user closed modal window', async () => {
            const tokenizeMockError = jest.fn((callback) =>
                callback(
                    {
                        name: 'BraintreeError',
                        message: 'my_message',
                        code: 'PAYPAL_POPUP_CLOSED',
                    },
                    undefined,
                ),
            );

            braintreePaymentProcessorMock.getVenmoCheckout = jest.fn(
                (): Promise<Partial<BraintreeVenmoCheckout>> =>
                    Promise.resolve({
                        tokenize: tokenizeMockError,
                        isBrowserSupported: () => true,
                    }),
            );

            await braintreeVenmoPaymentStrategy.initialize(options);

            await expect(
                braintreeVenmoPaymentStrategy.execute(orderRequestBody, options),
            ).rejects.toEqual(expect.any(PaymentMethodCancelledError));
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });

        it('throw error after tokenize error', async () => {
            const tokenizeMockError = jest.fn((callback) =>
                callback(
                    {
                        name: 'BraintreeError',
                        message: 'my_message',
                    },
                    undefined,
                ),
            );

            braintreePaymentProcessorMock.getVenmoCheckout = jest.fn(
                (): Promise<Partial<BraintreeVenmoCheckout>> =>
                    Promise.resolve({
                        tokenize: tokenizeMockError,
                        isBrowserSupported: () => true,
                    }),
            );

            await braintreeVenmoPaymentStrategy.initialize(options);

            await expect(
                braintreeVenmoPaymentStrategy.execute(orderRequestBody, options),
            ).rejects.toEqual(expect.any(PaymentMethodFailedError));
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });

        it('throw error when no payment options exist', async () => {
            await braintreeVenmoPaymentStrategy.initialize(options);

            try {
                braintreeVenmoPaymentStrategy.execute({}, options);
            } catch (error) {
                expect(error).toEqual(expect.any(PaymentArgumentInvalidError));
            }

            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('calls deinitialize in the braintree payment processor', async () => {
            braintreePaymentProcessorMock.deinitialize = jest.fn(() => Promise.resolve());

            await braintreeVenmoPaymentStrategy.deinitialize();

            expect(braintreePaymentProcessorMock.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await braintreeVenmoPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
