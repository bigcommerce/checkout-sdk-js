import {
    InvalidArgumentError,
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getAuthorizeNet, getGeneric } from '../mocks/google-pay-payment-method.mock';

import GooglePayGateway from './google-pay-gateway';

describe('GooglePayGateway', () => {
    let gateway: GooglePayGateway;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        jest.clearAllMocks();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService, 'loadShippingCountries').mockReturnValue(
            paymentIntegrationService.getState(),
        );

        gateway = new GooglePayGateway('example', paymentIntegrationService);
    });

    describe('#initialize', () => {
        it('should initialize the gateway', async () => {
            const initialize = gateway.initialize(getGeneric);

            await expect(initialize).resolves.toBeUndefined();
        });
    });

    describe('#getCardParameters', () => {
        it('should return card parameters', async () => {
            const expectedParams = {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'],
                billingAddressRequired: true,
                billingAddressParameters: {
                    format: 'FULL',
                    phoneNumberRequired: true,
                },
            };

            await gateway.initialize(getGeneric);

            expect(gateway.getCardParameters()).toStrictEqual(expectedParams);
        });

        it('should return only allowed card networks', async () => {
            const expectedAllowedCardNetworks = ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MASTERCARD'];

            await gateway.initialize(() => ({
                ...getGeneric(),
                supportedCards: [
                    'AMEX',
                    'FOO',
                    'DISCOVER',
                    'BAR',
                    'JCB',
                    'BAZ',
                    'VISA',
                    'FOOBAR',
                    'MC',
                ],
            }));

            expect(gateway.getCardParameters().allowedCardNetworks).toStrictEqual(
                expectedAllowedCardNetworks,
            );
        });
    });

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
            };

            await gateway.initialize(getGeneric);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        describe('should fail if:', () => {
            test('not initialized', () => {
                expect(() => gateway.getPaymentGatewayParameters()).toThrow(NotInitializedError);
            });

            test('gatewayMerchantId is missing', async () => {
                await gateway.initialize(getAuthorizeNet);

                expect(() => gateway.getPaymentGatewayParameters()).toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#getTransactionInfo', () => {
        it('should return ESTIMATED transaction info', async () => {
            const expectedInfo = {
                currencyCode: 'USD',
                totalPriceStatus: 'ESTIMATED',
                totalPrice: '0',
            };

            await gateway.initialize(getGeneric);

            expect(gateway.getTransactionInfo()).toStrictEqual(expectedInfo);
            expect(paymentIntegrationService.getState().getCartOrThrow).toHaveBeenCalled();
        });

        it('should return transaction info (Buy Now Flow)', async () => {
            const expectedInfo = {
                currencyCode: 'USD',
                totalPriceStatus: 'ESTIMATED',
                totalPrice: '0',
            };

            await gateway.initialize(getGeneric, true, 'USD');

            expect(gateway.getTransactionInfo()).toStrictEqual(expectedInfo);
            expect(paymentIntegrationService.getState().getCartOrThrow).not.toHaveBeenCalled();
        });

        describe('should fail if:', () => {
            it('currencyCode is not passed (Buy Now flow)', async () => {
                try {
                    await gateway.initialize(getGeneric, true);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidArgumentError);
                }
            });
        });
    });

    describe('#getMerchantInfo', () => {
        it('should get merchant info', async () => {
            const expectedInfo = {
                merchantName: 'Example Merchant',
                merchantId: '12345678901234567890',
                authJwt: 'foo.bar.baz',
            };

            await gateway.initialize(getGeneric);

            expect(gateway.getMerchantInfo()).toStrictEqual(expectedInfo);
        });
    });

    describe('#getRequiredData', () => {
        it('should only require email', async () => {
            const expectedRequiredData = {
                emailRequired: true,
            };

            await gateway.initialize(getGeneric);

            await expect(gateway.getRequiredData()).resolves.toStrictEqual(expectedRequiredData);
        });

        it('should only require data (Buy Now Flow)', async () => {
            const expectedRequiredData = {
                emailRequired: true,
                shippingAddressRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: true,
                },
            };

            await gateway.initialize(getGeneric, true, 'USD');

            await expect(gateway.getRequiredData()).resolves.toStrictEqual(expectedRequiredData);
        });

        // TODO: etc...

        it('should require email and shipping address', async () => {
            const expectedRequiredData = {
                emailRequired: true,
                shippingAddressRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: true,
                    allowedCountryCodes: ['AU', 'US', 'JP'],
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            await gateway.initialize(getGeneric);

            await expect(gateway.getRequiredData()).resolves.toStrictEqual(expectedRequiredData);
        });
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const expectedData = {
                nonce: '{"signature":"foo","protocolVersion":"ECv1","signedMessage":{"encryptedMessage":"bar","ephemeralPublicKey":"baz","tag":"foobar"}}',
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            const mappedData = await gateway.mapToExternalCheckoutData(getCardDataResponse());

            expect(mappedData).toStrictEqual(expectedData);
        });
    });

    describe('#mapToBillingAddressRequestBody', () => {
        it('should map response to billing address request body', () => {
            const expectedAddress = {
                email: 'test.tester@bigcommerce.com',
                firstName: 'John',
                lastName: 'Doe',
                company: 'Bigcommerce',
                address1: '505 Oakland Ave',
                address2: 'Building 1, 1st Floor',
                city: 'Austin',
                stateOrProvince: 'TX',
                stateOrProvinceCode: 'TX',
                countryCode: 'US',
                postalCode: '78703',
                phone: '+1 555-555-5555',
                customFields: [],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddress',
            ).mockReturnValueOnce({
                ...paymentIntegrationService.getState().getBillingAddress(),
                email: 'test.tester@bigcommerce.com',
            });

            const mappedAddress = gateway.mapToBillingAddressRequestBody(getCardDataResponse());

            expect(mappedAddress).toStrictEqual(expectedAddress);
        });

        it('should call getBillingAddress', () => {
            gateway.mapToBillingAddressRequestBody(getCardDataResponse());

            expect(paymentIntegrationService.getState().getBillingAddress).toHaveBeenCalled();
        });

        it('should use fallback data', () => {
            const response = getCardDataResponse();
            const expectedAddress = {
                email: 'john.doe@example.com',
                company: '',
                phone: '',
            };

            delete response.paymentMethodData.info.billingAddress?.phoneNumber;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddress',
            ).mockReturnValueOnce(undefined);

            const mappedAddress = gateway.mapToBillingAddressRequestBody(response);

            expect(mappedAddress).toMatchObject(expectedAddress);
        });

        it('should return undefined if billingAddress is missing in the response', () => {
            const response = getCardDataResponse();

            delete response.paymentMethodData.info.billingAddress;

            const mapAddress = gateway.mapToBillingAddressRequestBody(response);

            expect(mapAddress).toBeUndefined();
        });
    });

    describe('#mapToShippingAddressRequestBody', () => {
        it('should map response to address request body', () => {
            const expectedAddress = {
                firstName: 'John',
                lastName: 'Doe',
                company: 'Bigcommerce',
                address1: '11305 4 Points Dr',
                address2: 'Building 2, Suite 100',
                city: 'Austin',
                stateOrProvince: 'TX',
                stateOrProvinceCode: 'TX',
                countryCode: 'US',
                postalCode: '78726',
                phone: '+1 555-555-5555',
                customFields: [],
            };

            const mappedAddress = gateway.mapToShippingAddressRequestBody(getCardDataResponse());

            expect(mappedAddress).toStrictEqual(expectedAddress);
        });

        it('should call getShippingAddress', () => {
            gateway.mapToShippingAddressRequestBody(getCardDataResponse());

            expect(paymentIntegrationService.getState().getShippingAddress).toHaveBeenCalled();
        });

        it('should use fallback data', () => {
            const response = getCardDataResponse();
            const expectedAddress = {
                company: '',
                phone: '',
            };

            delete response.shippingAddress?.phoneNumber;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            const mappedAddress = gateway.mapToShippingAddressRequestBody(response);

            expect(mappedAddress).toMatchObject(expectedAddress);
        });

        it('should return undefined if billingAddress is missing in the response', () => {
            const response = getCardDataResponse();

            delete response.shippingAddress;

            const mapAddress = gateway.mapToShippingAddressRequestBody(response);

            expect(mapAddress).toBeUndefined();
        });
    });
});
