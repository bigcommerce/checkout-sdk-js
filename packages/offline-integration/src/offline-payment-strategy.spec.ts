import {
    OrderFinalizationNotRequiredError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import OfflinePaymentStrategy from './offline-payment-strategy';

describe('OfflinePaymentStrategy', () => {
    let strategy: OfflinePaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new OfflinePaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        it('calls submit order with payment data', async () => {
            await strategy.execute(getOrderRequestBody(), undefined);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {
                    ...getOrderRequestBody(),
                    payment: {
                        methodId: 'authorizenet',
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
            const options = { myOptions: 'option1', methodId: 'testgateway' };

            await strategy.execute(getOrderRequestBody(), options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                {
                    ...getOrderRequestBody(),
                    payment: {
                        methodId: 'authorizenet',
                    },
                },
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
