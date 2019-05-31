import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import {createAction, createErrorAction, Action} from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import {of, Observable} from 'rxjs/index';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {RequestError, StandardError} from '../../../common/error/errors';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import NotInitializedError from '../../../common/error/errors/not-initialized-error';
import {getResponse} from '../../../common/http-request/responses.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import {OrderActionCreator, OrderActionType, OrderRequestSender} from '../../../order';
import OrderFinalizationNotRequiredError from '../../../order/errors/order-finalization-not-required-error';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import {PaymentActionType, SubmitPaymentAction} from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getCybersource, getPaymentMethodsState } from '../../payment-methods.mock';
import { getCreditCardInstrument, getErrorPaymentResponseBody } from '../../payments.mock';

import {CardinalValidatedAction, CardinalValidatedData, CyberSourceCardinal} from './cybersource';
import CyberSourceScriptLoader from './cybersource-script-loader';
import CyberSourceThreeDSecurePaymentProcessor from './cybersource-threedsecure-payment-processor';
import {
    getCardinalBinProccessResponse,
    getCardinalValidatedData,
    getCybersourceCardinal,
    getCybersourceOrderRequestBody,
    getCybersourcePaymentRequestBody
} from './cybersource.mock';
import { CardinalEventType } from './index';

describe('CyberSourceThreeDSecurePaymentProcessor', () => {
    let processor: CyberSourceThreeDSecurePaymentProcessor;
    let cybersourceScriptLoader: CyberSourceScriptLoader;
    let store: CheckoutStore;
    let paymentMethodMock: PaymentMethod;
    let cardinal: CyberSourceCardinal;

    let orderActionCreator: OrderActionCreator;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let paymentActionCreator: PaymentActionCreator;
    let orderRequestSender: OrderRequestSender;
    let requestError: RequestError;

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

        cybersourceScriptLoader = new CyberSourceScriptLoader(createScriptLoader());

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        processor = new CyberSourceThreeDSecurePaymentProcessor(
            store,
            orderActionCreator,
            paymentActionCreator,
            cybersourceScriptLoader
        );

        paymentMethodMock = getCybersource();
        cardinal = getCybersourceCardinal();

        jest.spyOn(cybersourceScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(cardinal));
    });

    describe('#initialize', () => {

        it('initializes successfully', async () => {
            let call: () => {};

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

            const promise = await processor.initialize(paymentMethodMock);

            expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.SetupCompleted, expect.any(Function));
            expect(promise).toBe(store.getState());
        });

        it('initializes does not configure cardinal if it was previously', async () => {
            let call: () => {};

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

            const promise = await processor.initialize(paymentMethodMock);
            processor.initialize(paymentMethodMock);

            expect(cardinal.on).toHaveBeenCalledTimes(2);
        });

        it('initializes incorrectly', async () => {
            let call: (data: CardinalValidatedData, jwt: string) => {};

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.Validated) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call(getCardinalValidatedData(CardinalValidatedAction.ERROR, false, 1020), '');
            });

            try {
                await processor.initialize(paymentMethodMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws when initialize options are undefined', () => {
            const paymentMethod = paymentMethodMock;
            paymentMethod.clientToken = undefined;

            expect(() => processor.initialize(paymentMethod))
                .toThrow(MissingDataError);
        });
    });

    describe('#execute', () => {
        beforeEach(() => {
            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        });

        it('purchase finalizes correctly when 3DS is disabled', async () => {
            jest.spyOn(orderActionCreator, 'submitOrder')
                .mockReturnValue(submitOrderAction);
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValue(submitPaymentAction);

            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

            let setupCall: () => {};
            let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

            await processor.initialize(paymentMethodMock);
            processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

            expect(cardinal.continue).toHaveBeenCalledTimes(0);
        });

        it('purchase finalizes incorrectly when it is not posible to realize the payment', async () => {
            jest.spyOn(orderActionCreator, 'submitOrder')
                .mockReturnValue(submitOrderAction);
            jest.spyOn(paymentActionCreator, 'submitPayment')
                .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, new StandardError('Custom Error'))));

            jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

            let call: () => {};

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    call = callback;
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call();
            });

            await processor.initialize(paymentMethodMock);

            try {
                await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(error.message).toBe('Custom Error');
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
            });

            it('purchase finalizes correctly', async () => {
                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(submitPaymentAction);

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

                let setupCall: () => {};
                let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.SUCCCESS, true), 'token');
                });

                await processor.initialize(paymentMethodMock);
                const promise = await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

                expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
                expect(promise).toBe(store.getState());
            });

            it('3DS authorization returns a no action code and completes the purchase correctly', async () => {
                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(submitPaymentAction);

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

                let setupCall: () => {};
                let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.NOACTION, false, 0), 'token');
                });

                await processor.initialize(paymentMethodMock);
                const promise = await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());

                expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.Validated, expect.any(Function));
                expect(promise).toBe(store.getState());
            });

            it('3DS authorization returns a no action code and does not complete the purchase', async () => {
                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

                let setupCall: () => {};
                let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.NOACTION, false, 3002), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                }
            });

            it('3DS authorization returns an error code and does not complete the purchase', async () => {
                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

                let setupCall: () => {};
                let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.ERROR, false, 3004), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                }
            });

            it('3DS authorization returns a failure code and does not complete the purchase', async () => {
                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));

                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(true)));

                let setupCall: () => {};
                let validatedCall: (data: CardinalValidatedData, jwt: string) => {};

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

                jest.spyOn(cardinal, 'continue').mockImplementation(() => {
                    validatedCall(getCardinalValidatedData(CardinalValidatedAction.FAILURE, false, 3004), '');
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                    expect(error.message).toBe('User failed authentication or an error was encountered while processing the transaction');
                }
            });

            it('bin process returns false', async () => {
                jest.spyOn(cardinal, 'trigger').mockReturnValue(Promise.resolve(getCardinalBinProccessResponse(false)));

                let call: () => {};

                cardinal.on = jest.fn((type, callback) => {
                    if (type.toString() === CardinalEventType.SetupCompleted) {
                        call = callback;
                    }
                });

                jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                    call();
                });

                await processor.initialize(paymentMethodMock);

                try {
                    await processor.execute(getCybersourcePaymentRequestBody(), getCybersourceOrderRequestBody(), getCreditCardInstrument());
                } catch (error) {
                    expect(error).toBeInstanceOf(NotInitializedError);
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
    });
});
