import { omit } from 'lodash';

import {
    OrderFinalizationNotRequiredError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import NoPaymentDataRequiredPaymentStrategy from './no-payment-data-required-strategy';

describe('NoPaymentDataRequiredPaymentStrategy', () => {
    let strategy: NoPaymentDataRequiredPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new NoPaymentDataRequiredPaymentStrategy(paymentIntegrationService);
    });

    describe('#execute()', () => {
        it('calls submit order with the right data', async () => {
            await strategy.execute(getOrderRequestBody(), undefined);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(getOrderRequestBody(), 'payment'),
                undefined,
            );
        });

        it('passes the options to submitOrder', async () => {
            const options = { myOptions: 'option1', methodId: 'testgateway' };

            await strategy.execute(getOrderRequestBody(), options);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                omit(getOrderRequestBody(), 'payment'),
                options,
            );
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
