import { merge, omit } from 'lodash';

import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import OffsitePaymentStrategy from './offsite-payment-strategy';

describe('OffsitePaymentStrategy', () => {
    let strategy: OffsitePaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let payload: OrderRequestBody;
    let options: PaymentRequestOptions;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        options = { methodId: 'foobar' };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: options.methodId,
                paymentData: null,
            },
        });

        strategy = new OffsitePaymentStrategy(paymentIntegrationService);
    });

    describe('#execute', () => {
        it('throws error when payment data is empty', async () => {
            await expect(strategy.execute({})).rejects.toThrow(PaymentArgumentInvalidError);
        });

        it('submits order without payment data', async () => {
            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(payload, 'payment'),
                options,
            );
        });

        it('submits order with payment data if payment gateway is "adyen"', async () => {
            options = { methodId: 'amex', gatewayId: 'adyen' };
            payload = {
                ...payload,
                payment: {
                    methodId: options.methodId,
                    gatewayId: options.gatewayId,
                    paymentData: {
                        instrumentId: '123',
                    },
                },
            };

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(payload, options);
        });

        it('submits order with payment data if payment method is "ccavenuemars"', async () => {
            options = { methodId: 'ccavenuemars' };
            payload = {
                ...payload,
                payment: { methodId: options.methodId, gatewayId: options.gatewayId },
            };

            await strategy.execute(payload, options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(payload, options);
        });

        it('initializes offsite payment flow', async () => {
            await strategy.execute(payload, options);

            expect(paymentIntegrationService.initializeOffsitePayment).toHaveBeenCalledWith({
                methodId: options.methodId,
                gatewayId: options.gatewayId,
            });
        });
    });

    describe('#finalize()', () => {
        it('calls finalize order', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                PaymentStatusTypes.ACKNOWLEDGE,
            );

            await strategy.finalize();

            expect(paymentIntegrationService.finalizeOrder).toHaveBeenCalled();
        });

        it('throws error if payment status is initialize', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentStatus').mockReturnValue(
                PaymentStatusTypes.INITIALIZE,
            );

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#initialize()', () => {
        it('initializes the strategy correctly', async () => {
            const result = await strategy.initialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
