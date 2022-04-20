import { merge } from 'lodash';
import { of } from 'rxjs';

import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { getCybersource } from '../../payment-methods.mock';
import { ACKNOWLEDGE } from '../../payment-status-types';
import { CardinalThreeDSecureFlow } from '../cardinal';
import { CreditCardPaymentStrategy } from '../credit-card';

import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let hostedFormFactory: HostedFormFactory;
    let orderActionCreator: Pick<OrderActionCreator, 'submitOrder'>;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;
    let paymentMethod: PaymentMethod;
    let state: InternalCheckoutSelectors;
    let store: CheckoutStore;
    let strategy: PaypalProPaymentStrategy;
    let threeDSecureFlow: Pick<CardinalThreeDSecureFlow, 'prepare' | 'start'>;

    beforeEach(() => {
        paymentMethod = {
            ...getCybersource(),
            clientToken: 'foo',
        };

        store = createCheckoutStore();

        orderActionCreator = {
            submitOrder: jest.fn(() => of()),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(() => of()),
        };

        hostedFormFactory = {} as HostedFormFactory;

        threeDSecureFlow = {
            prepare: jest.fn(() => Promise.resolve()),
            start: jest.fn(() => Promise.resolve()),
        };

        state = store.getState();

        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(state);

        jest.spyOn(store, 'getState')
            .mockReturnValue(state);

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
            .mockReturnValue(paymentMethod);

        strategy = new PaypalProPaymentStrategy(
            store,
            orderActionCreator as OrderActionCreator,
            paymentActionCreator as PaymentActionCreator,
            hostedFormFactory,
            threeDSecureFlow as CardinalThreeDSecureFlow
        );
    });

    it('is special type of credit card strategy', () => {
        expect(strategy)
            .toBeInstanceOf(CreditCardPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws error if payment method is not defined', async () => {
            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
                .mockImplementation(() => { throw new Error(); });

            try {
                await strategy.initialize({ methodId: paymentMethod.id });
            } catch (error) {
                expect(error)
                    .toBeInstanceOf(Error);
            }
        });

        it('does not prepare 3DS flow if not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(threeDSecureFlow.prepare)
                .not.toHaveBeenCalled();
        });

        it('prepares 3DS flow if enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(threeDSecureFlow.prepare)
                .toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;

        beforeEach(() => {
            payload = merge({}, getOrderRequestBody(), {
                payment: {
                    methodId: paymentMethod.id,
                    gatewayId: paymentMethod.gateway,
                },
            });
        });

        it('throws error if payment method is not defined', async () => {
            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
                .mockImplementation(() => { throw new Error(); });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error)
                    .toBeInstanceOf(Error);
            }
        });

        it('does not start 3DS flow if not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.execute(payload);

            expect(threeDSecureFlow.start)
                .not.toHaveBeenCalled();
        });

        it('starts 3DS flow if enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.execute(payload);

            expect(threeDSecureFlow.start)
                .toHaveBeenCalled();
        });

        describe('if payment is acknowledged', () => {

            beforeEach(() => {
                jest.spyOn(state.payment, 'getPaymentStatus')
                    .mockReturnValue(ACKNOWLEDGE);
            });

            it('submits order with payment method name', async () => {
                const submitOrderAction = of();

                jest.spyOn(orderActionCreator, 'submitOrder')
                    .mockReturnValue(submitOrderAction);

                await strategy.execute(payload);

                expect(orderActionCreator.submitOrder).toHaveBeenCalledWith({
                    ...payload,
                    payment: { methodId: payload.payment && payload.payment.methodId },
                }, undefined);

                expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            });

            it('does not submit payment separately', async () => {
                const submitPaymentAction = of();

                jest.spyOn(paymentActionCreator, 'submitPayment')
                    .mockReturnValue(submitPaymentAction);

                await strategy.execute(payload);

                expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            });
        });
    });
});
