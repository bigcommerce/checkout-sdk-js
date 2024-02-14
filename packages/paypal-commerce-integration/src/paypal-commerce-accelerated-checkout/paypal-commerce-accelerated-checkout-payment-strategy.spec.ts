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
    createPayPalCommerceAcceleratedCheckoutUtils,
    createPayPalCommerceSdk,
    getPayPalAxoSdk,
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalConnectAuthenticationResultMock,
    PayPalAxoSdk,
    PayPalCommerceAcceleratedCheckoutUtils,
    PayPalCommerceConnect,
    PayPalCommerceConnectAuthenticationState,
    PayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import PayPalCommerceRequestSender from '../paypal-commerce-request-sender';

import PayPalCommerceAcceleratedCheckoutPaymentStrategy from './paypal-commerce-accelerated-checkout-payment-strategy';

describe('PayPalCommerceAcceleratedCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalAxoSdk: PayPalAxoSdk;
    let paypalConnect: PayPalCommerceConnect;
    let paypalCommerceRequestSender: PayPalCommerceRequestSender;
    let paypalCommerceSdk: PayPalCommerceSdk;
    let paypalCommerceAcceleratedCheckoutUtils: PayPalCommerceAcceleratedCheckoutUtils;
    let strategy: PayPalCommerceAcceleratedCheckoutPaymentStrategy;

    const cart = getCart();
    const customer = getCustomer();
    const address = getBillingAddress();

    const authenticationResultMock = getPayPalConnectAuthenticationResultMock();
    const customerContextId = 'id123';
    const paypalOrderId = 'paypalOrderId123';

    const methodId = 'paypalcommerceacceleratedcheckout';
    const initializationOptions = {
        methodId,
        paypalcommerceacceleratedcheckout: {
            onInit: jest.fn(),
            onChange: jest.fn(),
        },
    };

    beforeEach(async () => {
        paypalAxoSdk = getPayPalAxoSdk();
        paypalConnect = await paypalAxoSdk.Connect();
        paymentMethod = getPayPalCommerceAcceleratedCheckoutPaymentMethod();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalCommerceRequestSender = new PayPalCommerceRequestSender(createRequestSender());
        paypalCommerceSdk = createPayPalCommerceSdk();
        paypalCommerceAcceleratedCheckoutUtils = createPayPalCommerceAcceleratedCheckoutUtils();

        strategy = new PayPalCommerceAcceleratedCheckoutPaymentStrategy(
            paymentIntegrationService,
            paypalCommerceRequestSender,
            paypalCommerceSdk,
            paypalCommerceAcceleratedCheckoutUtils,
        );

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'submitOrder');
        jest.spyOn(paymentIntegrationService, 'submitPayment');
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

        jest.spyOn(paypalCommerceRequestSender, 'createOrder').mockReturnValue({
            orderId: paypalOrderId,
        });

        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'getPayPalConnectOrThrow',
        ).mockReturnValue(paypalConnect);
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'initializePayPalConnect');
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'getStorageSessionId').mockReturnValue(
            cart.id,
        );
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'updateStorageSessionId');
        jest.spyOn(paypalCommerceAcceleratedCheckoutUtils, 'lookupCustomerOrThrow').mockReturnValue(
            {
                customerContextId,
            },
        );
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockReturnValue(getPayPalConnectAuthenticationResultMock());
        jest.spyOn(
            paypalCommerceAcceleratedCheckoutUtils,
            'mapPayPalConnectProfileToBcCustomerData',
        ).mockReturnValue({
            authenticationState: PayPalCommerceConnectAuthenticationState.SUCCEEDED,
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

        it('throws an error if paypalcommerceacceleratedcheckout is not provided', async () => {
            try {
                await strategy.initialize({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerceacceleratedcheckout.onInit is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    paypalcommerceacceleratedcheckout: {},
                };

                await strategy.initialize(options);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if paypalcommerceacceleratedcheckout.onChange is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    paypalcommerceacceleratedcheckout: {
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

        it('loads paypal axo sdk', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalCommerceSdk.getPayPalAxo).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
            );
        });

        it('initializes paypal connect in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(paypalAxoSdk, false, undefined);
        });

        it('initializes paypal connect in test mode', async () => {
            paymentMethod.initializationData.isDeveloperModeApplicable = true;

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(initializationOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.initializePayPalConnect,
            ).toHaveBeenCalledWith(paypalAxoSdk, true, undefined);
        });

        it('does not trigger lookup method if the customer already authenticated with PayPal Connect', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: PayPalCommerceConnectAuthenticationState.SUCCEEDED,
                addresses: [],
                instruments: [],
            });

            await strategy.initialize(initializationOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method if authentication flow did not trigger in the same session before page refresh', async () => {
            jest.spyOn(
                paypalCommerceAcceleratedCheckoutUtils,
                'getStorageSessionId',
            ).mockReturnValue('another_session_id_123');

            await strategy.initialize(initializationOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).not.toHaveBeenCalled();
        });

        it('successfully authenticates customer with PayPal Connect', async () => {
            await strategy.initialize(initializationOptions);

            expect(
                paypalCommerceAcceleratedCheckoutUtils.lookupCustomerOrThrow,
            ).toHaveBeenCalledWith(customer.email);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.mapPayPalConnectProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(
                paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId,
            ).toHaveBeenCalledWith(false, cart.id);
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

            expect(
                initializationOptions.paypalcommerceacceleratedcheckout.onInit,
            ).toHaveBeenCalled();
            expect(
                initializationOptions.paypalcommerceacceleratedcheckout.onChange,
            ).toHaveBeenCalled();
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
            expect(
                paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId,
            ).toHaveBeenCalledWith(true);
        });

        it('successfully places order with vaulted instruments flow', async () => {
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
            expect(
                paypalCommerceAcceleratedCheckoutUtils.updateStorageSessionId,
            ).toHaveBeenCalledWith(true);
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
                paypalcommerceacceleratedcheckout: {
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
                paypalcommerceacceleratedcheckout: {
                    onInit: jest.fn(onInitImplementation),
                    onChange: jest.fn(),
                },
            });

            onInitCallback(containerId);

            expect(paypalConnect.ConnectCardComponent({}).render).toHaveBeenCalledWith(containerId);
        });
    });

    describe('#onChange option callback', () => {
        it('returns selected card instrument', async () => {
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
                showPayPalConnectCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showPayPalConnectCardSelector;
            };

            await strategy.initialize({
                methodId,
                paypalcommerceacceleratedcheckout: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            expect(result).toEqual({
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
            });
        });

        it('returns undefined if the customer selects the same instrument or closes a popup window', async () => {
            jest.spyOn(paypalConnect.profile, 'showCardSelector').mockImplementation(() => ({
                selectionChanged: false,
                selectedCard: {},
            }));

            let onChangeCallback: () => Promise<CardInstrument | undefined> = () =>
                Promise.resolve(undefined);
            const onChangeImplementation = (
                showPayPalConnectCardSelector: () => Promise<CardInstrument | undefined>,
            ) => {
                onChangeCallback = showPayPalConnectCardSelector;
            };

            await strategy.initialize({
                methodId,
                paypalcommerceacceleratedcheckout: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            expect(result).toBeUndefined();
        });
    });
});
