import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getGeneric, getStripe } from '../mocks/google-pay-payment-method.mock';

import GooglePayGateway from './google-pay-gateway';
import GooglePayStripeGateway from './google-pay-stripe-gateway';

describe('GooglePayStripeGateway', () => {
    let gateway: GooglePayStripeGateway;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        gateway = new GooglePayStripeGateway(paymentIntegrationService);
    });

    it('is a special type of GooglePayGateway', () => {
        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const response = getCardDataResponse();

            response.paymentMethodData.tokenizationData.token = '{"id":"tok_f00b4r"}';

            const expectedData = {
                nonce: 'tok_f00b4r',
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            const mappedData = await gateway.mapToExternalCheckoutData(response);

            expect(mappedData).toStrictEqual(expectedData);
        });

        describe('should fail if:', () => {
            test('nonce is not valid JSON', async () => {
                const response = getCardDataResponse();

                response.paymentMethodData.tokenizationData.token = 'm4lf0rm3d j50n';

                const mapData = gateway.mapToExternalCheckoutData(response);

                await expect(mapData).rejects.toThrow(InvalidArgumentError);
            });

            test('parsed nonce is not a GooglePayStripeTokenObject', async () => {
                const mapData = gateway.mapToExternalCheckoutData(getCardDataResponse());

                await expect(mapData).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'stripe',
                'stripe:version': '2026-02-31',
                'stripe:publishableKey': 'pk_live_f00b4r/acct_f00b4r',
            };

            await gateway.initialize(getStripe);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        describe('should fail if:', () => {
            test('not initialized', () => {
                expect(() => gateway.getPaymentGatewayParameters()).toThrow(NotInitializedError);
            });

            test('initializationData is not GooglePayStripeInitializationData', async () => {
                await gateway.initialize(getGeneric);

                expect(() => gateway.getPaymentGatewayParameters()).toThrow(MissingDataError);
            });
        });
    });
});
