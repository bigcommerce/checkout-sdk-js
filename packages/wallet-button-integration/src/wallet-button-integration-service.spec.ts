import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import BillingAddressRequestSender from './billing/billing-address-request-sender';
import { CheckoutHandoffMethod } from './checkout/checkout';
import { CheckoutRequestSender } from './checkout/checkout-request-sender';
import { PaymentRequestSender } from './payment/payment-request-sender';
import ShippingAddressRequestSender from './shipping/shipping-address-request-sender';
import WalletButtonIntegrationService from './wallet-button-integration-service';

describe('WalletButtonIntegrationService', () => {
    let requestSender: RequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let shippingAddressRequestSender: ShippingAddressRequestSender;
    let checkoutRequestSender: CheckoutRequestSender;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const graphQLEndpoint = 'graphql';

    beforeEach(() => {
        requestSender = createRequestSender();
        paymentRequestSender = new PaymentRequestSender(requestSender);
        billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
        shippingAddressRequestSender = new ShippingAddressRequestSender(requestSender);
        checkoutRequestSender = new CheckoutRequestSender(requestSender);

        walletButtonIntegrationService = new WalletButtonIntegrationService(
            graphQLEndpoint,
            billingAddressRequestSender,
            shippingAddressRequestSender,
            paymentRequestSender,
            checkoutRequestSender,
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
                undefined,
                customOptions,
            );

            expect(paymentRequestSender.createPaymentOrderIntent).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                undefined,
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

    describe('#updateShippingAddress()', () => {
        it('passes supplied line items to ShippingAddressRequestSender', async () => {
            const checkoutId = 'checkout-id-123';
            const address = {
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: '123 Main St',
                address2: '',
                city: 'Austin',
                email: 'john@example.com',
                stateOrProvince: 'Texas',
                stateOrProvinceCode: 'TX',
                countryCode: 'US',
                postalCode: '78701',
                phone: '555-555-5555',
                shouldSaveAddress: false,
            };
            const options = {
                lineItems: [{ entityId: 'line-item-1', quantity: 2 }],
            };

            jest.spyOn(shippingAddressRequestSender, 'updateShippingAddress').mockResolvedValue();

            await walletButtonIntegrationService.updateShippingAddress(
                checkoutId,
                address,
                options,
            );

            expect(shippingAddressRequestSender.updateShippingAddress).toHaveBeenCalledWith(
                graphQLEndpoint,
                checkoutId,
                address,
                options,
            );
        });
    });

    describe('#selectShippingOption()', () => {
        it('passes checkout and shipping option identifiers to ShippingAddressRequestSender', async () => {
            const result = {
                consignmentEntityId: 'consignment-1',
                availableShippingOptions: [],
                selectedShippingOptionEntityId: 'option-1',
                currencyCode: 'USD',
                totalPrice: '12.50',
            };
            const selectShippingOption = jest
                .spyOn(shippingAddressRequestSender, 'selectShippingOption')
                .mockResolvedValue(result);

            await expect(
                walletButtonIntegrationService.selectShippingOption(
                    'checkout-id-123',
                    'consignment-1',
                    'option-1',
                ),
            ).resolves.toBe(result);

            expect(selectShippingOption).toHaveBeenCalledWith(
                graphQLEndpoint,
                'checkout-id-123',
                'consignment-1',
                'option-1',
                undefined,
            );
        });
    });

    describe('#getRedirectToCheckoutUrl()', () => {
        const inputData = {
            paymentWalletData: {
                providerId: 'paypalcommerce',
                providerOrderId: 'order-id-123',
            },
            cartEntityId: 'cart-id-123',
            queryParams: [{ key: 'foo', value: 'bar' }],
        };

        const expectedResponse = {
            body: {
                redirectUrls: { externalCheckoutUrl: 'https://store.example.com/checkout' },
            },
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
        };

        it('delegates to CheckoutRequestSender with the graphQLEndpoint', async () => {
            jest.spyOn(checkoutRequestSender, 'getRedirectToCheckoutUrl').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.getRedirectToCheckoutUrl(inputData);

            expect(checkoutRequestSender.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                undefined,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('passes custom options to CheckoutRequestSender', async () => {
            const customOptions = { headers: { Authorization: 'Bearer token-xyz' } };

            jest.spyOn(checkoutRequestSender, 'getRedirectToCheckoutUrl').mockResolvedValue(
                expectedResponse,
            );

            const result = await walletButtonIntegrationService.getRedirectToCheckoutUrl(
                inputData,
                customOptions,
            );

            expect(checkoutRequestSender.getRedirectToCheckoutUrl).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                customOptions,
            );
            expect(result).toEqual(expectedResponse);
        });

        it('requests checkout handoff from CheckoutRequestSender', async () => {
            const customOptions = { headers: { Authorization: 'Bearer token-xyz' } };

            const expectedHandoffResponse = {
                ...expectedResponse,
                body: {
                    redirectUrls: {
                        externalCheckoutUrl: 'https://store.example.com/checkout',
                        externalCheckoutHandoff: {
                            url: 'https://store.example.com/checkout',
                            method: CheckoutHandoffMethod.Redirect,
                            fields: [],
                        },
                    },
                },
            };

            jest.spyOn(checkoutRequestSender, 'getRedirectToCheckoutHandoff').mockResolvedValue(
                expectedHandoffResponse,
            );

            const result = await walletButtonIntegrationService.getRedirectToCheckoutHandoff(
                inputData,
                customOptions,
            );

            expect(checkoutRequestSender.getRedirectToCheckoutHandoff).toHaveBeenCalledWith(
                graphQLEndpoint,
                inputData,
                customOptions,
            );
            expect(result).toEqual(expectedHandoffResponse);
        });
    });
});
