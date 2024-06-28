import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayGateway from './google-pay-gateway';

export default class GooglePayTdOnlineMartGateway extends GooglePayGateway {
    constructor(service: PaymentIntegrationService) {
        super('worldlinena', service);
    }
}
