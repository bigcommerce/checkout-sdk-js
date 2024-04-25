import { getScriptLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';

import {
    BraintreeConnect,
    BraintreeFastlane,
    BraintreeFastlaneAuthenticationState,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    getBraintree,
    getConnectMock,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CardInstrument,
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCart,
    getConfig,
    getCustomer,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import BraintreeFastlanePaymentStrategy from './braintree-fastlane-payment-strategy';
import BraintreeFastlaneUtils from './braintree-fastlane-utils';

describe('BraintreeFastlanePaymentStrategy', () => {
    let braintreeFastlaneUtils: BraintreeFastlaneUtils;
    let braintreeConnectMock: BraintreeConnect;
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeFastlanePaymentStrategy;

    const methodId = 'braintreeacceleratedcheckout';
    const deviceSessionId = 'device_session_id_mock';
    const instrumentId = 'asd123';

    const cart = getCart();
    const customer = getCustomer();
    const billingAddress = getBillingAddress();
    const shippingAddress = getShippingAddress();
    const storeConfig = getConfig().storeConfig;
    const paymentMethod = {
        ...getBraintree(),
        id: methodId,
        initializationData: {
            isFastlaneEnabled: false,
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

    const bcCardMock = {
        bigpayToken: 'nonce/token',
        brand: 'Visa',
        defaultInstrument: false,
        expiryMonth: '09',
        expiryYear: '2031',
        iin: '',
        last4: '2233',
        method: 'braintreeacceleratedcheckout',
        provider: 'braintreeacceleratedcheckout',
        trustedShippingAddress: false,
        type: 'card',
        untrustedShippingCardVerificationMode: 'pan',
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
        braintreeConnectMock = getConnectMock();
        braintreeFastlaneMock = getFastlaneMock();

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

        strategy = new BraintreeFastlanePaymentStrategy(
            paymentIntegrationService,
            braintreeFastlaneUtils,
            browserStorage,
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
        ).mockImplementation(jest.fn);

        jest.spyOn(
            braintreeFastlaneUtils,
            'initializeBraintreeAcceleratedCheckoutOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeFastlaneUtils,
            'runPayPalConnectAuthenticationFlowOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeFastlaneUtils,
            'runPayPalFastlaneAuthenticationFlowOrThrow',
        ).mockImplementation(jest.fn);
        jest.spyOn(
            braintreeFastlaneUtils,
            'getBraintreeConnectComponentOrThrow',
        ).mockImplementation(() => braintreeConnectMock.ConnectCardComponent);
        jest.spyOn(
            braintreeFastlaneUtils,
            'getBraintreeFastlaneComponentOrThrow',
        ).mockImplementation(() => braintreeFastlaneMock.FastlaneCardComponent);
        jest.spyOn(braintreeFastlaneUtils, 'getDeviceSessionId').mockImplementation(
            () => deviceSessionId,
        );
        jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
            tokenize: () => ({ nonce: 'nonce' }),
            render: jest.fn(),
        }));
        jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => ({
            tokenize: () => ({ nonce: 'nonce' }),
            render: jest.fn(),
        }));
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
            paymentMethod.initializationData.isFastlaneEnabled = true;

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

        it('calls fastlane authentication flow if isFastlaneEnabled true', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            };

            jest.spyOn(browserStorage, 'getItem').mockReturnValue(cart.id);

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalFastlaneAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('gets fastlane component if isFastlaneEnabled true', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            };

            jest.spyOn(browserStorage, 'getItem').mockReturnValue(cart.id);
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);
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
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
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
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('should not authenticate user the user logged in before checkout page', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(browserStorage, 'getItem').mockReturnValue('');

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('triggers OTP flow', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = false;
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomerOrThrow',
            ).mockReturnValue({});

            jest.spyOn(browserStorage, 'getItem').mockReturnValue(cart.id);

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalConnectAuthenticationFlowOrThrow,
            ).toHaveBeenCalled();
        });

        it('does not trigger lookup method for store members when experiment is on', async () => {
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
                        'PAYPAL-4001.braintree_fastlane_stored_member_flow_removal': true,
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

            await strategy.initialize(defaultInitializationOptions);

            expect(
                braintreeFastlaneUtils.runPayPalFastlaneAuthenticationFlowOrThrow,
            ).not.toHaveBeenCalled();
        });
    });

    describe('#renderBraintreeAXOComponent', () => {
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

        it('loads braintreeacceleratedcheckout payment method', async () => {
            await strategy.initialize(initializationOptions);

            callback(container.id);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        it('initializes braintree fastlane', async () => {
            await strategy.initialize(initializationOptions);

            callback(container.id);

            expect(
                braintreeFastlaneUtils.initializeBraintreeAcceleratedCheckoutOrThrow,
            ).toHaveBeenCalledWith(methodId, undefined);
        });

        it('renders braintree connect card component', async () => {
            const renderMethodMock = jest.fn();

            jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
                render: renderMethodMock,
            }));

            await strategy.initialize(initializationOptions);

            if (container.id) {
                callback(container.id);
            }

            expect(renderMethodMock).toHaveBeenCalledWith(container.id);
        });

        it('renders braintree fastlane card component', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            const renderMethodMock = jest.fn();

            container.id = 'pp-fastlane-container-id';

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => ({
                render: renderMethodMock,
            }));

            await strategy.initialize(initializationOptions);

            if (container.id) {
                callback(container.id);
            }

            expect(renderMethodMock).toHaveBeenCalledWith(container.id);
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
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    nonce: 'nonce',
                },
            });
        });

        it('submits payment and order with stored instrument data', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptions);

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    shouldSaveInstrument: false,
                    shouldSetAsDefaultInstrument: false,
                    nonce: 'nonce',
                },
            });
        });
    });

    describe('#prepareVaultedInstrumentPaymentPayload()', () => {
        it('prepares payment payload with BC vaulted instrument', async () => {
            await strategy.initialize(defaultInitializationOptions);
            await strategy.execute(executeOptionsWithVaultedInstrument);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: 'braintreeacceleratedcheckout',
                paymentData: {
                    deviceSessionId,
                    instrumentId,
                },
            });
        });

        it('prepares payment payload with PayPal Connect vaulted instrument', async () => {
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
                        paypal_connect_token: {
                            token: instrumentId,
                        },
                    },
                },
            });
        });

        it('prepares payment payload with PayPal Fastlane vaulted instrument', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    shouldRunAcceleratedCheckout: true,
                    isFastlaneEnabled: true,
                },
            };

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
    });

    describe('#preparePaymentPayload()', () => {
        it('collects an tokenizes data from braintree connect card component', async () => {
            const tokenizeMethodMock = jest.fn().mockReturnValue({ nonce: 'nonce' });

            jest.spyOn(braintreeConnectMock, 'ConnectCardComponent').mockImplementation(() => ({
                tokenize: tokenizeMethodMock,
                render: jest.fn,
            }));

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
                shippingAddress: {
                    streetAddress: '12345 Testing Way',
                    locality: 'Some City',
                    region: 'CA',
                    postalCode: '95555',
                    countryCodeAlpha2: 'US',
                },
            });
        });

        it('collects an tokenizes data from braintree fastlane card component', async () => {
            const mockPaymentMethod = {
                ...paymentMethod,
                initializationData: {
                    isAcceleratedCheckoutEnabled: true,
                    isFastlaneEnabled: true,
                },
            };

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(mockPaymentMethod);

            const tokenizeMethodMock = jest.fn().mockReturnValue({ id: 'nonce' });

            jest.spyOn(braintreeFastlaneMock, 'FastlaneCardComponent').mockImplementation(() => ({
                getPaymentToken: tokenizeMethodMock,
                render: jest.fn,
            }));

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
            });
        });
    });

    describe('#onChange option callback', () => {
        beforeEach(() => {
            jest.spyOn(
                braintreeFastlaneUtils,
                'initializeBraintreeAcceleratedCheckoutOrThrow',
            ).mockImplementation(jest.fn);
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

            jest.spyOn(braintreeFastlaneMock.profile, 'showCardSelector').mockImplementation(
                () => ({
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
            jest.spyOn(braintreeFastlaneMock.profile, 'showCardSelector').mockImplementation(
                () => ({
                    selectionChanged: false,
                    selectedCard: {},
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
