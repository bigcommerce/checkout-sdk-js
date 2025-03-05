import { createRequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import {
    CardInstrument,
    InvalidArgumentError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    getGuestCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
    PayPalCommerceFastlaneUtils,
    PayPalCommerceSdk,
    PayPalFastlane,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import PayPalCommerceFastlanePaymentStrategy from './paypal-commerce-fastlane-payment-strategy';

describe('PayPalCommerceFastlanePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let paypalFastlane: PayPalFastlane;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils;
    let strategy: PayPalCommerceFastlanePaymentStrategy;

    const address = getBillingAddress();
    const cart = getCart();
    const guestCustomer = getGuestCustomer();
    const customer = getCustomer();
    const storeConfig = getConfig().storeConfig;

    const authenticationResultMock = getPayPalFastlaneAuthenticationResultMock();
    const customerContextId = 'id123';
    const paypalOrderId = 'paypalOrderId123';

    const methodId = 'paypalcommerceacceleratedcheckout';
    const initializationOptions = {
        methodId,
        paypalcommercefastlane: {
            onInit: jest.fn(),
            onChange: jest.fn(),
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

    const bcCardMock = {
        bigpayToken: 'nonce/token',
        brand: 'Visa',
        defaultInstrument: false,
        expiryMonth: '09',
        expiryYear: '2031',
        iin: '',
        last4: '2233',
        method: 'paypalcommerceacceleratedcheckout',
        provider: 'paypalcommerceacceleratedcheckout',
        trustedShippingAddress: false,
        type: card,
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
    };

    beforeEach(async () => {
        paypalFastlaneSdk = getPayPalFastlaneSdk();
        paypalFastlane = await paypalFastlaneSdk.Fastlane();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(createRequestSender());
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceFastlaneUtils = createPayPalCommerceFastlaneUtils();

        strategy = new PayPalCommerceFastlanePaymentStrategy(
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceSdk,
            paypalCommerceFastlaneUtils,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer');
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
            guestCustomer,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
            guestCustomer,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfig,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
            address,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            address,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getPaymentProviderCustomer',
        ).mockReturnValue({});

        jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
            Promise.resolve(paypalFastlaneSdk),
        );

        jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockResolvedValue({
            orderId: paypalOrderId,
            approveUrl: 'url.com',
        });

        jest.spyOn(paypalCommerceFastlaneUtils, 'getPayPalFastlaneOrThrow').mockReturnValue(
            paypalFastlane,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(cart.id);
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockResolvedValue({
            customerContextId,
        });
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockResolvedValue(getPayPalFastlaneAuthenticationResultMock());
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'mapPayPalFastlaneProfileToBcCustomerData',
        ).mockReturnValue({
            authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
            addresses: [],
            instruments: [],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            try {
                await strategy.initialize({ methodId: '' });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercefastlane is not provided', async () => {
            try {
                await strategy.initialize({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercefastlane.onInit is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    paypalcommercefastlane: {},
                };

                await strategy.initialize(options);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommercefastlane.onChange is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    paypalcommercefastlane: {
                        onInit: jest.fn(),
                    },
                };

                await strategy.initialize(options);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
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

        it('loads payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('loads paypal fastlane sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );
        });

        it('initializes paypal fastlane in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                false,
                {},
            );
        });

        it('initializes paypal fastlane in test mode', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                true,
                {},
            );
        });

        it('does not trigger lookup method if the customer already authenticated with PayPal Fastlane', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [],
                instruments: [],
            });

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method for store members', async () => {
            const storeMember = getCustomer();

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                storeMember,
            );

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method if authentication flow did not trigger in the same session before page refresh', async () => {
            jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                'another_session_id_123',
            );

            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('successfully authenticates customer with PayPal Fastlane', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );
            expect(
                paypalCommerceFastlaneUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                false,
                cart.id,
            );
        });

        it('initialises PayPal Fastlane card component', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalFastlane.FastlaneCardComponent).toHaveBeenCalledWith({
                fields: {
                    cardholderName: {
                        enabled: true,
                        prefill: 'Test Tester',
                    },
                    phoneNumber: {
                        prefill: address.phone,
                    },
                },
            });
        });

        it('provides callback function to be able to use them on ui', async () => {
            await strategy.initialize(initializationOptions);

            expect(initializationOptions.paypalcommercefastlane.onInit).toHaveBeenCalled();
            expect(initializationOptions.paypalcommercefastlane.onChange).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        const mockedInstrumentId = 'mockInstrumentId123';

        const executeOptions = {
            payment: {
                methodId,
            },
        };

        const executeOptionsWithVaulting = {
            payment: {
                methodId,
                paymentData: {
                    instrumentId: mockedInstrumentId,
                },
            },
        };

        it('throws an error if payment option is not provided', async () => {
            try {
                await strategy.execute({ payment: undefined });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('successfully places order with credit card flow', async () => {
            const fastlaneToken = 'paypal_fastlane_instrument_id_nonce';

            await strategy.initialize(initializationOptions);
            await strategy.execute(executeOptions);

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                cartId: cart.id,
                fastlaneToken,
            });

            const paypalFastlaneComponent = await paypalFastlane.FastlaneCardComponent({});

            expect(paypalFastlaneComponent.getPaymentToken).toHaveBeenCalledWith({
                billingAddress: {
                    addressLine1: address.address1,
                    addressLine2: address.address2,
                    adminArea1: address.stateOrProvinceCode,
                    adminArea2: address.city,
                    company: address.company,
                    countryCode: address.countryCode,
                    postalCode: address.postalCode,
                },
                name: {
                    fullName: `${address.firstName} ${address.lastName}`,
                },
            });
            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    formattedPayload: {
                        paypal_fastlane_token: {
                            order_id: paypalOrderId,
                            token: fastlaneToken,
                        },
                    },
                },
            });
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(true);
        });

        it('successfully places order with vaulted instruments flow', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.execute(executeOptionsWithVaulting);

            expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                cartId: cart.id,
                fastlaneToken: mockedInstrumentId,
            });

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    formattedPayload: {
                        paypal_fastlane_token: {
                            order_id: paypalOrderId,
                            token: mockedInstrumentId,
                        },
                    },
                },
            });
            expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(true);
        });

        it('do not create an order if there is an error while receiving a payment order', async () => {
            await strategy.initialize(initializationOptions);

            const paypalFastlaneComponent = await paypalFastlane.FastlaneCardComponent({});

            jest.spyOn(paypalFastlaneComponent, 'getPaymentToken').mockRejectedValue(
                new Error('input data error'),
            );

            try {
                await strategy.execute(executeOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(paypalCommerceRequestSender.createOrder).not.toHaveBeenCalled();
            }
        });
    });

    describe('#onInit option callback', () => {
        it('throws an error if container is not provided', async () => {
            let onInitCallback = noop;

            const onInitImplementation = (renderComponentCallback: (container: string) => void) => {
                onInitCallback = renderComponentCallback;
            };

            await strategy.initialize({
                methodId,
                paypalcommercefastlane: {
                    onInit: jest.fn(onInitImplementation),
                    onChange: jest.fn(),
                },
            });

            try {
                onInitCallback();
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('renders paypal fastlane credit card component', async () => {
            const containerId = 'containerIdMock';
            let onInitCallback: (container: string) => void = noop;

            const onInitImplementation = (renderComponentCallback: (container: string) => void) => {
                onInitCallback = renderComponentCallback;
            };

            await strategy.initialize({
                methodId,
                paypalcommercefastlane: {
                    onInit: jest.fn(onInitImplementation),
                    onChange: jest.fn(),
                },
            });

            onInitCallback(containerId);

            const paypalFastlaneComponent = await paypalFastlane.FastlaneCardComponent({});

            expect(paypalFastlaneComponent.render).toHaveBeenCalledWith(containerId);
        });
    });

    describe('#onChange option callback', () => {
        it('returns selected card instrument', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcCardMock],
            });

            jest.spyOn(paypalFastlane.profile, 'showCardSelector').mockResolvedValue({
                selectionChanged: true,
                selectedCard: {
                    id: 'nonce/token',
                    paymentSource: {
                        card: {
                            brand: 'Visa',
                            expiry: '2030-12',
                            lastDigits: '1111',
                            name: 'John Doe',
                            billingAddress: {
                                addressLine1: 'addressLine1',
                                adminArea1: 'adminArea1',
                                adminArea2: 'adminArea2',
                                postalCode: '03004',
                                countryCode: 'US',
                            },
                        },
                    },
                },
            });

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showPayPalCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showPayPalCardSelector;
            };

            await strategy.initialize({
                methodId,
                paypalcommercefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            const paypalToBcInstrument = {
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
                untrustedShippingCardVerificationMode: 'pan',
            };

            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [paypalToBcInstrument],
            });

            expect(result).toEqual(paypalToBcInstrument);
        });

        it('returns undefined if the customer selects the same instrument or closes a popup window', async () => {
            jest.spyOn(paypalFastlane.profile, 'showCardSelector').mockResolvedValue({
                selectionChanged: false,
                selectedCard: {
                    id: 'nonce/token',
                    paymentSource: {
                        card: {
                            brand: 'Visa',
                            expiry: '2030-12',
                            lastDigits: '1111',
                            name: 'John Doe',
                            billingAddress: {
                                addressLine1: 'addressLine1',
                                adminArea1: 'adminArea1',
                                adminArea2: 'adminArea2',
                                postalCode: '03004',
                                countryCode: 'US',
                            },
                        },
                    },
                },
            });

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showPayPalCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showPayPalCardSelector;
            };

            await strategy.initialize({
                methodId,
                paypalcommercefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            expect(result).toBeUndefined();
        });
    });
});
