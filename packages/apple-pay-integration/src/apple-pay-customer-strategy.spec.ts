import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    Consignment,
    CustomerInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayCustomerStrategy from './apple-pay-customer-strategy';
import ApplePaySessionFactory from './apple-pay-session-factory';
import { getApplePay } from './mocks/apple-pay-method.mock';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';
import {
    getApplePayCustomerInitializationOptions,
    getContactAddress,
} from './mocks/apple-pay-wallet-button-mock';

describe('ApplePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayCustomerStrategy;
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

        strategy = new ApplePayCustomerStrategy(
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
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            let children = container.children;

            expect(children).toHaveLength(0);

            await strategy.initialize(customerInitializeOptions);
            children = container.children;

            expect(paymentIntegrationService.verifyCheckoutSpamProtection).toHaveBeenCalled();
            expect(children).toHaveLength(1);
        });

        it('throws error when payment data is empty', async () => {
            await expect(strategy.initialize({})).rejects.toThrow(MissingDataError);
        });

        it('sets up request for digital items', async () => {
            const cart = getCart();

            cart.lineItems.physicalItems = [];

            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                cart,
            );

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );

                await strategy.initialize(customerInitializeOptions);

                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    expect(applePaySession.begin).toHaveBeenCalled();
                }
            }
        });

        it('throws error when applepay object is empty', async () => {
            const options = {
                methodId: 'applepay',
                applepay: {},
            } as CustomerInitializeOptions;

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws error when Apple Pay payment sheet is cancelled', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    expect(applePaySession.begin).toHaveBeenCalled();

                    await applePaySession.oncancel();

                    expect(requestSender.get).toHaveBeenCalled();
                    expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                }
            }
        });

        it('throws payment method cancelled error if loadCheckout fails', async () => {
            jest.spyOn(requestSender, 'get').mockRejectedValue(false);

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    expect(applePaySession.begin).toHaveBeenCalled();

                    try {
                        await applePaySession.oncancel();
                    } catch (err) {
                        expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                    }
                }
            }
        });

        it('validates merchant successfully', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                getCart(),
            );

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

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

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const validateEvent = {
                        validationURL: 'test',
                    } as ApplePayJS.ApplePayValidateMerchantEvent;

                    await applePaySession.onvalidatemerchant(validateEvent);

                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                }
            }
        });

        it('gets shipping contact selected successfully', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

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

        it('gets shipping contact selected successfully with a selected shipping option', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            const newCheckout = {
                ...getCheckout(),
                consignments: [
                    {
                        ...getConsignment(),
                        selectedShippingOption: {
                            ...getShippingOption(),
                            description: 'Free Shipping',
                            additionalDescription: 'Free shipping to your order',
                            id: '0:61d4bb52f746477e1d4fb41127361823',
                        },
                        availableShippingOptions: [
                            getShippingOption(),
                            {
                                ...getShippingOption(),
                                description: 'Free Shipping',
                                additionalDescription: 'Free shipping to your order',
                                id: '0:61d4bb52f746477e1d4fb41127361823',
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
            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                        '0:61d4bb52f746477e1d4fb41127361823',
                    );
                    expect(applePaySession.completeShippingContactSelection).toHaveBeenCalledWith({
                        newShippingMethods: availableShippingMethods,
                        newTotal: expect.anything(),
                        newLineItems: expect.anything(),
                    });
                }
            }
        });

        it('gets shipping options sorted correctly with recommended option first', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);

            const CheckoutButtonInitializeOptions = getApplePayCustomerInitializationOptions();
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
                                id: '0:1111111',
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

        it('throws error if call to update address fails', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockRejectedValue(false);

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                }
            }
        });

        it('gets shipping method selected successfully', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

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

        it('gets call to update shipping option in consignment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockRejectedValue(false);

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

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

                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                }
            }
        });

        it('submits payment when shopper authorises', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);

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
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();
                    await applePaySession.onpaymentauthorized(authEvent);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(
                        customerInitializeOptions.applepay.onPaymentAuthorize,
                    ).toHaveBeenCalled();
                }
            }
        });

        it('returns an error if autorize payment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);
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
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();
                    await applePaySession.onpaymentauthorized(authEvent);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                }
            }
        });
    });

    describe('#intialize edge cases', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getApplePay());
        });

        it('throws error if shipping options are undefined', async () => {
            const checkout = getCheckout();

            checkout.consignments = [{}] as Consignment[];
            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
                checkout,
            );

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    try {
                        await applePaySession.onshippingcontactselected(event);
                    } catch (err) {
                        expect(err).toBeInstanceOf(Error);
                    }
                }
            }
        });

        it('fires event if no shipping options are available', async () => {
            const checkout = getCheckout();
            const options = [] as ShippingOption[];

            checkout.consignments = [{ availableShippingOptions: options }] as Consignment[];
            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
                checkout,
            );

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

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

        it('throws error if unable to update shipping option', async () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
                getCheckout(),
            );
            jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockRejectedValue(false);

            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled();
                }
            }
        });

        it('submits payment when shopper authorises without phone number', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockResolvedValue(true);

            const authEvent = {
                payment: {
                    billingContact: undefined,
                    shippingContact: undefined,
                    token: {
                        paymentData: {},
                        paymentMethod: {},
                        transactionIdentifier: {},
                    },
                },
            } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(
                    customerInitializeOptions.applepay.container,
                );
                const button = buttonContainer?.firstChild as HTMLElement;

                if (button) {
                    button.click();
                    await applePaySession.onpaymentauthorized(authEvent);

                    expect(
                        paymentIntegrationService.verifyCheckoutSpamProtection,
                    ).toHaveBeenCalled();
                    expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalled();
                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                }
            }
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn()).toThrow();
        });
    });

    describe('#signOut()', () => {
        it('throws error if trying to sign out programmatically', () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();

            strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signOut()).toThrow();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback: mockCallback,
            });

            expect(mockCallback.mock.calls).toHaveLength(1);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            const result = await strategy.deinitialize();

            expect(result).toBeUndefined();
        });
    });
});
