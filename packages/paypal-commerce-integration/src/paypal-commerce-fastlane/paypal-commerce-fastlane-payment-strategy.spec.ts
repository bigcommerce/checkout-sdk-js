import { createRequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import {
    CardInstrument,
    InvalidArgumentError,
    PaymentArgumentInvalidError,
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
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalConnectAuthenticationResultMock,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
    PayPalAxoSdk,
    PayPalCommerceConnect,
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
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalConnect: PayPalCommerceConnect;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let paypalFastlane: PayPalFastlane;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalCommerceFastlaneUtils: PayPalCommerceFastlaneUtils;
    let strategy: PayPalCommerceFastlanePaymentStrategy;

    const cart = getCart();
    const customer = getCustomer();
    const address = getBillingAddress();

    const authenticationResultMock = getPayPalConnectAuthenticationResultMock();
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
        method: 'paypalcommerceacceleratedcheckout',
        provider: 'paypalcommerceacceleratedcheckout',
        trustedShippingAddress: false,
        type: 'card',
        untrustedShippingCardVerificationMode: 'pan',
    };

    beforeEach(async () => {
        paypalAxoSdk = getPayPalAxoSdk();
        paypalConnect = await paypalAxoSdk.Connect();
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
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(customer);
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

        jest.spyOn(paypalCommerceSdk, 'getPayPalAxo').mockImplementation(() => paypalAxoSdk);
        jest.spyOn(paypalCommerceSdk, 'getPayPalFastlaneSdk').mockImplementation(
            () => paypalFastlaneSdk,
        );

        jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue({
            orderId: paypalOrderId,
        });

        jest.spyOn(paypalCommerceFastlaneUtils, 'getPayPalConnectOrThrow').mockReturnValue(
            paypalConnect,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'getPayPalFastlaneOrThrow').mockReturnValue(
            paypalFastlane,
        );
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalConnect');
        jest.spyOn(paypalCommerceFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(cart.id);
        jest.spyOn(paypalCommerceFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceFastlaneUtils, 'lookupCustomerOrThrow').mockReturnValue({
            customerContextId,
        });
        jest.spyOn(paypalCommerceFastlaneUtils, 'connectLookupCustomerOrThrow').mockReturnValue({
            customerContextId,
        });
        jest.spyOn(paypalCommerceFastlaneUtils, 'triggerAuthenticationFlowOrThrow').mockReturnValue(
            getPayPalFastlaneAuthenticationResultMock(),
        );
        jest.spyOn(
            paypalCommerceFastlaneUtils,
            'connectTriggerAuthenticationFlowOrThrow',
        ).mockReturnValue(getPayPalFastlaneAuthenticationResultMock());
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

        it('loads payment method', async () => {
            await strategy.initialize(initializationOptions);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(methodId);
        });

        describe('initialize with paypal connect', () => {
            it('loads paypal axo sdk', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = false;

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                    paymentMethod,
                    cart.currency.code,
                    cart.id,
                );
            });

            it('initializes paypal connect in production mode', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = false;

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceFastlaneUtils.initializePayPalConnect).toHaveBeenCalledWith(
                    paypalAxoSdk,
                    false,
                    undefined,
                );
            });

            it('initializes paypal connect in test mode', async () => {
                paymentMethod.initializationData.isDeveloperModeApplicable = true;
                paymentMethod.initializationData.isFastlaneEnabled = false;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceFastlaneUtils.initializePayPalConnect).toHaveBeenCalledWith(
                    paypalAxoSdk,
                    true,
                    undefined,
                );
            });

            it('does not trigger lookup method if the customer already authenticated with PayPal Connect', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = false;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomer',
                ).mockReturnValue({
                    authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                    addresses: [],
                    instruments: [],
                });

                await strategy.initialize(initializationOptions);

                expect(
                    paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow,
                ).not.toHaveBeenCalled();
            });

            it('successfully authenticates customer with PayPal Connect', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = false;

                await strategy.initialize(initializationOptions);

                expect(
                    paypalCommerceFastlaneUtils.connectLookupCustomerOrThrow,
                ).toHaveBeenCalledWith(customer.email);
                expect(
                    paypalCommerceFastlaneUtils.connectTriggerAuthenticationFlowOrThrow,
                ).toHaveBeenCalledWith(customerContextId);
                expect(
                    paypalCommerceFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
                ).toHaveBeenCalledWith(methodId, authenticationResultMock);
                expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                    false,
                    cart.id,
                );
            });

            it('initialises PayPal Connect card component', async () => {
                await strategy.initialize(initializationOptions);

                expect(paypalConnect.ConnectCardComponent).toHaveBeenCalledWith({
                    fields: {
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

        describe('initialize with paypal fastlane', () => {
            it('loads paypal fastlane sdk', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                    paymentMethod,
                    cart.currency.code,
                    cart.id,
                );
            });

            it('initializes paypal fastlane in production mode', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                    paypalFastlaneSdk,
                    false,
                    undefined,
                );
            });

            it('initializes paypal fastlane in test mode', async () => {
                paymentMethod.initializationData.isDeveloperModeApplicable = true;
                paymentMethod.initializationData.isFastlaneEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethod);

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                    paypalFastlaneSdk,
                    true,
                    undefined,
                );
            });

            it('does not trigger lookup method if the customer already authenticated with PayPal Fastlane', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

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

            it('does not trigger lookup method if authentication flow did not trigger in the same session before page refresh', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                jest.spyOn(paypalCommerceFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                    'another_session_id_123',
                );

                await strategy.initialize(initializationOptions);

                expect(paypalCommerceFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
            });

            it('successfully authenticates customer with PayPal Fastlane', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

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
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);

                expect(paypalFastlane.FastlaneCardComponent).toHaveBeenCalledWith({
                    fields: {
                        phoneNumber: {
                            prefill: address.phone,
                        },
                    },
                });
            });

            it('provides callback function to be able to use them on ui', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);

                expect(initializationOptions.paypalcommercefastlane.onInit).toHaveBeenCalled();
                expect(initializationOptions.paypalcommercefastlane.onChange).toHaveBeenCalled();
            });
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

        describe('execute with PayPal Connect', () => {
            it('successfully places order with credit card flow', async () => {
                await strategy.initialize(initializationOptions);
                await strategy.execute(executeOptions);

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                    cartId: cart.id,
                });

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId,
                    paymentData: {
                        shouldSaveInstrument: false,
                        shouldSetAsDefaultInstrument: false,
                        formattedPayload: {
                            paypal_connect_token: {
                                order_id: paypalOrderId,
                                token: 'paypal_connect_tokenize_nonce',
                            },
                        },
                    },
                });
                expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                    true,
                );
            });

            it('successfully places order with vaulted instruments flow', async () => {
                await strategy.initialize(initializationOptions);
                await strategy.execute(executeOptionsWithVaulting);

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                    cartId: cart.id,
                });

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith({}, undefined);
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            paypal_connect_token: {
                                order_id: paypalOrderId,
                                token: mockedInstrumentId,
                            },
                        },
                    },
                });
                expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                    true,
                );
            });
        });

        describe('execute with PayPal Fastlane', () => {
            it('successfully places order with credit card flow', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);
                await strategy.execute(executeOptions);

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                    cartId: cart.id,
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
                                token: 'paypal_fastlane_instrument_id_nonce',
                            },
                        },
                    },
                });
                expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                    true,
                );
            });

            it('successfully places order with vaulted instruments flow', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                await strategy.initialize(initializationOptions);
                await strategy.execute(executeOptionsWithVaulting);

                expect(paypalCommerceRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                    cartId: cart.id,
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
                expect(paypalCommerceFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                    true,
                );
            });
        });
    });

    describe('#onInit option callback', () => {
        it('throws an error if container is not provided', async () => {
            let onInitCallback = noop;

            const onInitImplementation = (
                renderComponentCallback: (container?: string) => void,
            ) => {
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

        it('renders paypal connect credit card component', async () => {
            const containerId = 'containerIdMock';
            let onInitCallback: (container?: string) => void = noop;

            const onInitImplementation = (
                renderComponentCallback: (container?: string) => void,
            ) => {
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

            expect(paypalConnect.ConnectCardComponent({}).render).toHaveBeenCalledWith(containerId);
        });

        it('renders paypal fastlane credit card component', async () => {
            paymentMethod.initializationData.isFastlaneEnabled = true;

            const containerId = 'containerIdMock';
            let onInitCallback: (container?: string) => void = noop;

            const onInitImplementation = (
                renderComponentCallback: (container?: string) => void,
            ) => {
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

            expect(paypalFastlane.FastlaneCardComponent({}).render).toHaveBeenCalledWith(
                containerId,
            );
        });
    });

    describe('#onChange option callback', () => {
        describe('test onChange callback with PayPal Connect', () => {
            it('returns selected card instrument', async () => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomer',
                ).mockReturnValue({
                    authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                    addresses: [bcAddressMock],
                    instruments: [bcCardMock],
                });

                jest.spyOn(paypalConnect.profile, 'showCardSelector').mockImplementation(() => ({
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
                }));

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

                expect(
                    paymentIntegrationService.updatePaymentProviderCustomer,
                ).toHaveBeenCalledWith({
                    authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                    addresses: [bcAddressMock],
                    instruments: [paypalToBcInstrument],
                });

                expect(result).toEqual(paypalToBcInstrument);
            });

            it('returns undefined if the customer selects the same instrument or closes a popup window', async () => {
                jest.spyOn(paypalConnect.profile, 'showCardSelector').mockImplementation(() => ({
                    selectionChanged: false,
                    selectedCard: {},
                }));

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

        describe('test onChange callback with PayPal Fastlane', () => {
            it('returns selected card instrument', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentProviderCustomer',
                ).mockReturnValue({
                    authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                    addresses: [bcAddressMock],
                    instruments: [bcCardMock],
                });

                jest.spyOn(paypalFastlane.profile, 'showCardSelector').mockImplementation(() => ({
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
                }));

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

                expect(
                    paymentIntegrationService.updatePaymentProviderCustomer,
                ).toHaveBeenCalledWith({
                    authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                    addresses: [bcAddressMock],
                    instruments: [paypalToBcInstrument],
                });

                expect(result).toEqual(paypalToBcInstrument);
            });

            it('returns undefined if the customer selects the same instrument or closes a popup window', async () => {
                paymentMethod.initializationData.isFastlaneEnabled = true;

                jest.spyOn(paypalFastlane.profile, 'showCardSelector').mockImplementation(() => ({
                    selectionChanged: false,
                    selectedCard: {},
                }));

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
});
