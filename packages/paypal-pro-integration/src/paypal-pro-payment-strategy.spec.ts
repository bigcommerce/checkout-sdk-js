import { merge } from 'lodash';
import { of } from 'rxjs';

import {
    CardinalClient,
    CardinalThreeDSecureFlow,
} from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentStatusTypes,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    getPaymentMethod,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import PaypalProPaymentStrategy from './paypal-pro-payment-strategy';

describe('PaypalProPaymentStrategy', () => {
    let strategy: PaypalProPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let cardinalThreeDSecureFlow: CardinalThreeDSecureFlow;
    let cardinalClient: Pick<
        CardinalClient,
        'configure' | 'getThreeDSecureData' | 'load' | 'runBinProcess'
    >;
    let paymentMethod: PaymentMethod;

    beforeEach(() => {
        paymentMethod = {
            ...getPaymentMethod(),
            clientToken: 'foo',
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        cardinalClient = {
            configure: jest.fn(() => Promise.resolve()),
            getThreeDSecureData: jest.fn(() => Promise.resolve()),
            load: jest.fn(() => Promise.resolve()),
            runBinProcess: jest.fn(() => Promise.resolve()),
        };

        cardinalThreeDSecureFlow = new CardinalThreeDSecureFlow(
            paymentIntegrationService,
            cardinalClient as CardinalClient,
        );

        jest.spyOn(cardinalThreeDSecureFlow, 'prepare').mockReturnValue(() => Promise.resolve());
        jest.spyOn(cardinalThreeDSecureFlow, 'start').mockReturnValue(() => Promise.resolve());

        strategy = new PaypalProPaymentStrategy(
            paymentIntegrationService,
            cardinalThreeDSecureFlow,
        );
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    describe('#initialize', () => {
        it('throws error if payment method is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => {
                throw new Error();
            });

            try {
                await strategy.initialize({ methodId: paymentMethod.id });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('does not prepare 3DS flow if not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cardinalThreeDSecureFlow.prepare).not.toHaveBeenCalled();
        });

        it('prepares 3DS flow if enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize({ methodId: paymentMethod.id });

            expect(cardinalThreeDSecureFlow.prepare).toHaveBeenCalled();
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
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => {
                throw new Error();
            });

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('does not start 3DS flow if not enabled', async () => {
            paymentMethod.config.is3dsEnabled = false;

            await strategy.execute(payload);

            expect(cardinalThreeDSecureFlow.start).not.toHaveBeenCalled();
        });

        it('starts 3DS flow if enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.execute(payload);

            expect(cardinalThreeDSecureFlow.start).toHaveBeenCalled();
        });

        describe('if payment is acknowledged', () => {
            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentStatus',
                ).mockReturnValue(PaymentStatusTypes.ACKNOWLEDGE);

                jest.clearAllMocks();
            });

            it('submits order with payment method name', async () => {
                const submitOrderAction = of();

                jest.spyOn(paymentIntegrationService, 'submitOrder').mockReturnValue(
                    submitOrderAction,
                );

                await strategy.execute(payload);

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    {
                        ...payload,
                        payment: { methodId: payload.payment && payload.payment.methodId },
                    },
                    undefined,
                );
            });

            it('does not submit payment separately', async () => {
                const submitPaymentAction = of();

                jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValue(
                    submitPaymentAction,
                );

                await strategy.execute(payload);

                expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
            });
        });
    });
});
