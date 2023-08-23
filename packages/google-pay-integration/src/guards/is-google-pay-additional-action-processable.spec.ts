import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from '../gateways/google-pay-gateway';
import { GooglePayAdditionalActionProcessable } from '../types';

import isGooglePayAdditionalActionProcessable from './is-google-pay-additional-action-processable';

describe('isGooglePayAdditionalActionProcessable', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('should be GooglePayAdditionalActionProcessable', () => {
        const gateway = new (class
            extends GooglePayGateway
            implements GooglePayAdditionalActionProcessable
        {
            processAdditionalAction(error: unknown) {
                return Promise.reject(error);
            }
        })('example', paymentIntegrationService);

        expect(isGooglePayAdditionalActionProcessable(gateway)).toBe(true);
    });

    it('should NOT be GooglePayAdditionalActionProcessable', () => {
        const gateway = new (class extends GooglePayGateway {})(
            'example',
            paymentIntegrationService,
        );

        expect(isGooglePayAdditionalActionProcessable(gateway)).toBe(false);
    });
});
