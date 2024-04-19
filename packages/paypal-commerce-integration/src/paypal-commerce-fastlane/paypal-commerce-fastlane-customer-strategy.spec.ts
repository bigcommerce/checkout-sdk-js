import {
    InvalidArgumentError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneSdk,
    PayPalAxoSdk,
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
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let strategy: PayPalCommerceFastlaneCustomerStrategy;

    const cart = getCart();
    const customer = getCustomer();
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
        paypalAxoSdk = getPayPalAxoSdk();
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
        jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);
        jest.spyOn(state, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(state, 'getCustomer').mockReturnValue(customer);
        jest.spyOn(state, 'getCustomerOrThrow').mockReturnValue(customer);
        jest.spyOn(state, 'getBillingAddress').mockReturnValue(getBillingAddress());
        jest.spyOn(state, 'getStoreConfigOrThrow').mockReturnValue(storeConfig);

        jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() => paypalAxoSdk);
        jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(
            () => paypalFastlaneSdk,
        );

        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalConnect');
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceFastlaneUtils, 'connectLookupCustomerOrThrow').mockImplementation(
            () => ({
                customerContextId: customerContextIdMock,
            }),
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockImplementation(() => ({
            customerContextId: customerContextIdMock,
        }));
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'connectTriggerAuthenticationFlowOrThrow',
        ).mockImplementation(() => authenticationResultMock);
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

            expect(paypalCommerceSdk.getPayPalAxo).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        // TODO: this test should be removed after PP Fastlane experiment rollout to 100%
        it('loads paypal sdk and initialises paypal connect in production mode', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = false;

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            expect(paypalCommerceFastlaneUtils.initializePayPalConnect).toHaveBeenCalledWith(
                paypalAxoSdk,
                false,
                initializationOptions.paypalcommercefastlane.styles,
            );
        });

        // TODO: this test should be removed after PP Fastlane experiment rollout to 100%
        it('loads paypal sdk and initialises paypal connect in test mode', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;
            paymentMethod.initializationData.isFastlaneEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );

            expect(paypalCommerceFastlaneUtils.initializePayPalConnect).toHaveBeenCalledWith(
                paypalAxoSdk,
                true,
                initializationOptions.paypalcommercefastlane.styles,
            );
        });

        it('loads paypal sdk and initialises paypal fastlane in production mode', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

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
            paymentMethod.initializationData.isFastlaneEnabled = true;

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

        it('does not throw anything if there is an error with Connect initialization', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;
            paymentMethod.initializationData.isFastlaneEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() =>
                Promise.reject(),
            );

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalled();
            expect(paypalCommerceFastlaneUtils.initializePayPalConnect).not.toHaveBeenCalled();
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

        it('does not run authentication flow for store member if experiment is on', async () => {
            const guestCustomer = {
                ...getCustomer(),
                isGuest: false,
            };

            const storeConfigWithAFeature = {
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-4001.paypal_commerce_fastlane_stored_member_flow_removal': true,
                    },
                },
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                guestCustomer,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithAFeature);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('triggers authentication flow for guest member even if it is restricted for store member', async () => {
            const guestCustomer = {
                ...getCustomer(),
                isGuest: true,
            };

            const storeConfigWithAFeature = {
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        ...storeConfig.checkoutSettings.features,
                        'PAYPAL-4001.paypal_commerce_fastlane_stored_member_flow_removal': true,
                    },
                },
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                guestCustomer,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue(storeConfigWithAFeature);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow).toHaveBeenCalled();
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

        // TODO: this test should be removed after PP Fastlane experiment rollout to 100%
        it('does not call paypal connect lookup method if it should not been called for customer due to A/B testing', async () => {
            paymentMethod.initializationData.shouldRunAcceleratedCheckout = false;
            paymentMethod.initializationData.isFastlaneEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not call paypal fastlane lookup method if it should not been called for customer due to A/B testing', async () => {
            paymentMethod.initializationData.shouldRunAcceleratedCheckout = false;
            paymentMethod.initializationData.isFastlaneEnabled = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        // TODO: this test should be removed after PP Fastlane experiment rollout to 100%
        it('runs paypal connect authentication flow and updates customers data in checkout state', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = false;

            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );

            expect(
                paypalCommerceFastlaneUtils.connectTriggerAuthenticationFlowOrThrow,
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
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                false,
                cart.id,
            );
        });

        it('runs paypal fastlane authentication flow and updates customers data in checkout state', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

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
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                false,
                cart.id,
            );
        });

        it('calls continueWithCheckoutCallback callback in the end of execution flow', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.executePaymentMethodCheckout(executionOptions);

            expect(executionOptions.continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });
});
