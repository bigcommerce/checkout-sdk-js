import { merge } from 'lodash';
import { of } from 'rxjs';

import { CheckoutStore, createCheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { getCybersource } from '../../payment-methods.mock';
import { CardinalThreeDSecureFlowV2 } from '../cardinal';
import { CreditCardPaymentStrategy } from '../credit-card';

import BNZPaymentStrategy from './bnz-payment-strategy';

describe('BankOfNewZealandPaymentStrategy', () => {
    let hostedFormFactory: HostedFormFactory;
    let orderActionCreator: Pick<OrderActionCreator, 'submitOrder'>;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;
    let paymentMethod: PaymentMethod;
    let state: InternalCheckoutSelectors;
    let store: CheckoutStore;
    let strategy: BNZPaymentStrategy;
    let threeDSecureFlow: Pick<CardinalThreeDSecureFlowV2, 'prepare' | 'start'>;

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

        jest.spyOn(store, 'dispatch').mockResolvedValue(state);

        jest.spyOn(store, 'getState').mockReturnValue(state);

        jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);

        strategy = new BNZPaymentStrategy(
            store,
            orderActionCreator as OrderActionCreator,
            paymentActionCreator as PaymentActionCreator,
            hostedFormFactory,
            threeDSecureFlow as CardinalThreeDSecureFlowV2,
        );
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws error when payment method is not defined', async () => {
            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockImplementation(() => {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            });

            try {
                await strategy.initialize({ methodId: paymentMethod.id });
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('does not prepare 3DS flow when not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(threeDSecureFlow.prepare).not.toHaveBeenCalled();
        });

        it('prepares 3DS flow when enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(threeDSecureFlow.prepare).toHaveBeenCalled();
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

        it('throws error when payment method is not defined', async () => {
            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow').mockImplementation(() => {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('does not start 3DS flow when not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.initialize({ methodId: paymentMethod.id });

            await strategy.execute(payload);

            expect(threeDSecureFlow.prepare).not.toHaveBeenCalled();

            expect(threeDSecureFlow.start).not.toHaveBeenCalled();
        });

        it('starts 3DS flow when enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize({ methodId: paymentMethod.id });

            await strategy.execute(payload);

            expect(threeDSecureFlow.prepare).toHaveBeenCalled();

            expect(threeDSecureFlow.start).toHaveBeenCalled();
        });
    });
});
