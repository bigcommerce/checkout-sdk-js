import { getScriptLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';
import { EventEmitter } from 'events';

import {
    Braintree3DSVerifyCardCallback,
    BraintreeFastlane,
    BraintreeFastlaneAuthenticationState,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeThreeDSecure,
    BraintreeThreeDSecureOptions,
    getBraintree,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CardInstrument,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    UntrustedShippingCardVerificationType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    getGuestCustomer,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeFastlanePaymentStrategy from './braintree-fastlane-payment-strategy';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';
import { getThreeDSecureMock } from '../mocks/braintree.mock';

describe('BraintreeFastlanePaymentStrategy', () => {
    let braintreeFastlaneUtils: BraintreeFastlaneUtils;
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeFastlanePaymentStrategy;
    let braintreeSdk: BraintreeSdk;
    let threeDSecure: BraintreeThreeDSecure;
    let eventEmitter: EventEmitter;

    const methodId = 'braintreeacceleratedcheckout';
    const deviceSessionId = 'device_session_id_mock';
    const instrumentId = 'asd123';

    const cart = getCart();
    const customer = getGuestCustomer();
    const billingAddress = getBillingAddress();
    const shippingAddress = getShippingAddress();
    const storeConfig = getConfig().storeConfig;
    const paymentMethod = {
        ...getBraintree(),
        id: methodId,
    };
    const selectedInstrumentMock = {
        id: 'nonce/token',
        paymentSource: {
            card: {
                brand: 'Visa',
                expiry: '2030-12',
                lastDigits: '1111',
                name: 'John Doe',
                billingAddress: {
                    company: 'BigCommerce',
                    streetAddress: 'addressLine1',
                    locality: 'addressCity',
                    region: 'addressState',
                    postalCode: '03004',
                    countryCodeAlpha2: 'US',
                    extendedAddress: 'addressLine2',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            },
        },
    };

    const renderMethodMock = jest.fn();
    const getFastlaneCardComponent = (id: string) => () => {
        const fastlaneCardComponent = () => {
            return fastlaneCardComponent;
        };

        fastlaneCardComponent.getPaymentToken = () => {
            return Promise.resolve({
                id,
                paymentSource: selectedInstrumentMock.paymentSource,
            });
        };

        fastlaneCardComponent.render = renderMethodMock;

        return Promise.resolve(fastlaneCardComponent);
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

    const defaultInitializationOptions = {
        methodId,
        braintreefastlane: {
            onInit: jest.fn(),
            onChange: jest.fn(),
        },
    };

    const executeOptions = {
        payment: {
            methodId,
            paymentData: {},
        },
    };

    const executeOptionsWithVaultedInstrument = {
        payment: {
            methodId,
            paymentData: {
                instrumentId,
            },
        },
    };

    beforeEach(() => {
        braintreeFastlaneMock = getFastlaneMock();
        threeDSecure = getThreeDSecureMock();
        eventEmitter = new EventEmitter();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        browserStorage = new BrowserStorage('paypalFastlane');
        braintreeFastlaneUtils = new BraintreeFastlaneUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        strategy = new BraintreeFastlanePaymentStrategy(
            paymentIntegrationService,
            braintreeFastlaneUtils,
            browserStorage,
            braintreeSdk,
        );

        jest.spyOn(browserStorage, 'getItem');
        jest.spyOn(browserStorage, 'setItem');
        jest.spyOn(browserStorage, 'removeItem');

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer');
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
        jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
            customer,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfigOrThrow').mockReturnValue(
            storeConfig,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getBillingAddressOrThrow',
        ).mockReturnValue(billingAddress);
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            shippingAddress,
        );
        jest.spyOn(
            paymentIntegrationService.getState(),
            'getPaymentProviderCustomerOrThrow',
        ).mockImplementation(jest.fn());

        jest.spyOn(braintreeFastlaneUtils, 'initializeBraintreeFastlaneOrThrow').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(braintreeFastlaneUtils, 'runPayPalAuthenticationFlowOrThrow').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(
            braintreeFastlaneUtils,
            'getBraintreeFastlaneComponentOrThrow',
        ).mockImplementation(() => braintreeFastlaneMock.FastlaneCardComponent);
        jest.spyOn(braintreeFastlaneUtils, 'getDeviceSessionId').mockResolvedValue(deviceSessionId);
        jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(
            getFastlaneCardComponent('nonce'),
        );
        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecure);
        jest.spyOn(threeDSecure, 'on').mockImplementation((options) => {
            eventEmitter.on('on', (cancelCallback) => {
                if (options === 'customer-canceled') {
                    cancelCallback();
                }
            });
        });
        jest.spyOn(threeDSecure, 'verifyCard').mockImplementation(
            (options: BraintreeThreeDSecureOptions, callback?: Braintree3DSVerifyCardCallback) => {
                eventEmitter.on('onLookupComplete', (nextCallback) => {
                    if (typeof options.onLookupComplete === 'function') {
                        options.onLookupComplete(
                            {
                                lookup: {
                                    threeDSecureVersion: '2',
                                },
                                paymentMethod: {
                                    nonce: 'nonce',
                                    details: {
                                        cardType: '',
                                        lastFour: '',
                                        lastTwo: '',
                                    },
                                    description: '',
                                    liabilityShiftPossible: false,
                                    liabilityShifted: false,
                                },
                                requiresUserAuthentication: true,
                                threeDSecureInfo: {
                                    liabilityShiftPossible: true,
                                    liabilityShifted: true,
                                },
                            },
                            nextCallback,
                        );
                    }
                });

                if (callback) {
                    callback({ code: '' }, { nonce: 'fastlane_token_mock' });
                }

                return Promise.resolve({
                    nonce: 'nonce',
                    details: {
                        cardType: '',
                        lastFour: '',
                        lastTwo: '',
                    },
                    description: '',
                    liabilityShiftPossible: false,
                    liabilityShifted: false,
                });
            },
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            const options = {} as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if fastlane enabled and onChange callback is not provided', async () => {
            const options = {
                ...defaultInitializationOptions,
                braintreefastlane: {
                    onInit: jest.fn(),
                },
            };

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if option.braintreefastlane is not provided', async () => {
            const options = {
                methodId,
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if option.braintreefastlane.container is not provided', async () => {
            const options = {
                methodId,
                braintreefastlane: {},
            } as PaymentInitializeOptions;

            try {
                await strategy.initialize(options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('should intialize braintreeSdk', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        'PROJECT-7080.braintree_fastlane_three_ds': true,
                    },
                },
            });
            await strategy.initialize(defaultInitializationOptions);

            expect(braintreeSdk.initialize).toHaveBeenCalled();
        });

        it('gets PayPal Fastlane component', async () => {
            jest.spyOn(browserStorage, 'getItem').mockReturnValue(cart.id);
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            await strategy.initialize(defaultInitializationOptions);

            expect(braintreeFastlaneUtils.getBraintreeFastlaneComponentOrThrow).toHaveBeenCalled();
        });

        it('should not authenticate user if OTP was triggered before', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
            });

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('should not authenticate user if OTP was canceled before', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.CANCELED,
            });

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('should not trigger authentication flow if the user was authenticated in current session', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(browserStorage, 'getItem').mockReturnValue('');

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method for store members', async () => {
            const storeMember = getCustomer();

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                storeMember,
            );

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('triggers fastlane authentication flow', async () => {
            jest.spyOn(browserStorage, 'getItem').mockReturnValue(cart.id);
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            await strategy.initialize(defaultInitializationOptions);

            expect(braintreeFastlaneUtils.runPayPalAuthenticationFlowOrThrow).toHaveBeenCalled();
        });
    });

    describe('#renderBraintreeCardComponent', () => {
        let container: HTMLElement;
        let callback: (containerId: string) => void = noop;

        const initializationOptions = {
            methodId,
            braintreefastlane: {
                onInit: (renderComponent: (containerId: string) => void) => {
                    callback = renderComponent;
                },
                onChange: jest.fn(),
            },
        };

        beforeEach(() => {
            container = document.createElement('div');
            container.id = 'pp-connect-container-id';
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('throws an error if container id is not provided (or it has a falsy value) in callback call', async () => {
            await strategy.initialize(initializationOptions);

            try {
                callback('');
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('initializes braintree fastlane', async () => {
            await strategy.initialize(initializationOptions);

            callback(container.id);

            expect(braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow).toHaveBeenCalledWith(
                methodId,
                undefined,
            );
        });

        it('initializes braintree fastlane with correct styles', async () => {
            const newInitializationOptions = {
                methodId,
                braintreefastlane: {
                    onInit: (renderComponent: (containerId: string) => void) => {
                        callback = renderComponent;
                    },
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

            callback(container.id);

            expect(braintreeFastlaneUtils.initializeBraintreeFastlaneOrThrow).toHaveBeenCalledWith(
                methodId,
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

        it('renders braintree card component', async () => {
            container.id = 'pp-fastlane-container-id';

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(
                getFastlaneCardComponent('nonce'),
            );

            await strategy.initialize(initializationOptions);

            if (container.id) {
                callback(container.id);
            }

            expect(renderMethodMock).toHaveBeenCalledWith(container.id);
        });

        it('renders braintree card component with prefilled cardholder name', async () => {
            const fastlaneCardOptionsMock = {
                fields: {
                    cardholderName: {
                        enabled: true,
                        prefill: 'Test Tester',
                    },
                    phoneNumber: {
                        prefill: '555-555-5555',
                    },
                },
                styles: {},
            };

            container.id = 'pp-fastlane-container-id';

            await strategy.initialize(initializationOptions);

            expect(braintreeFastlaneMock.FastlaneCardComponent).toHaveBeenCalledWith(
                fastlaneCardOptionsMock,
            );
        });
    });

    describe('#execute()', () => {
        it('throws an error is payment is not provided', async () => {
            await strategy.initialize(defaultInitializationOptions);

            try {
                await strategy.execute({});
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentArgumentInvalidError);
            }
        });

        it('submits payment and order with prepared data', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    nonce: 'nonce',
                },
            });
        });

        it('submits payment and order with stored instrument data', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        'PROJECT-7080.braintree_fastlane_three_ds': true,
                    },
                },
            });
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    nonce: 'nonce',
                },
            });
        });
    });

    describe('#preparePaymentPayload()', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getStoreConfigOrThrow',
            ).mockReturnValue({
                ...storeConfig,
                checkoutSettings: {
                    ...storeConfig.checkoutSettings,
                    features: {
                        'PROJECT-7080.braintree_fastlane_three_ds': true,
                    },
                },
            });
        });

        it('collects an tokenizes data from braintree fastlane card component (customer without fastlane account)', async () => {
            const tokenizationNonceMock = 'fastlane_token_mock';
            const tokenizeMethodMock = jest.fn().mockResolvedValue({
                id: tokenizationNonceMock,
                paymentSource: selectedInstrumentMock.paymentSource,
            });

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => {
                const fastlaneCardComponent = () => {
                    return fastlaneCardComponent;
                };

                fastlaneCardComponent.getPaymentToken = tokenizeMethodMock;

                fastlaneCardComponent.render = renderMethodMock;

                return Promise.resolve(fastlaneCardComponent);
            });

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(tokenizeMethodMock).toHaveBeenCalledWith({
                billingAddress: {
                    streetAddress: '12345 Testing Way',
                    locality: 'Some City',
                    region: 'CA',
                    postalCode: '95555',
                    countryCodeAlpha2: 'US',
                },
                name: {
                    fullName: 'Test Tester',
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    deviceSessionId,
                    nonce: tokenizationNonceMock,
                },
            });
        });

        it('set region field with stateOrProvince value if stateOrProvinceCode is empty', async () => {
            const tokenizationNonceMock = 'fastlane_token_mock';
            const billingAddressMock = {
                id: '55c96cda6f04c',
                firstName: 'Test',
                lastName: 'Tester',
                email: 'test@bigcommerce.com',
                company: 'Bigcommerce',
                address1: '12345 Testing Way',
                address2: '',
                city: 'Bangkok',
                stateOrProvince: 'Bangkok',
                stateOrProvinceCode: '',
                country: 'Thailand',
                countryCode: 'TH',
                postalCode: '10100',
                shouldSaveAddress: true,
                phone: '555-555-5555',
                customFields: [],
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getBillingAddressOrThrow',
            ).mockReturnValue(billingAddressMock);

            const tokenizeMethodMock = jest.fn().mockResolvedValue({
                id: tokenizationNonceMock,
                paymentSource: selectedInstrumentMock.paymentSource,
            });

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => {
                const fastlaneCardComponent = () => {
                    return fastlaneCardComponent;
                };

                fastlaneCardComponent.getPaymentToken = tokenizeMethodMock;

                fastlaneCardComponent.render = renderMethodMock;

                return Promise.resolve(fastlaneCardComponent);
            });

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(tokenizeMethodMock).toHaveBeenCalledWith({
                billingAddress: {
                    streetAddress: '12345 Testing Way',
                    locality: 'Bangkok',
                    region: 'Bangkok',
                    postalCode: '10100',
                    countryCodeAlpha2: 'TH',
                },
                name: {
                    fullName: 'Test Tester',
                },
            });

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId,
                paymentData: {
                    deviceSessionId,
                    nonce: tokenizationNonceMock,
                },
            });
        });

        it('places order with braintree fastlane using fastlane vaulted instrument for customers with fastlane account', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                    isFastlaneEnabled: true,
                },
            };
            paymentMethod.config.is3dsEnabled = false;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockImplementation(() => ({
                authenticationState: 'succeeded',
                addresses: [],
                instruments: [
                    {
                        brand: 'visa',
                        expiryMonth: '12',
                        expiryYear: '33',
                        iin: '411111',
                        last4: '1111',
                        type: 'card',
                        bigpayToken: instrumentId,
                        defaultInstrument: false,
                        provider: methodId,
                        trustedShippingAddress: false,
                        method: methodId,
                        untrustedShippingCardVerificationMode:
                            UntrustedShippingCardVerificationType.CVV,
                    },
                ],
            }));

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptionsWithVaultedInstrument);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    formattedPayload: {
                        paypal_fastlane_token: {
                            token: instrumentId,
                        },
                    },
                },
            });
        });

        it('verifies card', async () => {
            jest.spyOn(threeDSecure, 'verifyCard');
            jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecure);
            paymentMethod.config.is3dsEnabled = true;
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(threeDSecure.verifyCard).toHaveBeenCalled();
        });

        it('verifies card for fastlane guest', async () => {
            const guestNonce = 'guest_nonce';
            const tokenizeMethodMock = jest.fn().mockResolvedValue({
                id: guestNonce,
                paymentSource: {
                    ...selectedInstrumentMock.paymentSource,
                    card: {
                        ...selectedInstrumentMock.paymentSource.card,
                        binDetails: {
                            bin: 'guest_bin',
                        },
                    },
                },
            });

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => {
                const fastlaneCardComponent = () => {
                    return fastlaneCardComponent;
                };

                fastlaneCardComponent.getPaymentToken = tokenizeMethodMock;

                fastlaneCardComponent.render = renderMethodMock;

                return Promise.resolve(fastlaneCardComponent);
            });
            jest.spyOn(threeDSecure, 'verifyCard');
            jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecure);
            paymentMethod.config.is3dsEnabled = true;
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(threeDSecure.verifyCard).toHaveBeenCalledWith(
                {
                    amount: '190.00',
                    bin: 'guest_bin',
                    nonce: 'guest_nonce',
                    onLookupComplete: expect.any(Function),
                },
                expect.any(Function),
            );
        });

        it('verifies card for fastlane authorised user', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockImplementation(() => ({
                authenticationState: 'succeeded',
                addresses: [],
                instruments: [
                    {
                        brand: 'visa',
                        expiryMonth: '12',
                        expiryYear: '33',
                        iin: '411111',
                        last4: '1111',
                        bin: 'authorized_bin',
                        type: 'card',
                        bigpayToken: instrumentId,
                        defaultInstrument: false,
                        provider: methodId,
                        trustedShippingAddress: false,
                        method: methodId,
                        untrustedShippingCardVerificationMode:
                            UntrustedShippingCardVerificationType.CVV,
                    },
                ],
            }));
            jest.spyOn(threeDSecure, 'verifyCard');
            jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecure);
            paymentMethod.config.is3dsEnabled = true;
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(threeDSecure.verifyCard).toHaveBeenCalledWith(
                {
                    amount: '190.00',
                    bin: '411111',
                    nonce: instrumentId,
                    onLookupComplete: expect.any(Function),
                },
                expect.any(Function),
            );
        });

        it('retrieve 3DS instance', async () => {
            jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecure);
            paymentMethod.config.is3dsEnabled = true;
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(braintreeSdk.getBraintreeThreeDS).toHaveBeenCalled();
        });

        it('should reject with a PaymentMethodCancelledError if customer cancels', async () => {
            paymentMethod.config.is3dsEnabled = true;
            const threeDSecureMock = {
                ...threeDSecure,
                verifyCard: (_options, callback) => {
                    if (callback) {
                        callback(
                            { code: 'THREEDS_VERIFY_CARD_CANCELED_BY_MERCHANT' },
                            { nonce: 'fastlane_token_mock' },
                        );
                    }

                    return Promise.resolve('fastlane_token_mock');
                },
            };
            jest.spyOn(braintreeSdk, 'getBraintreeThreeDS').mockResolvedValue(threeDSecureMock);
            const onErrorMock = jest.fn();
            await strategy.initialize({
                methodId,
                braintreefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(),
                    onError: onErrorMock,
                },
            });

            try {
                await strategy.execute(executeOptions);
            } catch (e) {
                expect(onErrorMock).toHaveBeenCalled();
            }
        });

        it('calls next callback', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            const next = jest.fn();
            eventEmitter.emit('onLookupComplete', next);

            expect(next).toHaveBeenCalled();
        });

        it('calls on customer cancel', async () => {
            paymentMethod.config.is3dsEnabled = true;

            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            const next = jest.fn();
            const cancelCallback = jest.fn();
            eventEmitter.emit('onLookupComplete', next);
            eventEmitter.emit('on', cancelCallback);

            expect(cancelCallback).toHaveBeenCalled();
        });
    });

    describe('#onChange option callback', () => {
        beforeEach(() => {
            jest.spyOn(braintreeFastlaneUtils, 'mapPayPalToBcInstrument');
            jest.spyOn(braintreeFastlaneUtils, 'getBraintreeFastlaneOrThrow').mockReturnValue(
                braintreeFastlaneMock,
            );
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [bcCardMock],
            });

            jest.spyOn(braintreeFastlaneMock.profile, 'showCardSelector').mockImplementation(() =>
                Promise.resolve({
                    selectionChanged: true,
                    selectedCard: selectedInstrumentMock,
                }),
            );
        });

        it('returns selected card instrument', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showCardSelector;
            };

            await strategy.initialize({
                methodId,
                braintreefastlane: {
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
                method: 'braintreeacceleratedcheckout',
                provider: 'braintreeacceleratedcheckout',
                trustedShippingAddress: false,
                type: 'card',
                untrustedShippingCardVerificationMode: 'pan',
            };

            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith({
                authenticationState: BraintreeFastlaneAuthenticationState.SUCCEEDED,
                addresses: [bcAddressMock],
                instruments: [paypalToBcInstrument],
            });

            expect(result).toEqual(paypalToBcInstrument);
        });

        it('returns undefined if the customer selects the same instrument or closes a popup window', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;
            jest.spyOn(braintreeFastlaneMock.profile, 'showCardSelector').mockImplementation(() =>
                Promise.resolve({
                    selectionChanged: false,
                    selectedCard: selectedInstrumentMock,
                }),
            );

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showPayPalCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showPayPalCardSelector;
            };

            await strategy.initialize({
                methodId,
                braintreefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            expect(result).toBeUndefined();
        });

        it('calls mapPayPalToBcInstrument', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showCardSelector;
            };

            await strategy.initialize({
                methodId,
                braintreefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            await onChangeCallback();

            expect(braintreeFastlaneUtils.mapPayPalToBcInstrument).toHaveBeenCalled();
            expect(braintreeFastlaneUtils.mapPayPalToBcInstrument).toHaveBeenCalledWith(
                'braintreeacceleratedcheckout',
                [selectedInstrumentMock],
            );
        });

        it('does not update payment provider customer if selected instruments exist', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;
            jest.spyOn(braintreeFastlaneUtils, 'mapPayPalToBcInstrument').mockReturnValue(
                undefined,
            );

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showCardSelector;
            };

            await strategy.initialize({
                methodId,
                braintreefastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            await onChangeCallback();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
