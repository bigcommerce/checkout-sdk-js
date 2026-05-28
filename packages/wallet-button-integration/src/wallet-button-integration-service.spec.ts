import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import BillingAddressRequestSender from './billing/billing-address-request-sender';
import { PaymentRequestSender } from './payment/payment-request-sender';
import WalletButtonIntegrationService from './wallet-button-integration-service';

describe('WalletButtonIntegrationService', () => {
    let requestSender: RequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const graphQLEndpoint = 'graphql';

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentRequestSender = new PaymentRequestSender(requestSender);
        billingAddressRequestSender = new BillingAddressRequestSender(requestSender);

        walletButtonIntegrationService = new WalletButtonIntegrationService(
            graphQLEndpoint,
            billingAddressRequestSender,
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

    describe('#updateBillingAddress()', () => {
        const checkoutId = 'checkout-123';
        const address = {
            id: 'address-1',
            firstName: 'John',
            lastName: 'Doe',
            company: '',
            address1: '',
            address2: '',
            city: '',
            email: '',
            stateOrProvince: '',
            stateOrProvinceCode: '',
            countryCode: '',
            postalCode: '',
            phone: '',
        };
        const expectedResponse = {
            body: { ...address, entityId: 'entity-1' },
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
        };

        it('delegates to BillingAddressRequestSender with the graphQLEndpoint', async () => {
            jest.spyOn(billingAddressRequestSender, 'updateBillingAddress').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.updateBillingAddress(
                checkoutId,
                address,
            );

            expect(billingAddressRequestSender.updateBillingAddress).toHaveBeenCalledWith(
                graphQLEndpoint,
                checkoutId,
                address,
                undefined,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('passes custom options to BillingAddressRequestSender', async () => {
            const customOptions = { headers: { Authorization: 'Bearer token-abc' } };

            jest.spyOn(billingAddressRequestSender, 'updateBillingAddress').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.updateBillingAddress(
                checkoutId,
                address,
                customOptions,
            );

            expect(billingAddressRequestSender.updateBillingAddress).toHaveBeenCalledWith(
                graphQLEndpoint,
                checkoutId,
                address,
                customOptions,
            );
            expect(result).toEqual(expectedResponse);
        });
    });
});
