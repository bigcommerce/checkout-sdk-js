import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConsignment,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getAuthorizeNet, getGeneric } from '../mocks/google-pay-payment-method.mock';
import { CallbackIntentsType, CallbackTriggerType, GooglePayFullBillingAddress } from '../types';

import GooglePayGateway from './google-pay-gateway';

describe('GooglePayGateway', () => {
    let gateway: GooglePayGateway;
    let paymentIntegrationService: PaymentIntegrationService;

    const getGenericInitialDataWithShippingOptions = (isExperimentEnabled = true) => {
        const genericData = getGeneric();

        return {
            ...genericData,
            initializationData: {
                ...genericData.initializationData!,
                isShippingOptionsEnabled: isExperimentEnabled,
            },
        };
    };

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
                countryCode: 'US',
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
                countryCode: 'US',
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

        it('should require email and shipping address', async () => {
            const expectedRequiredData = {
                emailRequired: true,
                shippingAddressRequired: true,
                shippingOptionRequired: false,
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

        it('should require shipping options', async () => {
            const expectedRequiredData = {
                emailRequired: true,
                shippingAddressRequired: true,
                shippingOptionRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: true,
                    allowedCountryCodes: ['AU', 'US', 'JP'],
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            await gateway.initialize(getGenericInitialDataWithShippingOptions);

            await expect(gateway.getRequiredData()).resolves.toStrictEqual(expectedRequiredData);
        });
    });

    describe('#getCallbackIntents', () => {
        it('should return only offer callback intent for disabled shipping options experiment', async () => {
            const expectedCallbackIntents = [CallbackIntentsType.OFFER];

            await gateway.initialize(getGeneric);

            expect(gateway.getCallbackIntents()).toStrictEqual(expectedCallbackIntents);
        });

        it('should return only offer callback intent when shipping not required', async () => {
            const expectedCallbackIntents = [CallbackIntentsType.OFFER];

            await gateway.initialize(getGenericInitialDataWithShippingOptions);

            expect(gateway.getCallbackIntents()).toStrictEqual(expectedCallbackIntents);
        });

        it('should return shipping callback intents', async () => {
            const expectedCallbackIntents = [
                CallbackIntentsType.OFFER,
                CallbackIntentsType.SHIPPING_ADDRESS,
                CallbackIntentsType.SHIPPING_OPTION,
            ];

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getShippingAddress',
            ).mockReturnValueOnce(undefined);

            await gateway.initialize(getGenericInitialDataWithShippingOptions);

            expect(gateway.getCallbackIntents()).toStrictEqual(expectedCallbackIntents);
        });
    });

    describe('#getCallbackTriggers', () => {
        it('should return only initialize trigger when shipping experiment disabled', async () => {
            const expectedCallbackTriggers = {
                availableTriggers: [CallbackTriggerType.INITIALIZE],
                initializationTrigger: [CallbackTriggerType.INITIALIZE],
                addressChangeTriggers: [],
                shippingOptionsChangeTriggers: [],
            };

            await gateway.initialize(getGeneric);

            expect(gateway.getCallbackTriggers()).toStrictEqual(expectedCallbackTriggers);
        });

        it('should return initialize triggers', async () => {
            const expectedCallbackTriggers = {
                availableTriggers: [
                    CallbackTriggerType.INITIALIZE,
                    CallbackTriggerType.SHIPPING_ADDRESS,
                    CallbackTriggerType.SHIPPING_OPTION,
                ],
                initializationTrigger: [CallbackTriggerType.INITIALIZE],
                addressChangeTriggers: [
                    CallbackTriggerType.INITIALIZE,
                    CallbackTriggerType.SHIPPING_ADDRESS,
                ],
                shippingOptionsChangeTriggers: [CallbackTriggerType.SHIPPING_OPTION],
            };

            await gateway.initialize(getGenericInitialDataWithShippingOptions);

            expect(gateway.getCallbackTriggers()).toStrictEqual(expectedCallbackTriggers);
        });
    });

    describe('#getNonce', () => {
        it('should throw an error if initializationData not exists', async () => {
            const initializeData = () => {
                const generic = getGeneric();

                return {
                    ...generic,
                    initializationData: undefined,
                };
            };
            let error: MissingDataError | undefined;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce(initializeData());

            await gateway.initialize(initializeData);

            try {
                await gateway.getNonce('methodId');
            } catch (err) {
                error = err;
            } finally {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('should throw an error if nonce not exists', async () => {
            const initializeData = () => {
                const generic = getGeneric();

                return {
                    ...generic,
                    initializationData: {
                        ...generic.initializationData!,
                        nonce: undefined,
                    },
                };
            };
            let error: MissingDataError | undefined;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce(initializeData());

            await gateway.initialize(initializeData);

            try {
                await gateway.getNonce('methodId');
            } catch (err) {
                error = err;
            } finally {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('should return nonce', async () => {
            const initializeData = () => {
                const generic = getGeneric();

                return {
                    ...generic,
                    initializationData: {
                        ...generic.initializationData!,
                        nonce: 'gpay-nonce',
                    },
                };
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValueOnce(initializeData());

            await gateway.initialize(initializeData);

            expect(await gateway.getNonce('methodId')).toBe('gpay-nonce');
        });
    });

    describe('#extraPaymentData', () => {
        it('should return extra payment data as undefined', async () => {
            await gateway.initialize(getGeneric);

            await expect(gateway.extraPaymentData()).resolves.toBeUndefined();
        });
    });

    describe('#handleShippingAddressChange', () => {
        const defaultGPayShippingAddress: GooglePayFullBillingAddress = {
            address1: '',
            address2: '',
            address3: '',
            administrativeArea: 'US',
            locality: 'TX',
            sortingCode: '78726',
            name: '',
            postalCode: '',
            countryCode: '',
        };

        it('should not update shipping address if it does not provided', async () => {
            const updateShippingAddressMock = jest.spyOn(
                paymentIntegrationService,
                'updateShippingAddress',
            );

            await gateway.initialize(getGeneric);

            await gateway.handleShippingAddressChange();

            expect(updateShippingAddressMock).not.toHaveBeenCalled();
        });

        it('should update shipping address', async () => {
            const mappedAddressMock = {
                firstName: '',
                lastName: '',
                company: 'Bigcommerce',
                address1: '',
                address2: '',
                city: 'TX',
                stateOrProvince: 'US',
                stateOrProvinceCode: 'US',
                countryCode: '',
                postalCode: '',
                phone: '555-555-5555',
                customFields: [],
            };

            const updateShippingAddressMock = jest.spyOn(
                paymentIntegrationService,
                'updateShippingAddress',
            );

            await gateway.initialize(getGeneric);

            await gateway.handleShippingAddressChange(defaultGPayShippingAddress);

            expect(updateShippingAddressMock).toHaveBeenCalledWith(mappedAddressMock);
        });

        it('should return undefined if consignments does not exists', async () => {
            await gateway.initialize(getGeneric);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValueOnce(
                undefined,
            );

            await expect(
                gateway.handleShippingAddressChange(defaultGPayShippingAddress),
            ).resolves.toBeUndefined();
        });

        it('should return empty data if consignments empty', async () => {
            await gateway.initialize(getGeneric);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValueOnce(
                [],
            );

            await expect(
                gateway.handleShippingAddressChange(defaultGPayShippingAddress),
            ).resolves.toBeUndefined();
        });

        it('should return undefined if no available shipping methods', async () => {
            const consiment = {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: undefined,
            };

            await gateway.initialize(getGeneric);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValueOnce(
                [consiment],
            );

            await expect(
                gateway.handleShippingAddressChange(defaultGPayShippingAddress),
            ).resolves.toBeUndefined();
        });

        it('should return empty available shipping methods with no preselected option', async () => {
            const consignment = {
                ...getConsignment(),
                selectedShippingOption: undefined,
            };
            const expectedSippingOptions = [
                {
                    id: consignment.availableShippingOptions![0].id,
                    label: consignment.availableShippingOptions![0].description,
                    description: '$0.00',
                },
            ];
            const selectShippingOptionMock = jest.spyOn(
                paymentIntegrationService,
                'selectShippingOption',
            );

            await gateway.initialize(getGeneric);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValueOnce(
                [consignment],
            );

            await expect(
                gateway.handleShippingAddressChange(defaultGPayShippingAddress),
            ).resolves.toStrictEqual({
                defaultSelectedOptionId: consignment.availableShippingOptions![0].id,
                shippingOptions: expectedSippingOptions,
            });
            expect(selectShippingOptionMock).toHaveBeenCalledWith(
                consignment.availableShippingOptions![0].id,
            );
        });

        it('should return empty available shipping methods with preselected option', async () => {
            const consignment = getConsignment();
            const expectedSippingOptions = [
                {
                    id: consignment.availableShippingOptions![0].id,
                    label: consignment.availableShippingOptions![0].description,
                    description: '$0.00',
                },
            ];
            const selectShippingOptionMock = jest.spyOn(
                paymentIntegrationService,
                'selectShippingOption',
            );

            await gateway.initialize(getGeneric);

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignments').mockReturnValueOnce(
                [consignment],
            );

            await expect(
                gateway.handleShippingAddressChange(defaultGPayShippingAddress),
            ).resolves.toStrictEqual({
                defaultSelectedOptionId: consignment.selectedShippingOption?.id,
                shippingOptions: expectedSippingOptions,
            });
            expect(selectShippingOptionMock).not.toHaveBeenCalled();
        });
    });

    describe('#handleShippingOptionChange', () => {
        it('should update shipping option', async () => {
            const selectShippingOptionMock = jest.spyOn(
                paymentIntegrationService,
                'selectShippingOption',
            );

            await gateway.initialize(getGeneric);

            await gateway.handleShippingOptionChange('optionId');

            expect(selectShippingOptionMock).toHaveBeenCalledWith('optionId');
        });

        it('should not update shipping option if it does not selected', async () => {
            const selectShippingOptionMock = jest.spyOn(
                paymentIntegrationService,
                'selectShippingOption',
            );

            await gateway.initialize(getGeneric);

            await gateway.handleShippingOptionChange('shipping_option_unselected');

            expect(selectShippingOptionMock).not.toHaveBeenCalled();
        });
    });

    describe('#getTotalPrice', () => {
        it('should return total price', async () => {
            const expectedPrice = '190.00';

            await gateway.initialize(getGeneric);

            expect(gateway.getTotalPrice()).toBe(expectedPrice);
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
