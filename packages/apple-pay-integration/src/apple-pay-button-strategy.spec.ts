import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeSDKVersionManager,
    getBraintree,
    getDataCollectorMock,
    getDeviceDataMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CartSource,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getCheckout,
    getConfig,
    getConsignment,
    getResponse,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayButtonInitializeOptions from './apple-pay-button-initialize-options';
import ApplePayButtonMethodType from './apple-pay-button-method-type';
import ApplePayButtonStrategy, { ButtonStyleOption } from './apple-pay-button-strategy';
import ApplePayScriptLoader from './apple-pay-script-loader';
import ApplePaySessionFactory from './apple-pay-session-factory';
import {
    getApplePayButtonInitializationOptions,
    getApplePayButtonInitializationOptionsWithBuyNow,
} from './mocks/apple-pay-button.mock';
import { getApplePay } from './mocks/apple-pay-method.mock';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';
import { getContactAddress } from './mocks/apple-pay-wallet-button-mock';

describe('ApplePayButtonStrategy', () => {
    let container: HTMLDivElement;
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayButtonStrategy;
    let applePaySession: MockApplePaySession;
    let braintreeSdk: BraintreeSdk;
    let applePayScriptLoader: ApplePayScriptLoader;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });
        applePayFactory = new ApplePaySessionFactory();
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeSdk = new BraintreeSdk(
            new BraintreeScriptLoader(getScriptLoader(), window, braintreeSDKVersionManager),
        );
        applePayScriptLoader = new ApplePayScriptLoader(getScriptLoader());

        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(getResponse({})));
        jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(getResponse({})));
        jest.spyOn(applePayScriptLoader, 'loadSdk').mockReturnValue(Promise.resolve());

        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);

        strategy = new ApplePayButtonStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory,
            braintreeSdk,
            applePayScriptLoader,
        );

        container = document.createElement('div');
        container.setAttribute('id', 'applePayCheckoutButton');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getApplePay());

            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(
                paymentIntegrationService.getState(),
            );
        });

        it('load Apple Pay SDK if isWebBrowserSupported is true', async () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(checkoutButtonInitializeOptions);

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalled();

            expect(applePayScriptLoader.loadSdk).toHaveBeenCalled();
        });

        it('does not load Apple Pay SDK if isWebBrowserSupported is false', async () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            (
                checkoutButtonInitializeOptions.applepay as ApplePayButtonInitializeOptions
            ).isWebBrowserSupported = false;

            await strategy.initialize(checkoutButtonInitializeOptions);

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalled();

            expect(applePayScriptLoader.loadSdk).not.toHaveBeenCalled();
        });

        it('creates the button', async () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            let children = container.children;

            expect(children).toHaveLength(0);

            await strategy.initialize(checkoutButtonInitializeOptions);
            children = container.children;

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalled();

            expect(children).toHaveLength(1);
        });

        it('doesnt call verifyCheckoutSpamProtection if cart undefined', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCart').mockReturnValue(undefined);
            paymentIntegrationService.verifyCheckoutSpamProtection = jest.fn();

            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(checkoutButtonInitializeOptions);

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalledTimes(0);
        });

        it('throws error when payment data is empty', async () => {
            await expect(
                strategy.initialize({
                    containerId: '',
                    methodId: ApplePayButtonMethodType.APPLEPAY,
                    params: {},
                }),
            ).rejects.toThrow(MissingDataError);
        });

        it('throws error when params object is empty', async () => {
            await expect(
                strategy.initialize({
                    containerId: '',
                    params: {},
                    methodId: ApplePayButtonMethodType.APPLEPAY,
                }),
            ).rejects.toThrow(MissingDataError);
        });

        it('throws error when ApplePay object is empty', async () => {
            const options = {
                methodId: 'applepay',
                containerId: 'applepay',
                applepay: {} as ApplePayButtonInitializeOptions,
            };

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws error when ApplePay payment sheet is cancelled', async () => {
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    expect(applePaySession.begin).toHaveBeenCalled();

                    await applePaySession.oncancel();

                    expect(requestSender.get).toHaveBeenCalled();
                    expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                }
            }
        });

        it('validates merchant successfully', async () => {
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const validateEvent = {
                        validationURL: 'test',
                    } as ApplePayJS.ApplePayValidateMerchantEvent;

                    await applePaySession.onvalidatemerchant(validateEvent);

                    expect(requestSender.post).toHaveBeenCalled();
                }
            }
        });

        it('throws error if merchant validation fails', async () => {
            jest.spyOn(requestSender, 'post').mockRejectedValue(false);

            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const validateEvent = {
                        validationURL: 'test',
                    } as ApplePayJS.ApplePayValidateMerchantEvent;

                    try {
                        await applePaySession.onvalidatemerchant(validateEvent);
                    } catch (error) {
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        });

        it('gets shipping contact selected successfully', async () => {
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(applePaySession.completeShippingContactSelection).toHaveBeenCalled();
                }
            }
        });

        it('throws error if call to update address fails', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
                Promise.reject(paymentIntegrationService.getState()),
            );

            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    try {
                        await applePaySession.onshippingcontactselected(event);
                    } catch (error) {
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        });

        it('gets shipping method selected successfully', async () => {
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingMethod: {
                            label: 'test',
                            detail: 'test2',
                            amount: '10',
                            identifier: '1',
                        },
                    } as ApplePayJS.ApplePayShippingMethodSelectedEvent;

                    await applePaySession.onshippingmethodselected(event);

                    expect(applePaySession.completeShippingMethodSelection).toHaveBeenCalled();
                }
            }
        });

        it('gets shipping contact selected successfully with a selected shipping option', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
                Promise.resolve(paymentIntegrationService.getState()),
            );

            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            const newCheckout = {
                ...getCheckout(),
                consignments: [
                    {
                        ...getConsignment(),
                        selectedShippingOption: {
                            ...getShippingOption(),
                            description: 'Free Shipping',
                            additionalDescription: 'Free shipping to your order',
                            id: '0:61d4bb52f746477e1d4fb411221318c4',
                        },
                        availableShippingOptions: [
                            getShippingOption(),
                            {
                                ...getShippingOption(),
                                description: 'Free Shipping',
                                additionalDescription: 'Free shipping to your order',
                                id: '0:61d4bb52f746477e1d4fb411221318c4',
                            },
                        ],
                    },
                ],
            };
            const availableShippingMethods = newCheckout.consignments[0].availableShippingOptions
                .reverse()
                .map((option) => ({
                    label: option.description,
                    amount: option.cost.toFixed(2),
                    detail: option.additionalDescription,
                    identifier: option.id,
                }));

            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
                newCheckout,
            );

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalled();
                    expect(applePaySession.completeShippingContactSelection).toHaveBeenCalledWith({
                        newShippingMethods: availableShippingMethods,
                        newTotal: expect.anything(),
                        newLineItems: expect.anything(),
                    });
                }
            }
        });

        it('creates buyNowCart on PDP page on button click for digital product', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                Promise.resolve(getBuyNowCart()),
            );

            const CheckoutButtonInitializeOptions =
                getApplePayButtonInitializationOptionsWithBuyNow();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    await applePaySession.onpaymentmethodselected();

                    expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
                }
            }
        });

        it('creates buyNowCart on PDP page on button click for physical product', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockReturnValue(
                Promise.resolve(getBuyNowCart()),
            );

            const CheckoutButtonInitializeOptions =
                getApplePayButtonInitializationOptionsWithBuyNow();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onpaymentmethodselected();
                    await applePaySession.onshippingcontactselected(event);

                    expect(paymentIntegrationService.createBuyNowCart).toHaveBeenCalled();
                }
            }
        });

        it('doesnt call applePaySession.onpaymentmethodselected Buy Now flow with for digital item', async () => {
            applePaySession.onpaymentmethodselected = jest.fn();

            const CheckoutButtonInitializeOptions = {
                ...getApplePayButtonInitializationOptions(),
                applepay: {
                    onPaymentAuthorize: jest.fn(),
                    buyNowInitializeOptions: {
                        getBuyNowCartRequestBody: jest.fn().mockReturnValue({
                            source: CartSource.BuyNow,
                            lineItems: [
                                {
                                    productId: 1,
                                    quantity: 2,
                                    optionSelections: {
                                        optionId: 11,
                                        optionValue: 11,
                                    },
                                },
                            ],
                        }),
                    },
                    requiresShipping: true,
                },
            };

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    expect(applePaySession.onpaymentmethodselected).not.toHaveBeenCalled();
                }
            }
        });

        it('gets shipping options sorted correctly with recommended option first', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockReturnValue(
                Promise.resolve(paymentIntegrationService.getState()),
            );

            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            const newCheckout = {
                ...getCheckout(),
                consignments: [
                    {
                        ...getConsignment(),
                        availableShippingOptions: [
                            {
                                ...getShippingOption(),
                                description: 'Free Shipping',
                                additionalDescription: 'Free shipping to your order',
                                isRecommended: false,
                                id: '0:11111111',
                            },
                            {
                                ...getShippingOption(),
                                id: '0:22222222',
                            },
                        ],
                    },
                ],
            };

            const freeShippingOption = newCheckout.consignments[0].availableShippingOptions[0];
            const flatFeeShippingOption = newCheckout.consignments[0].availableShippingOptions[1];

            const expectedShippingMethods = [
                {
                    label: flatFeeShippingOption.description,
                    amount: flatFeeShippingOption.cost.toFixed(2),
                    detail: flatFeeShippingOption.additionalDescription,
                    identifier: flatFeeShippingOption.id,
                },
                {
                    label: freeShippingOption.description,
                    amount: freeShippingOption.cost.toFixed(2),
                    detail: freeShippingOption.additionalDescription,
                    identifier: freeShippingOption.id,
                },
            ];

            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
                newCheckout,
            );

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    const actualShippingMethods =
                        applePaySession.completeShippingContactSelection.mock.calls[0][0]
                            .newShippingMethods;

                    expect(actualShippingMethods).toEqual(expectedShippingMethods);
                }
            }
        });

        it('gets call to update shipping option in consignment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockRejectedValue(false);

            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingMethod: {
                            label: 'test',
                            detail: 'test2',
                            amount: '10',
                            identifier: '1',
                        },
                    } as ApplePayJS.ApplePayShippingMethodSelectedEvent;

                    try {
                        await applePaySession.onshippingmethodselected(event);
                    } catch (error) {
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        });

        it('submits payment when shopper authorises', async () => {
            const authEvent = {
                payment: {
                    billingContact: getContactAddress(),
                    shippingContact: getContactAddress(),
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    await applePaySession.onpaymentauthorized(authEvent);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(
                        CheckoutButtonInitializeOptions.applepay.onPaymentAuthorize,
                    ).toHaveBeenCalled();
                }
            }
        });

        it('returns an error if autorize payment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValueOnce(false);

            const authEvent = {
                payment: {
                    billingContact: getContactAddress(),
                    shippingContact: getContactAddress(),
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
            const CheckoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    try {
                        await applePaySession.onpaymentauthorized(authEvent);
                    } catch (error) {
                        expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                        expect(applePaySession.completePayment).toHaveBeenCalled();
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        });

        describe('button styling', () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            const applePayPaymentMethod = getApplePay();

            const mockGetPaymentMethod = (styleOption: ButtonStyleOption) => {
                applePayPaymentMethod.initializationData.styleOption = styleOption;

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockImplementation(() => applePayPaymentMethod);
            };

            it('style should be valid', async () => {
                await strategy.initialize(checkoutButtonInitializeOptions);

                const button = container.firstChild as HTMLElement;

                expect(button.getAttribute('style')).toContain(
                    '--apple-pay-button-width: 100%; --apple-pay-button-height: 40px; --apple-pay-button-border-radius: 4px;',
                );
            });

            it('type should be plain', async () => {
                await strategy.initialize(checkoutButtonInitializeOptions);

                const button = container.firstChild as HTMLElement;

                expect(button.getAttribute('type')).toContain('plain');
            });

            it('should be black', async () => {
                mockGetPaymentMethod(ButtonStyleOption.Black);

                await strategy.initialize(checkoutButtonInitializeOptions);

                const button = container.firstChild as HTMLElement;

                expect(button.getAttribute('buttonstyle')).toContain('black');
            });

            it('should be white', async () => {
                mockGetPaymentMethod(ButtonStyleOption.White);

                await strategy.initialize(checkoutButtonInitializeOptions);

                const button = container.firstChild as HTMLElement;

                expect(button.getAttribute('buttonstyle')).toContain('white');
            });

            it('should be white-outline', async () => {
                mockGetPaymentMethod(ButtonStyleOption.WhiteBorder);

                await strategy.initialize(checkoutButtonInitializeOptions);

                const button = container.firstChild as HTMLElement;

                expect(button.getAttribute('buttonstyle')).toContain('white-outline');
            });

            describe('when isWebBrowserSupported is false', () => {
                beforeEach(() => {
                    (
                        checkoutButtonInitializeOptions.applepay as ApplePayButtonInitializeOptions
                    ).isWebBrowserSupported = false;
                });

                it('should be black', async () => {
                    mockGetPaymentMethod(ButtonStyleOption.Black);

                    await strategy.initialize(checkoutButtonInitializeOptions);

                    const button = container.firstChild as HTMLElement;

                    expect(button.getAttribute('style')).toContain(
                        'background-color: rgb(0, 0, 0)',
                    );
                });

                it('should be white', async () => {
                    mockGetPaymentMethod(ButtonStyleOption.White);

                    await strategy.initialize(checkoutButtonInitializeOptions);

                    const button = container.firstChild as HTMLElement;

                    expect(button.getAttribute('style')).toContain(
                        'background-color: rgb(255, 255, 255)',
                    );
                });

                it('should be white border', async () => {
                    mockGetPaymentMethod(ButtonStyleOption.WhiteBorder);

                    await strategy.initialize(checkoutButtonInitializeOptions);

                    const button = container.firstChild as HTMLElement;

                    const style = button.getAttribute('style');

                    expect(style).toContain('background-color: rgb(255, 255, 255)');
                    expect(style).toContain('border: 0.5px solid #000');
                });
            });
        });
    });

    describe('#initialize() with braintree gateway', () => {
        const initializeOptions = getApplePayButtonInitializationOptions();

        const applePayPaymentMethod = getApplePay();
        const braintreePaymentMethod = getBraintree();

        applePayPaymentMethod.initializationData.gateway = 'braintree';

        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => applePayPaymentMethod);

            jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethod').mockImplementation(
                () => braintreePaymentMethod,
            );

            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
                getConfig().storeConfig,
            );

            jest.spyOn(braintreeSdk, 'initialize').mockImplementation(jest.fn());
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
                Promise.resolve(getDataCollectorMock()),
            );
        });

        it('initializes braintree sdk on apple pay strategy initialization', async () => {
            await strategy.initialize(initializeOptions);

            expect(braintreeSdk.initialize).toHaveBeenCalled();
        });

        it('submits payment with provided braintree device data session', async () => {
            const authEvent = {
                payment: {
                    billingContact: getContactAddress(),
                    shippingContact: getContactAddress(),
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

            await strategy.initialize(initializeOptions);

            await new Promise((resolve) => process.nextTick(resolve));

            const button = container.firstChild as HTMLElement;

            button.click();

            await applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        deviceSessionId: getDeviceDataMock(),
                    }),
                }),
            );
        });

        it('submits payment with braintree device data session as undefined when braintree respond with an error', async () => {
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockImplementation(() =>
                Promise.reject(new Error('Braintree Sdk related error')),
            );

            const authEvent = {
                payment: {
                    billingContact: getContactAddress(),
                    shippingContact: getContactAddress(),
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

            await strategy.initialize(initializeOptions);
            await new Promise((resolve) => process.nextTick(resolve));

            const button = container.firstChild as HTMLElement;

            button.click();

            await applePaySession.onpaymentauthorized(authEvent);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentData: expect.objectContaining({
                        deviceSessionId: undefined,
                    }),
                }),
            );
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
