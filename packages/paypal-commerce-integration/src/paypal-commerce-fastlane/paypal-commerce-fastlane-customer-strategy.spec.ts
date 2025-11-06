import {
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
    UntrustedShippingCardVerificationType,
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
    createPayPalFastlaneUtils,
    createPayPalSdkScriptLoader,
    getPayPalAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneSdk,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
    PayPalFastlaneUtils,
    PayPalSdkScriptLoader,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceFastlaneCustomerStrategy from './paypal-commerce-fastlane-customer-strategy';

describe('PayPalCommerceFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalCommerceFastlaneUtils: PayPalFastlaneUtils;
    let paypalSdkScriptLoader: PayPalSdkScriptLoader;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let strategy: PayPalCommerceFastlaneCustomerStrategy;

    const cart = getCart();
    const guestCustomer = getGuestCustomer();
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
            phoneNumber: {
                countryCode: '012',
                nationalNumber: '123123',
            },
            shippingAddress: {
                phoneNumber: {
                    countryCode: '012',
                    nationalNumber: '123123',
                },
                name: {
                    fullName: 'John Doe',
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: '555555555',
                },
                address: {
                    company: 'BigCommerce',
                    addressLine1: 'addressLine1',
                    addressLine2: 'addressLine2',
                    adminArea1: 'addressState',
                    adminArea2: 'addressCity',
                    postalCode: '03004',
                    countryCode: 'US',
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
                            addressLine1: 'addressLine1',
                            addressLine2: 'addressLine2',
                            locality: 'addressCity',
                            adminArea1: 'adminArea1',
                            adminArea2: 'adminArea2',
                            postalCode: '03004',
                            phoneNumber: '123123',
                            countryCodeAlpha2: 'US',
                        },
                    },
                },
            },
        },
    };

    const bcAddressMock = {
        id: 1,
        type: 'type',
        address1: 'addressLine1',
        address2: 'addressLine2',
        city: 'addressCity',
        company: 'BigCommerce',
        countryCode: 'US',
        country: 'US',
        customFields: [],
        firstName: 'John',
        lastName: 'Doe',
        phone: '333333333333',
        postalCode: '03004',
        stateOrProvince: 'addressState',
        stateOrProvinceCode: 'addressState',
    };

    const card = 'card' as const;

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
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.CVV,
        trustedShippingAddress: false,
        type: card,
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
        paymentMethod = getPayPalAcceleratedCheckoutPaymentMethod();
        paypalFastlaneSdk = getPayPalFastlaneSdk();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalSdkScriptLoader = createPayPalSdkScriptLoader();
        paypalCommerceFastlaneUtils = createPayPalFastlaneUtils();

        strategy = new PayPalCommerceFastlaneCustomerStrategy(
            paymentIntegrationService,
            paypalSdkScriptLoader,
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
        jest.spyOn(state, 'getCustomer').mockReturnValue(guestCustomer);
        jest.spyOn(state, 'getCustomerOrThrow').mockReturnValue(guestCustomer);
        jest.spyOn(state, 'getConsignments').mockReturnValue(consignments);
        jest.spyOn(state, 'getBillingAddress').mockReturnValue(getBillingAddress());
        jest.spyOn(state, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);

        jest.spyOn(paypalSdkScriptLoader, 'getPayPalFastlaneSdk').mockImplementation(() =>
            Promise.resolve(paypalFastlaneSdk),
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockImplementation(() =>
            Promise.resolve({
                customerContextId: customerContextIdMock,
            }),
        );
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => Promise.resolve(authenticationResultMock));
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

        it('loads paypal sdk and initialises paypal fastlane in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkScriptLoader.getPayPalFastlaneSdk).toHaveBeenCalledWith(
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

            expect(paypalSdkScriptLoader.getPayPalFastlaneSdk).toHaveBeenCalledWith(
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

            jest.spyOn(paypalSdkScriptLoader, 'getPayPalFastlaneSdk').mockImplementation(() =>
                Promise.reject(),
            );

            await strategy.initialize(initializationOptions);

            expect(paypalSdkScriptLoader.getPayPalFastlaneSdk).toHaveBeenCalled();
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

        it('runs paypal fastlane authentication flow and updates customers data in checkout state', async () => {
            const paymentMethodWithShippingAutoselect = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isFastlaneShippingOptionAutoSelectEnabled: true,
                },
            };
            const state = paymentIntegrationService.getState();

            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
                Promise.resolve(paymentIntegrationService.getState()),
            );
            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodWithShippingAutoselect,
            );
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                guestCustomer.email,
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
                cart.id,
            );
        });

        it('calls continueWithCheckoutCallback callback in the end of execution flow', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });

        it('doesnt select shipping option when isFastlaneShippingOptionAutoSelectEnabled is false', async () => {
            const state = paymentIntegrationService.getState();
            const paymentMethodWithShippingAutoselect = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isEnableFastlaneShippingOptionAutoSelect: false,
                },
            };

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodWithShippingAutoselect,
            );

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.selectShippingOption).not.toHaveBeenCalled();
        });

        it('automatically selects shipping option when isFastlaneShippingOptionAutoSelectEnabled is true', async () => {
            const state = paymentIntegrationService.getState();
            const paymentMethodWithShippingAutoselect = {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    isFastlaneShippingOptionAutoSelectEnabled: true,
                },
            };

            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
                Promise.resolve(paymentIntegrationService.getState()),
            );
            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(
                paymentMethodWithShippingAutoselect,
            );
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
        });
    });
});
