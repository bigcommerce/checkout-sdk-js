import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder, getCheckoutWithPayments } from '../../../checkout/checkouts.mock';
import { MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestBody, OrderRequestSender, SubmitOrderAction } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getPaypal } from '../../payment-methods.mock';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';
import { CardinalClient, CardinalScriptLoader, CardinalThreeDSecureFlow } from '../cardinal';

import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let cardinalClient: CardinalClient;
    let cardinalThreeDSecureFlow: CardinalThreeDSecureFlow;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let scriptLoader: CardinalScriptLoader;
    let store: CheckoutStore;
    let strategy: PaypalProPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        paymentMethodMock = {...getPaypal(), clientToken: 'foo'};
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        scriptLoader = new CardinalScriptLoader(createScriptLoader());
        cardinalClient = new CardinalClient(scriptLoader);

        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(
                createSpamProtection(createScriptLoader())
            )
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer()
        );

        cardinalThreeDSecureFlow = new CardinalThreeDSecureFlow(
            store,
            paymentActionCreator,
            paymentMethodActionCreator,
            cardinalClient
        );

        strategy = new PaypalProPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            cardinalThreeDSecureFlow
        );

        payload = merge({}, getOrderRequestBody(), {
            payment: {
                methodId: paymentMethodMock.id,
                gatewayId: paymentMethodMock.gateway,
            },
        });

        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(paymentMethodMock);

        jest.spyOn(cardinalThreeDSecureFlow, 'prepare').mockReturnValue(Promise.resolve());

        jest.spyOn(cardinalThreeDSecureFlow, 'start').mockReturnValue(store.getState());
    });

    describe('#initialize', () => {
        it('initializes strategy successfully when 3DS is enabled', async () => {
            await strategy.initialize({methodId: paymentMethodMock.id});

            expect(cardinalThreeDSecureFlow.prepare).toHaveBeenCalled();
        });

        it('initializes strategy successfully when 3DS is disabled', async () => {
            paymentMethodMock.config.is3dsEnabled = false;
            await strategy.initialize({methodId: paymentMethodMock.id});

            expect(cardinalThreeDSecureFlow.prepare).not.toHaveBeenCalled();
        });

        it('throws data missing error when payment method is not defined', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);

            try {
                await strategy.initialize({methodId: paymentMethodMock.id});
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });
    });

    describe('#execute', () => {
        it('throws data missing error when payment is undefined', async () => {
            payload.payment = undefined;

            await strategy.initialize({ methodId: paymentMethodMock.id });
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error to inform that payment data is missing', async () => {
            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('completes the purchase successfully when 3DS is disabled', async () => {
            paymentMethodMock.config.is3dsEnabled = false;
            await strategy.initialize({ methodId: paymentMethodMock.id });

            const result = await strategy.execute(payload);

            expect(cardinalThreeDSecureFlow.start).not.toHaveBeenCalled();
            expect(result).toBe(store.getState());
        });

        it('completes the purchase successfully when 3DS is enabled', async () => {
            await strategy.initialize({ methodId: paymentMethodMock.id });

            const result = await strategy.execute(payload);

            expect(cardinalThreeDSecureFlow.start).toHaveBeenCalled();
            expect(result).toBe(store.getState());
        });

        describe('if payment is acknowledged', () => {
            beforeEach(() => {
                const state = getCheckoutStoreState();
                store = createCheckoutStore({
                    ...state,
                    checkout: {
                        ...state.checkout,
                        data: getCheckoutWithPayments(),
                    },
                });

                strategy = new PaypalProPaymentStrategy(
                    store,
                    orderActionCreator,
                    paymentActionCreator,
                    cardinalThreeDSecureFlow
                );

                jest.spyOn(store, 'dispatch');
            });

            it('submits order with payment method name', async () => {
                const payload = getOrderRequestBody();

                await strategy.execute(payload);

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
                    ...payload,
                    payment: { methodId: payload.payment && payload.payment.methodId },
                }, undefined);
                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('does not submit payment separately', async () => {
                const payload = getOrderRequestBody();

                await strategy.execute(payload);

                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
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
