import {
    MissingDataError,
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getAuthorizeNet, getGeneric } from '../mocks/google-pay-payment-method.mock';

import GooglePayAuthorizeNetGateway from './google-pay-authorizenet-gateway';
import GooglePayGateway from './google-pay-gateway';

describe('GooglePayAuthorizeNetGateway', () => {
    let gateway: GooglePayAuthorizeNetGateway;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        gateway = new GooglePayAuthorizeNetGateway(paymentIntegrationService);
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

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'authorizenet',
                gatewayMerchantId: 'exampleGatewayMerchantId',
            };

            await gateway.initialize(getAuthorizeNet);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        describe('should fail if:', () => {
            test('not initialized', () => {
                expect(() => gateway.getPaymentGatewayParameters()).toThrow(NotInitializedError);
            });

            test('initializationData is not GooglePayAuthorizeNetInitializationData', async () => {
                await gateway.initialize(getGeneric);

                expect(() => gateway.getPaymentGatewayParameters()).toThrow(MissingDataError);
            });
        });
    });
});
