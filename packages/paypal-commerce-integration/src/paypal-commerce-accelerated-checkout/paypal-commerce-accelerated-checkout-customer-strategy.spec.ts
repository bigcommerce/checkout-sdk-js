import {
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    PayPalAxoSdk,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceAcceleratedCheckoutCustomerStrategy from './paypal-commerce-accelerated-checkout-customer-strategy';

describe('PayPalCommerceAcceleratedCheckoutCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalAxoSdk: PayPalAxoSdk;
    let strategy: PayPalCommerceAcceleratedCheckoutCustomerStrategy;

    const cart = getCart();
    const customer = getCustomer();

    const methodId = 'paypalcommerceacceleratedcheckout';
    const customerContextIdMock = 'customerId123';
    const authenticationResultMock = {
        authenticationState: PayPalCommerceConnectAuthenticationState.SUCCEEDED,
        profileData: {
            name: {
                fullName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            },
            shippingAddress: {
                name: {
                    fullName: 'John Doe',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                address: {
                    company: 'BigCommerce',
                    addressLine1: 'addressLine1',
                    addressLine2: 'addressLine2',
                    adminArea1: 'addressState',
                    adminArea2: 'addressCity',
                    postalCode: '03004',
                    countryCode: 'US',
                    phone: '555555555',
                },
            },
            card: {
                id: 'nonce/token',
                paymentSource: {
                    card: {
                        brand: 'Visa',
                        expiry: '2030-12',
                        lastDigits: '1111',
                        name: 'John Doe',
                        billingAddress: {
                            firstName: 'John',
                            lastName: 'Doe',
                            company: 'BigCommerce',
                            streetAddress: 'addressLine1',
                            extendedAddress: 'addressLine2',
                            locality: 'addressCity',
                            region: 'addressState',
                            postalCode: '03004',
                            countryCodeAlpha2: 'US',
                        },
                    },
                },
            },
        },
    };

    const bcAddressMock = {
        address1: 'addressLine1',
        address2: 'addressLine2',
        city: 'addressCity',
        company: 'BigCommerce',
        countryCode: 'US',
        customFields: [],
        firstName: 'John',
        lastName: 'Doe',
        phone: '333333333333',
        postalCode: '03004',
        stateOrProvince: 'addressState',
        stateOrProvinceCode: 'addressState',
    };

    const bcInstrumentMock = {
        bigpayToken: 'nonce/token',
        brand: 'Visa',
        defaultInstrument: false,
        expiryMonth: '12',
        expiryYear: '2030',
        iin: '',
        last4: '1111',
        method: 'paypalcommerceacceleratedcheckout',
        provider: 'paypalcommerceacceleratedcheckout',
        trustedShippingAddress: false,
        type: 'card',
    };

    const initializationOptions = {
        methodId,
        paypalcommerceacceleratedcheckout: {
            styles: {
                root: {
                    backgroundColorPrimary: 'white',
                },
            },
        },
    };

    const executionOptions = {
        methodId,
        continueWithCheckoutCallback: jest.fn(),
        checkoutPaymentMethodExecuted: jest.fn(),
    };

    beforeEach(() => {
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();
        paypalAxoSdk = getPayPalAxoSdk();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceAcceleratedCheckoutUtils = createPayPalCommerceAcceleratedCheckoutUtils();

        strategy = new PayPalCommerceAcceleratedCheckoutCustomerStrategy(
            paymentIntegrationService,
            paypalCommerceSdk,
            paypalCommerceAcceleratedCheckoutUtils,
        );

        const state = paymentIntegrationService.getState();

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer');
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress');
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress');
        jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);
        jest.spyOn(state, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(state, 'getCustomer').mockReturnValue(customer);
        jest.spyOn(state, 'getBillingAddress').mockReturnValue(getBillingAddress());

        jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() => paypalAxoSdk);

        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'initializePayPalConnect');
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'updateStorageSessionId');
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'lookupCustomerOrThrow',
        ).mockImplementation(() => ({
            customerContextId: customerContextIdMock,
        }));
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => authenticationResultMock);
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'mapPayPalConnectProfileToBcCustomerData',
        ).mockImplementation(() => ({
            authenticationState: PayPalCommerceConnectAuthenticationState.SUCCEEDED,
            addresses: [bcAddressMock],
            billingAddress: bcAddressMock,
            shippingAddress: bcAddressMock,
            instruments: [bcInstrumentMock],
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if method id is not provided', async () => {
            try {
                await strategy.initialize({ methodId: undefined });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('loads paypal commerce payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                'paypalcommerce',
            );
        });

        it('do nothing if accelerated checkout feature is disabled', async () => {
            paymentMethod.initializationData.isAcceleratedCheckoutEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            const result = await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('loads paypal sdk and initialises paypal connect in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );

            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(paypalAxoSdk, false);
        });

        it('loads paypal sdk and initialises paypal connect in test mode', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );

            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(paypalAxoSdk, true);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });

    describe('#signIn()', () => {
        it('calls default sign in method', async () => {
            const credentials = {
                email: 'test@test.com',
                password: '123',
            };

            await strategy.signIn(credentials);

            expect(paymentIntegrationService.signInCustomer).toHaveBeenCalledWith(
                credentials,
                undefined,
            );
        });
    });

    describe('#signOut()', () => {
        it('calls default sign out method', async () => {
            await strategy.signOut();

            expect(paymentIntegrationService.signOutCustomer).toHaveBeenCalled();
        });
    });

    describe('#executePaymentMethodCheckout()', () => {
        it('throws an error if methodId is not provided', async () => {
            try {
                await strategy.executePaymentMethodCheckout();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if continueWithCheckoutCallback is not a function or if its not provided', async () => {
            try {
                await strategy.executePaymentMethodCheckout({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('does not run authentication flow if accelerated feature is disabled', async () => {
            paymentMethod.initializationData.isAcceleratedCheckoutEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalled();
            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('loads payment method to get related data', async () => {
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('triggers checkoutPaymentMethodExecuted if it is provided', async () => {
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.checkoutPaymentMethodExecuted).toHaveBeenCalled();
        });

        it('does not call checkoutPaymentMethodExecuted if it is not provided', async () => {
            await strategy.executePaymentMethodCheckout({
                ...executionOptions,
                checkoutPaymentMethodExecuted: undefined,
            });

            expect(executionOptions.checkoutPaymentMethodExecuted).not.toHaveBeenCalled();
        });

        it('does not call paypal connect lookup method if it should not been called for customer due to A/B testing', async () => {
            paymentMethod.initializationData.shouldRunAcceleratedCheckout = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('runs paypal connect authentication flow and updates customers data in checkout state', async () => {
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).toHaveBeenCalledWith(customer.email);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextIdMock, undefined);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: authenticationResultMock.authenticationState,
                addresses: [bcAddressMock],
                instruments: [bcInstrumentMock],
            });
            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                bcAddressMock,
            );
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                bcAddressMock,
            );
            expect(
                paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId,
            ).toHaveBeenCalledWith(false, cart.id);
        });

        it('calls continueWithCheckoutCallback callback in the end of execution flow', async () => {
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });
});
