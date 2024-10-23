import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getGeneric } from '../mocks/google-pay-payment-method.mock';

import GooglePayCybersourceGateway from './google-pay-cybersource-gateway';
import GooglePayGateway from './google-pay-gateway';

describe('GooglePayCybersourceGateway', () => {
    let gateway: GooglePayCybersourceGateway;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        gateway = new GooglePayCybersourceGateway(paymentIntegrationService);
    });

    it('is a special type of GooglePayGateway', () => {
        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const expectedData = {
                nonce: btoa(
                    '{"signature":"foo","protocolVersion":"ECv1","signedMessage":{"encryptedMessage":"bar","ephemeralPublicKey":"baz","tag":"foobar"}}',
                ),
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            const mappedData = await gateway.mapToExternalCheckoutData(getCardDataResponse());

            expect(mappedData).toStrictEqual(expectedData);
        });
    });

    describe('#super.getPaymentGatewayParameters', () => {
        it('should return the gateway identifier', async () => {
            await gateway.initialize(getGeneric);

            const params = await gateway.getPaymentGatewayParameters();

            expect(params.gateway).toBe('cybersource');
        });
    });
});
