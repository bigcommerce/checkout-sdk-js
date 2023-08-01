import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeConnect } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import {
    getBraintreeAcceleratedCheckoutPaymentMethod,
    getBraintreeConnectProfileDataMock,
    getConnectMock,
} from '../mocks/braintree.mock';

import BraintreeAcceleratedCheckoutCustomerStrategy from './braintree-accelerated-checkout-customer-strategy';

describe('BraintreeAcceleratedCheckoutCustomerStrategy', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeAcceleratedCheckoutCustomerStrategy;

    const customer = getCustomer();
    const billingAddress = getBillingAddress();
    const methodId = 'braintreeacceleratedcheckout';
    const paymentMethod = getBraintreeAcceleratedCheckoutPaymentMethod();

    const initializationOptions = { methodId };
    const executionOptions = {
        methodId,
        continueWithCheckoutCallback: jest.fn(),
    };

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        strategy = new BraintreeAcceleratedCheckoutCustomerStrategy(
            paymentIntegrationService,
            braintreeIntegrationService,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer').mockImplementation(
            jest.fn,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(customer);
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
            billingAddress,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getBraintreeConnect').mockImplementation(
            () => braintreeConnectMock,
        );

        jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({
            customerId: 'customerId',
        });
        jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
            authenticationState: 'succeeded',
            profileData: getBraintreeConnectProfileDataMock(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            try {
                await strategy.initialize({} as CustomerInitializeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if clientToken is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            try {
                await strategy.initialize(initializationOptions);
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
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service and loads braintree connect', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                paymentMethod.initializationData,
            );
            expect(braintreeIntegrationService.getBraintreeConnect).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('throws an error if methodId is not provided', async () => {
            await strategy.initialize(initializationOptions);

            try {
                await strategy.executePaymentMethodCheckout();
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if continueWithCheckoutCallback is not provided or it is not a function', async () => {
            await strategy.initialize(initializationOptions);

            try {
                await strategy.executePaymentMethodCheckout({ methodId });
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('calls continueWithCheckoutCallback callback', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });

    describe('#authenticatePayPalConnectUser()', () => {
        it('does not authenticate user if braintree connect is not loaded', async () => {
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('does not authenticate user if email is not defined', async () => {
            const customerWithoutEmail = { ...customer, email: undefined };
            const billingWithoutEmail = { ...billingAddress, email: undefined };

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                customerWithoutEmail,
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                billingWithoutEmail,
            );

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('checks if there is PP Connect account with customer email', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(braintreeConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalled();
        });

        it('does not authenticate user does not have PP Connect account', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('triggers PP Connect authentication flow if customer is detected as PP Connect user', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });

        it('successfully authenticate customer with PP Connect', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: 'succeeded',
                addresses: [
                    {
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
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
            });
        });

        it('does not authenticate customer if the authentication was canceled or failed', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: 'canceled',
                profileData: {},
            });

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: 'canceled',
                addresses: [],
                instruments: [],
            });
        });
    });

    describe('#deinitialize()', () => {
        it('teardowns braintree sdk creator on strategy deinitialize', async () => {
            braintreeIntegrationService.teardown = jest.fn();

            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreeIntegrationService.teardown).toHaveBeenCalled();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize(initializationOptions);
            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });

        it('authenticates the user with PayPal Connect after sign in', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.initialize(initializationOptions);
            await strategy.signIn(credentials);

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });
});
