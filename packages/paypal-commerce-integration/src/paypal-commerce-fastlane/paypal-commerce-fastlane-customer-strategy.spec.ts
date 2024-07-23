import {
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getConsignment,
    getCustomer,
    getGuestCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneSdk,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceFastlaneCustomerStrategy from './paypal-commerce-fastlane-customer-strategy';

describe('PayPalCommerceFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let strategy: PayPalCommerceFastlaneCustomerStrategy;

    const cart = getCart();
    const customer = getGuestCustomer();
    const consignments = [getConsignment()];
    const storeConfig = getConfig().storeConfig;

    const methodId = 'paypalcommerceacceleratedcheckout';
    const secondaryMethodId = 'paypalcommercecreditcards';
    const customerContextIdMock = 'customerId123';
    const authenticationResultMock = {
        authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
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
        paypalcommercefastlane: {
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
        paypalFastlaneSdk = getPayPalFastlaneSdk();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceFastlaneUtils = createPayPalCommerceFastlaneUtils();

        strategy = new PayPalCommerceFastlaneCustomerStrategy(
            paymentIntegrationService,
            paypalCommerceSdk,
            paypalCommerceFastlaneUtils,
        );

        const state = paymentIntegrationService.getState();

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer');
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress');
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress');
        jest.spyOn(paymentIntegrationService, 'selectShippingOption');
        jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);
        jest.spyOn(state, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(state, 'getCustomer').mockReturnValue(customer);
        jest.spyOn(state, 'getCustomerOrThrow').mockReturnValue(customer);
        jest.spyOn(state, 'getConsignments').mockReturnValue(consignments);
        jest.spyOn(state, 'getBillingAddress').mockReturnValue(getBillingAddress());
        jest.spyOn(state, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);

        jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(
            () => paypalFastlaneSdk,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockImplementation(() => ({
            customerContextId: customerContextIdMock,
        }));
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => authenticationResultMock);
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'mapPayPalFastlaneProfileToBcCustomerData',
        ).mockImplementation(() => ({
            authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
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

        it('loads paypal commerce accelerated checkout payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal commerce credit cards payment method on trigger strategy for not know control/test group', async () => {
            await strategy.initialize({
                ...initializationOptions,
                methodId: secondaryMethodId,
            });

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                secondaryMethodId,
            );
        });

        it('initializes paypal fastlane with correct styles', async () => {
            const newInitializationOptions = {
                methodId,
                paypalcommercefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(),
                    styles: {
                        root: {
                            backgroundColorPrimary: 'green',
                            errorColor: 'orange',
                        },
                        input: {
                            borderRadius: '5px',
                        },
                    },
                },
            };

            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                    isFastlaneEnabled: true,
                    isFastlaneStylingEnabled: true,
                    fastlaneStyles: {
                        fastlaneRootSettingsBackgroundColor: 'red',
                        fastlaneBrandingSettings: 'branding',
                    },
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            await strategy.initialize(newInitializationOptions);

            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
                {
                    root: {
                        backgroundColorPrimary: 'red',
                        errorColor: 'orange',
                    },
                    input: {
                        borderRadius: '5px',
                    },
                    branding: 'branding',
                },
            );
        });

        it('loads primary payment method if the secondary payment method load throws an error', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementationOnce(
                () => {
                    throw new Error();
                },
            );

            await strategy.initialize({
                ...initializationOptions,
                methodId: secondaryMethodId,
            });

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                secondaryMethodId,
            );
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads secondary payment method if the primary payment method load throws an error', async () => {
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockImplementationOnce(
                () => {
                    throw new Error();
                },
            );

            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                secondaryMethodId,
            );
        });

        it('does not load secondary payment method if primary payment method was loaded successfully', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
            expect(paymentIntegrationService.loadPaymentMethod).not.toHaveBeenCalledWith(
                secondaryMethodId,
            );
        });

        it('do nothing if accelerated checkout feature is disabled', async () => {
            paymentMethod.initializationData.isAcceleratedCheckoutEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            const result = await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalFastlaneSdk).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('loads paypal sdk and initialises paypal fastlane in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
                initializationOptions.paypalcommercefastlane.styles,
            );
        });

        it('loads paypal sdk and initialises paypal fastlane in test mode', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                true,
                initializationOptions.paypalcommercefastlane.styles,
            );
        });

        it('does not throw anything if there is an error with Fastlane initialization', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;
            paymentMethod.initializationData.isFastlaneEnabled = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                Promise.reject(),
            );

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).not.toHaveBeenCalled();
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
            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not run authentication flow for store member', async () => {
            const storeMember = getCustomer();

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                storeMember,
            );

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('loads payment method to get related data', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('triggers checkoutPaymentMethodExecuted if it is provided', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.checkoutPaymentMethodExecuted).toHaveBeenCalled();
        });

        it('does not call checkoutPaymentMethodExecuted if it is not provided', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout({
                ...executionOptions,
                checkoutPaymentMethodExecuted: undefined,
            });

            expect(executionOptions.checkoutPaymentMethodExecuted).not.toHaveBeenCalled();
        });

        it('does not call paypal fastlane lookup method if it should not been called for customer due to A/B testing', async () => {
            paymentMethod.initializationData.shouldRunAcceleratedCheckout = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('runs paypal fastlane authentication flow and updates customers data in checkout state', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );

            expect(
                paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextIdMock);
            expect(
                paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
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
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                consignments[0]?.availableShippingOptions
                    ? consignments[0]?.availableShippingOptions[0].id
                    : undefined,
            );
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                false,
                cart.id,
            );
        });

        it('does not select shipping option for paypal fastlane authentication flow', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            const storeConfigWithAFeature = {
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-4142.disable_paypal_fastlane_one_click_experience': true,
                    },
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithAFeature);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.selectShippingOption).not.toHaveBeenCalled();
        });

        it('calls continueWithCheckoutCallback callback in the end of execution flow', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });
});
