import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeLinkV2ButtonStrategy from './create-stripe-link-v2-button-strategy';
import StripeLinkV2ButtonStrategy from './stripe-link-v2-button-strategy';

describe('createStripeLinkV2ButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create stripe Link v2 button strategy', () => {
        const strategy = createStripeLinkV2ButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeLinkV2ButtonStrategy);
    });
});
