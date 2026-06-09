import {
    OrderFinalizationNotRequiredError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import NetTermsPaymentStrategy from './net-terms-payment-strategy';

describe('NetTermsPaymentStrategy', () => {
    let strategy: NetTermsPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new NetTermsPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        it('calls submit order forwarding payment data (e.g. the PO Number)', async () => {
            const payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'net_terms',
                    gatewayId: undefined,
                    paymentData: { poNumber: 'PO-12345' },
                },
            };

            await strategy.execute(payload, undefined);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {
                    ...payload,
                    payment: {
                        methodId: 'net_terms',
                        gatewayId: undefined,
                        paymentData: { poNumber: 'PO-12345' },
                    },
                },
                undefined,
            );
        });

        it('calls submit order without payment data if no payment data provided', async () => {
            await strategy.execute({ ...getOrderRequestBody(), payment: undefined }, undefined);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {
                    ...getOrderRequestBody(),
                    payment: undefined,
                },
                undefined,
            );
        });

        it('passes the options to submitOrder', async () => {
            const options = { methodId: 'net_terms' };

            await strategy.execute(getOrderRequestBody(), options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    payment: expect.objectContaining({ methodId: 'authorizenet' }),
                }),
                options,
            );
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
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
