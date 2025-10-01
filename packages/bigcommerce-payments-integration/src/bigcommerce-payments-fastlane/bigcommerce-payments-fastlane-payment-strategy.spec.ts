import { createRequestSender } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import {
    BigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsFastlaneUtils,
    createBigCommercePaymentsSdk,
    getBigCommercePaymentsFastlanePaymentMethod,
    getPayPalFastlaneAuthenticationResultMock,
    getPayPalFastlaneSdk,
    PayPalFastlane,
    PayPalFastlaneAuthenticationState,
    PayPalFastlaneSdk,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    CardInstrument,
    InvalidArgumentError,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodInvalidError,
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

import BigCommercePaymentsRequestSender from '../bigcommerce-payments-request-sender';

import BigCommercePaymentsFastlanePaymentStrategy from './bigcommerce-payments-fastlane-payment-strategy';

describe('BigCommercePaymentsFastlanePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalFastlaneSdk: PayPalFastlaneSdk;
    let paypalFastlane: PayPalFastlane;
    let bigCommercePaymentsRequestSender: BigCommercePaymentsRequestSender;
    let bigCommercePaymentsSdk: PayPalSdkHelper;
    let bigCommercePaymentsFastlaneUtils: BigCommercePaymentsFastlaneUtils;
    let strategy: BigCommercePaymentsFastlanePaymentStrategy;

    const address = getBillingAddress();
    const cart = getCart();
    const guestCustomer = getGuestCustomer();
    const customer = getCustomer();
    const storeConfig = getConfig().storeConfig;

    const authenticationResultMock = getPayPalFastlaneAuthenticationResultMock();
    const customerContextId = 'id123';
    const paypalOrderId = 'paypalOrderId123';

    const methodId = 'bigcommerce_payments_fastlane';
    const initializationOptions = {
        methodId,
        bigcommerce_payments_fastlane: {
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
        method: 'bigcommerce_payments_fastlane',
        provider: 'bigcommerce_payments_fastlane',
        trustedShippingAddress: false,
        type: card,
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
    };

    beforeEach(async () => {
        paypalFastlaneSdk = getPayPalFastlaneSdk();
        paypalFastlane = await paypalFastlaneSdk.Fastlane();
        paymentMethod = getBigCommercePaymentsFastlanePaymentMethod();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        bigCommercePaymentsRequestSender = new BigCommercePaymentsRequestSender(
            createRequestSender(),
        );
        bigCommercePaymentsSdk = createBigCommercePaymentsSdk();
        bigCommercePaymentsFastlaneUtils = createBigCommercePaymentsFastlaneUtils();

        strategy = new BigCommercePaymentsFastlanePaymentStrategy(
            paymentIntegrationService,
            bigCommercePaymentsRequestSender,
            bigCommercePaymentsSdk,
            bigCommercePaymentsFastlaneUtils,
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

        jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
            Promise.resolve(paypalFastlaneSdk),
        );

        jest.spyOn(bigCommercePaymentsRequestSender, 'createOrder').mockResolvedValue({
            orderId: paypalOrderId,
            approveUrl: 'url.com',
        });

        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getPayPalFastlaneOrThrow').mockReturnValue(
            paypalFastlane,
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'initializePayPalFastlane');
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
            cart.id,
        );
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'updateStorageSessionId');
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'removeStorageSessionId');
        jest.spyOn(bigCommercePaymentsFastlaneUtils, 'lookupCustomerOrThrow').mockResolvedValue({
            customerContextId,
        });
        jest.spyOn(
            bigCommercePaymentsFastlaneUtils,
            'triggerAuthenticationFlowOrThrow',
        ).mockResolvedValue(getPayPalFastlaneAuthenticationResultMock());
        jest.spyOn(
            bigCommercePaymentsFastlaneUtils,
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

        it('throws an error if bigcommerce_payments_fastlane is not provided', async () => {
            try {
                await strategy.initialize({ methodId });
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if bigcommerce_payments_fastlane.onInit is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    bigcommerce_payments_fastlane: {},
                };

                await strategy.initialize(options);
            } catch (error: unknown) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });

        it('throws an error if bigcommerce_payments_fastlane.onChange is not provided or it is not a function', async () => {
            try {
                const options = {
                    methodId,
                    bigcommerce_payments_fastlane: {
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
                bigcommerce_payments_fastlane: {
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

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
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

            expect(bigCommercePaymentsSdk.getPayPalFastlaneSdk).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                cart.id,
            );
        });

        it('initializes paypal fastlane in production mode', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
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

            expect(bigCommercePaymentsFastlaneUtils.initializePayPalFastlane).toHaveBeenCalledWith(
                paypalFastlaneSdk,
                true,
                {},
            );
        });

        it('does not trigger lookup method if the customer already authenticated with BigCommercePayments Fastlane', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentProviderCustomer',
            ).mockReturnValue({
                authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
                addresses: [],
                instruments: [],
            });

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method for store members', async () => {
            const storeMember = getCustomer();

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomerOrThrow').mockReturnValue(
                storeMember,
            );

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('does not trigger lookup method if authentication flow did not trigger in the same session before page refresh', async () => {
            jest.spyOn(bigCommercePaymentsFastlaneUtils, 'getStorageSessionId').mockReturnValue(
                'another_session_id_123',
            );

            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).not.toHaveBeenCalled();
        });

        it('successfully authenticates customer with BigCommercePayments Fastlane', async () => {
            await strategy.initialize(initializationOptions);

            expect(bigCommercePaymentsFastlaneUtils.lookupCustomerOrThrow).toHaveBeenCalledWith(
                customer.email,
            );
            expect(
                bigCommercePaymentsFastlaneUtils.triggerAuthenticationFlowOrThrow,
            ).toHaveBeenCalledWith(customerContextId);
            expect(
                bigCommercePaymentsFastlaneUtils.mapPayPalFastlaneProfileToBcCustomerData,
            ).toHaveBeenCalledWith(methodId, authenticationResultMock);
            expect(bigCommercePaymentsFastlaneUtils.updateStorageSessionId).toHaveBeenCalledWith(
                cart.id,
            );
        });

        it('initialises BigCommercePayments Fastlane card component', async () => {
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

            expect(initializationOptions.bigcommerce_payments_fastlane.onInit).toHaveBeenCalled();
            expect(initializationOptions.bigcommerce_payments_fastlane.onChange).toHaveBeenCalled();
        });
    });

    describe('#execute()', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

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

            expect(bigCommercePaymentsRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                cartId: cart.id,
                fastlaneToken: 'paypal_fastlane_instrument_id_nonce',
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
                            token: 'paypal_fastlane_instrument_id_nonce',
                        },
                    },
                },
            });
            expect(bigCommercePaymentsFastlaneUtils.removeStorageSessionId).toHaveBeenCalled();
        });

        it('successfully places order with vaulted instruments flow', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.execute(executeOptionsWithVaulting);

            expect(bigCommercePaymentsRequestSender.createOrder).toHaveBeenCalledWith(methodId, {
                cartId: cart.id,
                fastlaneToken: 'mockInstrumentId123',
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
            expect(bigCommercePaymentsFastlaneUtils.removeStorageSessionId).toHaveBeenCalled();
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
                expect(bigCommercePaymentsRequestSender.createOrder).not.toHaveBeenCalled();
            }
        });

        describe('3D Secure', () => {
            const paymentMethodMock = (is3dsEnabled = true) => ({
                ...getBigCommercePaymentsFastlanePaymentMethod(),
                config: {
                    is3dsEnabled,
                },
            });

            const threeDomainSecureComponentMock = {
                isEligible: jest.fn().mockReturnValue(Promise.resolve(true)),
                show: jest.fn(),
            };

            beforeEach(() => {
                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(paymentMethodMock());

                jest.spyOn(bigCommercePaymentsRequestSender, 'createOrder').mockResolvedValue({
                    orderId: paypalOrderId,
                    approveUrl: 'url.com',
                });
            });

            it('creates order with fastlaneToken', async () => {
                const bigCommerceFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        isEligible: jest.fn().mockReturnValue(Promise.resolve(true)),
                        show: jest.fn().mockResolvedValue({
                            liabilityShift: 'YES',
                        }),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(bigCommerceFastlaneSdkMock),
                );

                await strategy.initialize(initializationOptions);

                await strategy.execute(executeOptions);

                expect(bigCommercePaymentsRequestSender.createOrder).toHaveBeenCalledWith(
                    methodId,
                    {
                        cartId: cart.id,
                        fastlaneToken: 'paypal_fastlane_instrument_id_nonce',
                    },
                );
            });

            it('does not create order if 3ds on and liability shift not YES', async () => {
                const bigCommerceFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        isEligible: jest.fn().mockReturnValue(Promise.resolve(true)),
                        show: jest.fn().mockResolvedValue({
                            liabilityShift: 'UNKNOWN',
                        }),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(bigCommerceFastlaneSdkMock),
                );

                await strategy.initialize(initializationOptions);

                try {
                    await strategy.execute(executeOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(PaymentMethodInvalidError);
                    expect(bigCommercePaymentsRequestSender.createOrder).not.toHaveBeenCalled();
                }
            });

            it('calls threeDomainSecureComponent isEligible', async () => {
                const bigCommerceFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        isEligible: jest.fn().mockReturnValue(Promise.resolve(false)),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(bigCommerceFastlaneSdkMock),
                );

                await strategy.initialize(initializationOptions);

                await strategy.execute(executeOptions);

                expect(
                    bigCommerceFastlaneSdkMock.ThreeDomainSecureClient.isEligible,
                ).toHaveBeenCalled();
            });

            it('prevent 3D Secure Verification when experiment is disabled', async () => {
                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve({
                        ...paypalFastlaneSdk,
                        ThreeDomainSecureClient: threeDomainSecureComponentMock,
                    }),
                );

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getStoreConfigOrThrow',
                ).mockReturnValue({
                    ...storeConfig,
                    checkoutSettings: {
                        ...storeConfig.checkoutSettings,
                        features: {
                            'PROJECT-7080.bcp_fastlane_three_ds': false,
                        },
                    },
                });

                await strategy.initialize(initializationOptions);

                await strategy.execute(executeOptions);

                expect(threeDomainSecureComponentMock.isEligible).not.toHaveBeenCalled();
                expect(threeDomainSecureComponentMock.show).not.toHaveBeenCalled();
            });

            it('calls threeDomainSecureComponent show', async () => {
                const bigCommerceFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        show: jest.fn().mockReturnValue({
                            liabilityShift: 'possible',
                            authenticationState: 'succeeded',
                            nonce: 'bigcommerce_payments_fastlane_instrument_id_nonce',
                        }),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(bigCommerceFastlaneSdkMock),
                );

                await strategy.initialize(initializationOptions);

                await strategy.execute(executeOptions);

                expect(bigCommerceFastlaneSdkMock.ThreeDomainSecureClient.show).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        methodId: 'bigcommerce_payments_fastlane',
                        paymentData: {
                            formattedPayload: expect.objectContaining({
                                paypal_fastlane_token: expect.objectContaining({
                                    token: 'bigcommerce_payments_fastlane_instrument_id_nonce',
                                    order_id: 'paypalOrderId123',
                                }),
                            }),
                            shouldSaveInstrument: false,
                            shouldSetAsDefaultInstrument: false,
                        },
                    }),
                );
            });

            it('throws an error if liabilityShift no or unknown', async () => {
                const paypalFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        show: jest.fn().mockReturnValue({
                            liabilityShift: 'NO',
                            authenticationState: 'success',
                            nonce: 'paypal_fastlane_instrument_id_nonce_3ds',
                        }),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(paypalFastlaneSdkMock),
                );

                await strategy.initialize(initializationOptions);

                try {
                    await strategy.execute(executeOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                }
            });

            it('throws an error if authenticationState is errored', async () => {
                const paypalFastlaneSdkMock = {
                    ...paypalFastlaneSdk,
                    ThreeDomainSecureClient: {
                        ...threeDomainSecureComponentMock,
                        show: jest.fn().mockReturnValue({
                            liabilityShift: 'possible',
                            authenticationState: 'errored',
                            nonce: 'paypal_fastlane_instrument_id_nonce_3ds',
                        }),
                    },
                };

                jest.spyOn(bigCommercePaymentsSdk, 'getPayPalFastlaneSdk').mockImplementation(() =>
                    Promise.resolve(paypalFastlaneSdkMock),
                );
                await strategy.initialize(initializationOptions);

                try {
                    await strategy.execute(executeOptions);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                }
            });
        });

        it('throws specific error when get 422 error on payment request', async () => {
            const initOptions = {
                methodId,
                bigcommerce_payments_fastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(),
                    onError: jest.fn(),
                },
            };

            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue({
                name: 'Error',
                message: 'Payment request failed',
                response: {
                    status: 422,
                    name: 'INVALID_REQUEST',
                },
            });
            await strategy.initialize(initOptions);

            try {
                await strategy.execute(executeOptions);
            } catch (error: unknown) {
                expect(initOptions.bigcommerce_payments_fastlane.onError).toHaveBeenCalledWith({
                    translationKey: 'payment.errors.invalid_request_error',
                });
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
                bigcommerce_payments_fastlane: {
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

        it('renders fastlane credit card component', async () => {
            const containerId = 'containerIdMock';
            let onInitCallback: (container: string) => void = noop;

            const onInitImplementation = (renderComponentCallback: (container: string) => void) => {
                onInitCallback = renderComponentCallback;
            };

            await strategy.initialize({
                methodId,
                bigcommerce_payments_fastlane: {
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
                bigcommerce_payments_fastlane: {
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
                method: 'bigcommerce_payments_fastlane',
                provider: 'bigcommerce_payments_fastlane',
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
                bigcommerce_payments_fastlane: {
                    onInit: jest.fn(),
                    onChange: jest.fn(onChangeImplementation),
                },
            });

            const result = await onChangeCallback();

            expect(result).toBeUndefined();
        });
    });
});
