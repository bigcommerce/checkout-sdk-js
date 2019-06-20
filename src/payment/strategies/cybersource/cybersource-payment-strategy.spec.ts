import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import {
    createCheckoutStore,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from '../../../checkout';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender
} from '../../../remote-checkout';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentMethodActionType } from '../../payment-method-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';

import {getCheckoutStoreState, getCheckoutStoreStateWithOrder} from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { getCybersource } from '../../payment-methods.mock';

import CardinalClient from './cardinal-client';
import CardinalScriptLoader from './cardinal-script-loader';
import CyberSourcePaymentStrategy from './cybersource-payment-strategy';
import NotInitializedError from "../../../common/error/errors/not-initialized-error";
import {PaymentActionType, SubmitPaymentAction} from "../../payment-actions";
import {getResponse} from "../../../common/http-request/responses.mock";
import {getErrorPaymentResponseBody} from "../../payments.mock";
import createErrorAction from "@bigcommerce/data-store/lib/create-error-action";
import RequestError from "../../../common/error/errors/request-error";
import StandardError from "../../../common/error/errors/standard-error";
import OrderFinalizationNotRequiredError from "../../../order/errors/order-finalization-not-required-error";
import {getEUBillingAddress} from "../klarna/klarna.mock";

describe('CyberSourcePaymentStrategy', () => {
    let initializePaymentAction: Observable<Action>;
    let loadPaymentMethodAction: Observable<Action>;
    let cardinalClient: CardinalClient;
    let payload: OrderRequestBody;
    let orderActionCreator: OrderActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: CardinalScriptLoader;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let store: CheckoutStore;
    let strategy: CyberSourcePaymentStrategy;
    let paymentMethodMock: PaymentMethod;
    let requestError: RequestError;

    beforeEach(() => {
        paymentMethodMock = { ...getCybersource(), clientToken: 'foo' };
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        scriptLoader = new CardinalScriptLoader(createScriptLoader());
        cardinalClient = new CardinalClient(scriptLoader);

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator
        );

        strategy = new CyberSourcePaymentStrategy(
            store,
            paymentMethodActionCreator,
            orderActionCreator,
            paymentActionCreator,
            cardinalClient
        );

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
            },
        });

        loadPaymentMethodAction = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, { methodId: paymentMethodMock.id }));
        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(loadPaymentMethodAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(cardinalClient, 'initialize').mockReturnValue(Promise.resolve());
    });

    describe('#initialize', () => {
        beforeEach(async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });
        });

        it('initializes strategy successfully', () => {
            expect(cardinalClient.initialize).toHaveBeenCalledWith(true);
        });

        it('throws data missing error when initializing', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            try {
                await strategy.initialize({ methodId: paymentMethodMock.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute', () => {
        it('throws error to inform that payment data is missing', async () => {
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws data missing error when executing', async () => {
            payload.payment = undefined;

            await strategy.initialize({ methodId: paymentMethodMock.id });
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('completes the purchase successfully when 3DS is disabled', async () => {
            const paymentMethod = paymentMethodMock;
            paymentMethod.config.is3dsEnabled = false;

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethod);

            strategy = new CyberSourcePaymentStrategy(
                store,
                paymentMethodActionCreator,
                orderActionCreator,
                paymentActionCreator,
                cardinalClient
            );

            await strategy.initialize({ methodId: paymentMethod.id });

            await strategy.execute(payload);

            const { payment, ...order } = payload;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, undefined);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(payment);
        });

        describe('when 3DS is enabled', () => {
            beforeEach(async () => {
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

                jest.spyOn(cardinalClient, 'configure').mockReturnValue(Promise.resolve());
                jest.spyOn(cardinalClient, 'runBindProcess').mockReturnValue(Promise.resolve());

                await strategy.initialize({ methodId: paymentMethodMock.id });
            });

            it('completes the purchase correctly if card is not enrolled', async () => {
                jest.spyOn(cardinalClient, 'getThreeDSecureData');

                await strategy.execute(payload);

                expect(cardinalClient.getThreeDSecureData).not.toHaveBeenCalled();
            });

            it('completes the purchase correctly if card is enrolled', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(cardinalClient, 'getThreeDSecureData').mockReturnValue(Promise.resolve('token'));

                await strategy.execute(payload);

                expect(cardinalClient.getThreeDSecureData).toHaveBeenCalled();
            });

            it('does not complete the purchase if there was an error', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, new StandardError('Custom Error'))));
                jest.spyOn(cardinalClient, 'reset').mockReturnValue(Promise.resolve());

                try {
                    await strategy.execute(payload);
                } catch (error) {
                    expect(error).toBeInstanceOf(StandardError);
                    expect(error.message).toBe('Custom Error');
                }
            });

            it('throws an error if client token is undefined', async () => {
                const paymentMethod = paymentMethodMock;
                paymentMethod.clientToken = undefined;

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethod);

                strategy = new CyberSourcePaymentStrategy(
                    store,
                    paymentMethodActionCreator,
                    orderActionCreator,
                    paymentActionCreator,
                    cardinalClient
                );

                await strategy.initialize({ methodId: paymentMethod.id });

                try {
                    await strategy.execute(payload);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('throws an error if order data is undefined', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(cardinalClient, 'reset').mockReturnValue(Promise.resolve());

                store = createCheckoutStore(getCheckoutStoreState());

                strategy = new CyberSourcePaymentStrategy(
                    store,
                    paymentMethodActionCreator,
                    orderActionCreator,
                    paymentActionCreator,
                    cardinalClient
                );

                await strategy.initialize({ methodId: paymentMethodMock.id });

                try {
                    await strategy.execute(payload);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('throws an error if billing data is undefined', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(cardinalClient, 'reset').mockReturnValue(Promise.resolve());

                store = createCheckoutStore({
                    ...getCheckoutStoreState(),
                    billingAddress: undefined,
                });

                strategy = new CyberSourcePaymentStrategy(
                    store,
                    paymentMethodActionCreator,
                    orderActionCreator,
                    paymentActionCreator,
                    cardinalClient
                );

                await strategy.initialize({ methodId: paymentMethodMock.id });

                try {
                    await strategy.execute(payload);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });

            it('throws an error if checkout data is undefined', async () => {
                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValueOnce(of(createErrorAction(PaymentActionType.SubmitPaymentFailed, requestError)));
                jest.spyOn(cardinalClient, 'reset').mockReturnValue(Promise.resolve());

                store = createCheckoutStore({
                    ...getCheckoutStoreState(),
                    checkout: undefined,
                });

                strategy = new CyberSourcePaymentStrategy(
                    store,
                    paymentMethodActionCreator,
                    orderActionCreator,
                    paymentActionCreator,
                    cardinalClient
                );

                await strategy.initialize({ methodId: paymentMethodMock.id });

                try {
                    await strategy.execute(payload);
                } catch (error) {
                    expect(error).toBeInstanceOf(MissingDataError);
                }
            });
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
