import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createSquareV2PaymentStrategy from './create-squarev2-payment-strategy';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';

describe('createSquareV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates squarev2 payment strategy', () => {
        const strategy = createSquareV2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(SquareV2PaymentStrategy);
    });
});
