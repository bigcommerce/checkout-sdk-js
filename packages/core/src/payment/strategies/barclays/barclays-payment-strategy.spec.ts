import { merge } from 'lodash';
import { of } from 'rxjs';

import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { getBarclays } from '../../payment-methods.mock';
import { CardinalClient, CardinalThreeDSecureFlowV2 } from '../cardinal';
import { CreditCardPaymentStrategy } from '../credit-card';

import BarclaysPaymentStrategy from './barclays-payment-strategy';

describe('BarclaysPaymentStrategy', () => {
    let hostedFormFactory: HostedFormFactory;
    let orderActionCreator: Pick<OrderActionCreator, 'submitOrder'>;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;
    let paymentMethod: PaymentMethod;
    let state: InternalCheckoutSelectors;
    let store: CheckoutStore;
    let strategy: BarclaysPaymentStrategy;
    let cardinalClient: CardinalClient;
    let threeDSecureFlow: Pick<CardinalThreeDSecureFlowV2, 'prepare' | 'start'>;

    beforeEach(() => {
        paymentMethod = getBarclays();

        store = createCheckoutStore();

        orderActionCreator = {
            submitOrder: jest.fn(() => of()),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(() => of()),
        };

        hostedFormFactory = {} as HostedFormFactory;

        cardinalClient = {} as CardinalClient;

        threeDSecureFlow = new CardinalThreeDSecureFlowV2(
            store,
            paymentActionCreator as PaymentActionCreator,
            cardinalClient
        );

        jest.spyOn(threeDSecureFlow, 'prepare')
            .mockReturnValue(Promise.resolve());
        jest.spyOn(threeDSecureFlow, 'start');

        state = store.getState();

        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(state);

        jest.spyOn(store, 'getState')
            .mockReturnValue(state);

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
            .mockReturnValue(paymentMethod);

        strategy = new BarclaysPaymentStrategy(
            store,
            orderActionCreator as OrderActionCreator,
            paymentActionCreator as PaymentActionCreator,
            hostedFormFactory,
            threeDSecureFlow as CardinalThreeDSecureFlowV2
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

            await expect(strategy.initialize({ methodId: paymentMethod.id })).rejects.toThrow(Error);
        });

        describe('#threeDSecureFlow', () => {
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

            await expect(strategy.execute(payload)).rejects.toThrow(Error);
        });

        describe('#threeDSecureFlow', () => {
            let parentExecute: jest.SpyInstance<CreditCardPaymentStrategy['execute']>;

            beforeEach(() => {
                parentExecute = jest.spyOn(CreditCardPaymentStrategy.prototype, 'execute');
            });

            it('does not start 3DS flow if not enabled', async () => {
                paymentMethod.config.is3dsEnabled = false;

                await strategy.execute(payload);

                expect(threeDSecureFlow.start)
                    .not.toHaveBeenCalled();
                expect(parentExecute)
                    .toHaveBeenCalled();
            });

            it('starts 3DS flow if enabled', async () => {
                paymentMethod.config.is3dsEnabled = true;

                await strategy.execute(payload);

                expect(threeDSecureFlow.start)
                    .toHaveBeenCalled();
                expect(parentExecute)
                    .toHaveBeenCalled();
            });
        });
    });
});
