import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeConnect,
    BraintreeFastlane,
    BraintreeFastlaneAuthenticationState,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    getBraintreeConnectProfileDataMock,
    getBraintreeFastlaneProfileDataMock,
    getConnectMock,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCountries,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { getBraintreeAcceleratedCheckoutPaymentMethod } from '../mocks/braintree.mock';

import BraintreeFastlaneUtils from './braintree-fastlane-utils';

describe('BraintreeFastlaneUtils', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let subject: BraintreeFastlaneUtils;

    const cart = getCart();
    const countries = getCountries();
    const customer = getCustomer();
    const billingAddress = getBillingAddress();
    const paymentMethod = getBraintreeAcceleratedCheckoutPaymentMethod();
    const storeConfig = getConfig().storeConfig;

    const methodId = 'braintreeacceleratedcheckout';

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();
        braintreeFastlaneMock = getFastlaneMock();
        jest.spyOn(Date, 'now').mockImplementation(() => 1);

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        browserStorage = new BrowserStorage('paypalConnect');
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        subject = new BraintreeFastlaneUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        jest.spyOn(browserStorage, 'removeItem');
        jest.spyOn(browserStorage, 'setItem');

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress');
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer').mockImplementation(
            jest.fn,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(customer);
        jest.spyOn(paymentIntegrationService.getState(), 'getCountries').mockReturnValue(countries);
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
            billingAddress,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockImplementation(jest.fn);
        jest.spyOn(braintreeIntegrationService, 'getBraintreeConnect').mockImplementation(
            () => braintreeConnectMock,
        );
        jest.spyOn(braintreeIntegrationService, 'getBraintreeFastlane').mockImplementation(
            () => braintreeFastlaneMock,
        );

        jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({
            customerContextId: 'customerContextId',
        });

        jest.spyOn(braintreeFastlaneMock.identity, 'lookupCustomerByEmail').mockReturnValue({
            customerContextId: 'customerContextId',
        });

        jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
            authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
            profileData: getBraintreeConnectProfileDataMock(),
        });

        jest.spyOn(braintreeFastlaneMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
            authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
            profileData: getBraintreeFastlaneProfileDataMock(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initializeBraintreeFastlaneOrThrow() with connect', () => {
        it('throws an error if clientToken is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            try {
                await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if initializationData is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: undefined,
            });

            try {
                await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service and loads braintree connect', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                storeConfig,
            );
            expect(braintreeIntegrationService.getBraintreeConnect).toHaveBeenCalledWith(
                cart.id,
                false,
                undefined,
            );
        });
    });

    describe('#initializeBraintreeFastlaneOrThrow()', () => {
        it('throws an error if clientToken is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            try {
                await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if initializationData is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: undefined,
            });

            try {
                await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service and loads braintree fastlane', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            });
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                storeConfig,
            );
            expect(braintreeIntegrationService.getBraintreeFastlane).toHaveBeenCalledWith(
                cart.id,
                false,
                undefined,
            );
        });
    });

    describe('#runPayPalConnectAuthenticationFlowOrThrow()', () => {
        it('does not authenticate user if braintree connect is not loaded', async () => {
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('checks if there is PP Connect account with customer email', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalled();
        });

        it('does not authenticate user if the customer unrecognized in PP Connect', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: BraintreeFastlaneAuthenticationState.UNRECOGNIZED,
                addresses: [],
                instruments: [],
            });
        });

        it('triggers PP Connect authentication flow if customer is detected as PP Connect user', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });

        it('successfully authenticate customer with PP Connect', async () => {
            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '14085551234',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                        untrustedShippingCardVerificationMode: 'pan',
                    },
                ],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('successfully authenticate customer with PP Connect and different shipping and billing addresses', async () => {
            const defaultProfileData = getBraintreeConnectProfileDataMock();
            const profileData = getBraintreeConnectProfileDataMock();

            profileData.cards[0].paymentSource.card.billingAddress = {
                ...defaultProfileData.cards[0].paymentSource.card.billingAddress,
                firstName: 'Mr.',
                lastName: 'Smith',
            };

            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                profileData,
            });

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '14085551234',
                        customFields: [],
                    },
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'Mr.',
                        lastName: 'Smith',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '14085551234',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                        untrustedShippingCardVerificationMode: 'pan',
                    },
                ],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('does not authenticate customer if the authentication was canceled or failed', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                profileData: {},
            });

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                addresses: [],
                instruments: [],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(browserStorage.removeItem).toHaveBeenCalledWith('sessionId');
            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('preselects billing address with first paypal connect billing address', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                id: 1,
                type: 'paypal-address',
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                country: 'United States',
                countryCode: 'US',
                postalCode: '98225',
                phone: '14085551234',
                customFields: [],
            });
        });

        it('preselects shipping address with first paypal connect address', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith({
                id: 1,
                type: 'paypal-address',
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                country: 'United States',
                countryCode: 'US',
                postalCode: '98225',
                phone: '14085551234',
                customFields: [],
            });
        });

        it('do not update billing and shipping address if paypal does not return any address in profile data', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                profileData: {
                    addresses: [],
                    instruments: [],
                },
            });

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).not.toHaveBeenCalled();
            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });

        it('does not update shipping address if the cart contains only digital items', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue({
                ...cart,
                lineItems: {
                    ...cart.lineItems,
                    physicalItems: [],
                },
            });

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });
    });

    describe('#runPayPalFastlaneAuthenticationFlowOrThrow()', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            });
        });

        it('does not authenticate user if braintree fastlane is not loaded', async () => {
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('checks if there is PP Fastlane account with customer email', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(braintreeFastlaneMock.identity.lookupCustomerByEmail).toHaveBeenCalled();
        });

        it('updates customer provider and billing address with correct data', async () => {
            const expectedBillingAddress = {
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                company: '',
                country: 'United States',
                countryCode: 'US',
                customFields: [],
                firstName: 'John',
                id: 1,
                lastName: 'Doe',
                phone: '12345',
                postalCode: '98225',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                type: 'paypal-address',
            };

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '12345',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                        untrustedShippingCardVerificationMode: 'pan',
                    },
                ],
            };
            const profileData = getBraintreeFastlaneProfileDataMock();
            profileData.shippingAddress.phoneNumber = '12345';
            jest.spyOn(braintreeFastlaneMock.identity, 'triggerAuthenticationFlow').mockReturnValue(
                {
                    authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                    profileData,
                },
            );
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                expectedBillingAddress,
            );
        });

        it('does not authenticate user if the customer unrecognized in PP Fastlane', async () => {
            jest.spyOn(braintreeFastlaneMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: BraintreeFastlaneAuthenticationState.UNRECOGNIZED,
                addresses: [],
                instruments: [],
            });
        });

        it('triggers PP Fastlane authentication flow if customer is detected as PP Fastlane user', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(braintreeFastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });

        it('successfully authenticate customer with PP Fastlane', async () => {
            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                        untrustedShippingCardVerificationMode: 'pan',
                    },
                ],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(braintreeFastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('successfully authenticate customer with PP Fastlane and different shipping and billing addresses', async () => {
            const defaultProfileData = getBraintreeFastlaneProfileDataMock();
            const profileData = getBraintreeFastlaneProfileDataMock();

            profileData.card.paymentSource.card.billingAddress = {
                ...defaultProfileData.card.paymentSource.card.billingAddress,
                firstName: 'Mr.',
                lastName: 'Smith',
            };

            jest.spyOn(braintreeFastlaneMock.identity, 'triggerAuthenticationFlow').mockReturnValue(
                {
                    authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                    profileData,
                },
            );

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '',
                        customFields: [],
                    },
                    {
                        id: 1,
                        type: 'paypal-address',
                        firstName: 'Mr.',
                        lastName: 'Smith',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                        untrustedShippingCardVerificationMode: 'pan',
                    },
                ],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(browserStorage.setItem).toHaveBeenCalledWith('sessionId', cart.id);
            expect(braintreeFastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('does not authenticate customer if the authentication was canceled or failed', async () => {
            jest.spyOn(braintreeFastlaneMock.identity, 'triggerAuthenticationFlow').mockReturnValue(
                {
                    authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                    profileData: {},
                },
            );

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
                addresses: [],
                instruments: [],
            };

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(browserStorage.removeItem).toHaveBeenCalledWith('sessionId');
            expect(braintreeFastlaneMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('preselects billing address with first paypal fastlane billing address', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                id: 1,
                type: 'paypal-address',
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                country: 'United States',
                countryCode: 'US',
                postalCode: '98225',
                phone: '',
                customFields: [],
            });
        });

        it('preselects shipping address with first paypal fastlane address', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId, undefined);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith({
                id: 1,
                type: 'paypal-address',
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                country: 'United States',
                countryCode: 'US',
                postalCode: '98225',
                phone: '',
                customFields: [],
            });
        });

        it('do not update billing and shipping address if paypal does not return any address in profile data', async () => {
            jest.spyOn(braintreeFastlaneMock.identity, 'triggerAuthenticationFlow').mockReturnValue(
                {
                    authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                    profileData: {
                        addresses: [],
                        instruments: [],
                    },
                },
            );

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).not.toHaveBeenCalled();
            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });

        it('does not update shipping address if the cart contains only digital items', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue({
                ...cart,
                lineItems: {
                    ...cart.lineItems,
                    physicalItems: [],
                },
            });

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });

        it('preselects billing with shipping firstName and lastName if the cart contains only digital items', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue({
                ...cart,
                lineItems: {
                    ...cart.lineItems,
                    physicalItems: [],
                },
            });

            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.runPayPalFastlaneAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                id: 1,
                type: 'paypal-address',
                firstName: 'John',
                lastName: 'Doe',
                company: '',
                address1: 'Hello World Address',
                address2: '',
                city: 'Bellingham',
                stateOrProvince: 'WA',
                stateOrProvinceCode: 'WA',
                country: 'United States',
                countryCode: 'US',
                postalCode: '98225',
                phone: '',
                customFields: [],
            });
        });
    });

    describe('#getDeviceSessionId', () => {
        it('returns device session id', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.getDeviceSessionId();

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
        });

        it('returns device session id for fastlane', async () => {
            await subject.initializeBraintreeAcceleratedCheckoutOrThrow(methodId);
            await subject.getDeviceSessionId();

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
        });
    });
});
