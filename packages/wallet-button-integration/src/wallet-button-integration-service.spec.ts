import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { PaymentRequestSender } from './payment/payment-request-sender';
import WalletButtonIntegrationService from './wallet-button-integration-service';

describe('WalletButtonIntegrationService', () => {
    let requestSender: RequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const graphQLEndpoint = 'graphql';

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentRequestSender = new PaymentRequestSender(requestSender);
        walletButtonIntegrationService = new WalletButtonIntegrationService(
            graphQLEndpoint,
            paymentRequestSender,
        );
    });

    describe('#createPaymentOrderIntent()', () => {
        it('delegates to PaymentRequestSender with the graphQLEndpoint', async () => {
            const inputData = {
                cartEntityId: 'cart-id-123',
                paymentWalletEntityId: 'paypalcommerce',
            };

            const expectedResponse = {
                body: {
                    approvalUrl: 'https://www.paypal.com/approve',
                    orderId: 'order-id-123',
                    initializationEntityId: 'init-123',
                },
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            };

            jest.spyOn(paymentRequestSender, 'createPaymentOrderIntent').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.createPaymentOrderIntent(inputData);

            expect(paymentRequestSender.createPaymentOrderIntent).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                undefined,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('passes custom options to PaymentRequestSender', async () => {
            const inputData = {
                cartEntityId: 'cart-id-456',
                paymentWalletEntityId: 'paypalcommerce',
            };

            const customOptions = {
                headers: { Authorization: 'Bearer token-xyz' },
            };

            const expectedResponse = {
                body: {
                    approvalUrl: 'https://www.paypal.com/approve',
                    orderId: 'order-id-456',
                    initializationEntityId: 'init-456',
                },
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
            };

            jest.spyOn(paymentRequestSender, 'createPaymentOrderIntent').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.createPaymentOrderIntent(
                inputData,
                customOptions,
            );

            expect(paymentRequestSender.createPaymentOrderIntent).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                customOptions,
            );
            expect(result).toEqual(expectedResponse);
        });
    });
});
