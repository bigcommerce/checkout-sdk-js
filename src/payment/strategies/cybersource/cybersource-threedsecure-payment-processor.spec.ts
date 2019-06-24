import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs/index';

import { getCartState } from '../../../cart/carts.mock';
import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { RequestError, StandardError } from '../../../common/error/errors';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import NotInitializedError from '../../../common/error/errors/not-initialized-error';
import { getResponse } from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestSender,
} from '../../../order';
import OrderFinalizationNotRequiredError from '../../../order/errors/order-finalization-not-required-error';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import { getCybersource, getPaymentMethodsState } from '../../payment-methods.mock';
import { getCreditCardInstrument, getErrorPaymentResponseBody } from '../../payments.mock';

import {
    CardinalEventType,
    CardinalScriptLoader,
    CardinalSDK,
    CardinalValidatedAction,
    CardinalValidatedData
} from './index';

import {
    getCardinalBinProcessResponse,
    getCardinalSDK,
    getCardinalValidatedData,
    getCybersourceOrderRequestBody,
    getCybersourcePaymentRequestBody
} from './cardinal.mock';

describe('CyberSourceThreeDSecurePaymentProcessor', () => {
    /*let processor: CyberSourceThreeDSecurePaymentProcessor;
    let cybersourceScriptLoader: CardinalScriptLoader;
    let store: CheckoutStore;
    let paymentMethodMock: PaymentMethod;
    let cardinal: CardinalSDK;

    let orderActionCreator: OrderActionCreator;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let paymentActionCreator: PaymentActionCreator;
    let orderRequestSender: OrderRequestSender;

    let requestError: RequestError;
    let setupCall: () => {};
    let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        orderRequestSender = new OrderRequestSender(createRequestSender());

        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );

        cybersourceScriptLoader = new CardinalScriptLoader(createScriptLoader());

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        processor = new CyberSourceThreeDSecurePaymentProcessor(
            store,
            orderActionCreator,
            paymentActionCreator,
            cybersourceScriptLoader
        );

        paymentMethodMock = getCybersource();
        cardinal = getCardinalSDK();

        jest.spyOn(cybersourceScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(cardinal));
    });

    describe('#initialize', () => {
        it('initializes successfully', async () => {
            await processor.initialize(paymentMethodMock);

            expect(cybersourceScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        beforeEach(() => {
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

            jest.spyOn(orderActionCreator, 'submitOrder')
                .mockReturnValue(submitOrderAction);

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    setupCall = callback;
                } else {
                    validatedCall = callback;
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                setupCall();
            });
        });

        it('throws an error when execution options are undefined', async () => {
            const paymentMethod = paymentMethodMock;
            paymentMethod.clientToken = undefined;

            await processor.initialize(paymentMethod);

            expect(() => processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument()))
                .toThrow(MissingDataError);
        });

        it('completes the setup process successfully', async () => {
            let call: () => {};

            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(submitPaymentAction);

            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(true)));

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call();
            });

            await processor.initialize(paymentMethodMock);

            const promise = await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

            expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.SetupCompleted, expect.any(Function));
            expect(promise).toBe(store.getState());
        });

        it('completes the setup process incorrectly', async () => {
            let call: (data: CardinalValidatedData, jwt: string) => {};

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.Validated) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call(getCardinalValidatedData(CardinalValidatedAction.Error, false, 1020), '');
            });

            await processor.initialize(paymentMethodMock);

            try {
                await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('purchase finalizes correctly when 3DS is disabled', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(submitPaymentAction);

            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(true)));

            await processor.initialize(paymentMethodMock);
            processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

            expect(cardinal.continue).toHaveBeenCalledTimes(0);
        });

        it('purchase finalizes incorrectly when it is not posible to realize the payment', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, new StandardError('Custom Error'))));

            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(true)));

            await processor.initialize(paymentMethodMock);

            try {
                await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(error.message).toBe('Custom Error');
            }
        });

        it('bin process returns false', async () => {
            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(false)));

            await processor.initialize(paymentMethodMock);

            try {
                await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        describe('purchase when 3DS is enabled', () => {
            beforeEach(() => {
                requestError = new RequestError(getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [
                        { code: 'enrolled_card' },
                    ],
                    three_ds_result: {
                        acs_url: 'https://acs/url',
                        callback_url: '',
                        payer_auth_request: '',
                        merchant_data: 'merchant_data',
                    },
                    status: 'error',
                }));

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProcessResponse(true)));
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
            });

            it('purchase finalizes correctly', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(submitPaymentAction);

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.Success, true), 'token');
                });

                await processor.initialize(paymentMethodMock);
                const promise = await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

                expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
                expect(promise).toBe(store.getState());
            });

            it('3DS authorization returns a no action code and completes the purchase correctly', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(submitPaymentAction);

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.NoAction, false, 0), 'token');
                });

                await processor.initialize(paymentMethodMock);
                const promise = await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

                expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
                expect(promise).toBe(store.getState());
            });

            it('3DS authorization returns a no action code and does not complete the purchase', async () => {
                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.NoAction, false, 3002), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                }
            });

            it('3DS authorization returns an error code and does not complete the purchase', async () => {
                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.Error, false, 3004), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(cardinal.off).toBeCalledWith(CardinalEventType.SetupCompleted);
                    expect(cardinal.off).toBeCalledWith(CardinalEventType.Validated);
                    expect(error).toBeInstanceOf(StandardError);
                }
            });

            it('3DS authorization returns a failure code and does not complete the purchase', async () => {
                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.Failure, false, 3004), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                    expect(error.message).toBe('User failed authentication or an error was encountered while processing the transaction');
                }
            });
        });

        it('throws an exception when cardinal sdk is not initialized', async () => {
            try {
                await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes strategy', async () => {
            expect(await processor.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await processor.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });*/
});
