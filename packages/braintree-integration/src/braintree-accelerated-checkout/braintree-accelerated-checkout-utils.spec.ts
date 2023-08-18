import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeConnect,
    BraintreeConnectAuthenticationState,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    getBraintreeConnectProfileDataMock,
    getConnectMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getCountries,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getBraintreeAcceleratedCheckoutPaymentMethod } from '../mocks/braintree.mock';

import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

describe('BraintreeAcceleratedCheckoutUtils', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let subject: BraintreeAcceleratedCheckoutUtils;

    const cart = getCart();
    const countries = getCountries();
    const customer = getCustomer();
    const billingAddress = getBillingAddress();
    const methodId = 'braintreeacceleratedcheckout';
    const paymentMethod = getBraintreeAcceleratedCheckoutPaymentMethod();

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        subject = new BraintreeAcceleratedCheckoutUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
        );

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

        jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({
            customerContextId: 'customerContextId',
        });
        jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
            authenticationState: BraintreeConnectAuthenticationState.SUCCEEDED,
            profileData: getBraintreeConnectProfileDataMock(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initializeBraintreeConnectOrThrow()', () => {
        it('throws an error if clientToken is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            try {
                await subject.initializeBraintreeConnectOrThrow(methodId);
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
                await subject.initializeBraintreeConnectOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service and loads braintree connect', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                paymentMethod.initializationData,
            );
            expect(braintreeIntegrationService.getBraintreeConnect).toHaveBeenCalled();
        });
    });

    describe('#runPayPalConnectAuthenticationFlowOrThrow()', () => {
        it('does not authenticate user if braintree connect is not loaded', async () => {
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('checks if there is PP Connect account with customer email', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalled();
        });

        it('does not authenticate user if the customer unrecognized in PP Connect', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: BraintreeConnectAuthenticationState.UNRECOGNIZED,
                addresses: [],
                instruments: [],
            });
        });

        it('triggers PP Connect authentication flow if customer is detected as PP Connect user', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });

        it('successfully authenticate customer with PP Connect', async () => {
            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeConnectAuthenticationState.SUCCEEDED,
                addresses: [
                    {
                        id: 123123,
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
                    },
                ],
            };

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('does not authenticate customer if the authentication was canceled or failed', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: BraintreeConnectAuthenticationState.CANCELED,
                profileData: {},
            });

            const updatePaymentProviderCustomerPayload = {
                authenticationState: BraintreeConnectAuthenticationState.CANCELED,
                addresses: [],
                instruments: [],
            };

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
        });

        it('preselects billing address with first paypal connect address', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith({
                id: 123123,
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

        it('preselects shipping address with first paypal connect address', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith({
                id: 123123,
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
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: BraintreeConnectAuthenticationState.SUCCEEDED,
                profileData: {
                    addresses: [],
                    instruments: [],
                },
            });

            await subject.initializeBraintreeConnectOrThrow(methodId);
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

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.runPayPalConnectAuthenticationFlowOrThrow();

            expect(paymentIntegrationService.updateShippingAddress).not.toHaveBeenCalled();
        });
    });

    describe('#getDeviceSessionId', () => {
        it('returns device session id', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.getDeviceSessionId();

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
        });
    });
});
