import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

import {
    CartSource,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getCheckout,
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayButtonInitializeOptions from './apple-pay-button-initialize-options';
import ApplePayButtonMethodType from './apple-pay-button-method-type';
import ApplePayButtonStrategy from './apple-pay-button-strategy';
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

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });
        applePayFactory = new ApplePaySessionFactory();
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(requestSender, 'post').mockReturnValue(true);

        jest.spyOn(requestSender, 'get').mockReturnValue(true);

        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);

        strategy = new ApplePayButtonStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory,
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
        });

        it('creates the button', async () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            let children = container.children;

            expect(children).toHaveLength(0);

            await strategy.initialize(checkoutButtonInitializeOptions);
            children = container.children;

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalled();

            expect(children).toHaveLength(1);

            expect(Boolean(container.getElementsByClassName('apple-pay-checkout-button')[0])).toBe(
                true,
            );
        });

        it('doesnt call verifyCheckoutSpamProtection if checkout undefined', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCheckout').mockReturnValue(
                undefined,
            );
            paymentIntegrationService.verifyCheckoutSpamProtection = jest.fn();
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();

            await strategy.initialize(checkoutButtonInitializeOptions);

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalledTimes(0);
        });

        it('creates the button with a custom style class name', async () => {
            const customClass = 'testClassName';
            const CheckoutButtonInitializeOptions = merge(
                getApplePayButtonInitializationOptions(),
                { applepay: { buttonClassName: customClass } },
            );

            await strategy.initialize(CheckoutButtonInitializeOptions);

            expect(Boolean(container.getElementsByClassName(customClass)[0])).toBe(true);
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
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockRejectedValue(false);

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
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);

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
                Promise.resolve({ body: { ...getBuyNowCart() } }),
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
                Promise.resolve({ body: { ...getBuyNowCart() } }),
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
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);

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
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockRejectedValue(false);

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
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
