import { merge } from 'lodash';

import { CardinalThreeDSecureFlow } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getCybersource } from '../cybersource.mock';

import CyberSourcePaymentStrategy from './cybersource-payment-strategy';

describe('CyberSourcePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let strategy: CyberSourcePaymentStrategy;
    let threeDSecureFlow: Pick<CardinalThreeDSecureFlow, 'prepare' | 'start'>;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        paymentMethod = getCybersource();

        threeDSecureFlow = {
            prepare: jest.fn(() => Promise.resolve()),
            start: jest.fn(() => Promise.resolve()),
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        strategy = new CyberSourcePaymentStrategy(
            paymentIntegrationService,
            threeDSecureFlow as CardinalThreeDSecureFlow,
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

            expect(threeDSecureFlow.prepare).not.toHaveBeenCalled();
        });

        it('prepares 3DS flow if enabled', async () => {
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

            expect(threeDSecureFlow.start).not.toHaveBeenCalled();
        });

        it('starts 3DS flow if enabled', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.execute(payload);

            expect(threeDSecureFlow.start).toHaveBeenCalled();
        });
    });
});
