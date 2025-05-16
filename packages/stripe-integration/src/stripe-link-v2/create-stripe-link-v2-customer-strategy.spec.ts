import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeLinkV2CustomerStrategy from './create-stripe-link-v2-customer-strategy';
import StripeLinkV2CustomerStrategy from './stripe-link-v2-customer-strategy';

describe('createStripeLinkV2CustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create stripe Link v2 customer strategy', () => {
        const strategy = createStripeLinkV2CustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeLinkV2CustomerStrategy);
    });
});
