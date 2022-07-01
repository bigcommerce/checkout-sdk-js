import { InvalidArgumentError, PaymentIntegrationServiceMock, PaymentIntegrationService, MissingDataError, CustomerInitializeOptions, getCheckout } from "@bigcommerce/checkout-sdk/payment-integration";

import {
    createRequestSender,
    RequestSender,
} from "@bigcommerce/request-sender"
import { getConsignment } from "packages/payment-integration/src/test-utils/consignment.mock";
import { getShippingOption } from "packages/payment-integration/src/test-utils/shipping-option.mock";
import ApplePayCustomerStrategy from "./apple-pay-customer-strategy";
import ApplePaySessionFactory from "./apple-pay-session-factory";
import { getApplePay } from "./mocks/apple-pay-method.mock";
import { MockApplePaySession } from "./mocks/apple-pay-payment.mock";
import { getApplePayCustomerInitializationOptions, getContactAddress } from "./mocks/apple-pay-wallet-button-mock";

describe('ApplePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayCustomerStrategy;
    let applePaySession: MockApplePaySession;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, "ApplePaySession", {
            writable: true,
            value: MockApplePaySession,
        });
        applePayFactory = new ApplePaySessionFactory();
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(applePayFactory, 'create')
            .mockReturnValue(applePaySession)

        strategy = new ApplePayCustomerStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory
        );

        container = document.createElement('div');
        container.setAttribute('id', 'applePayCheckoutButton');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe.only('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(), 'getPaymentMethodOrThrow')
                    .mockReturnValue(getApplePay()
            );
        });

        it.only('creates the button', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            let children = container.children;
            expect(children.length).toBe(0);
            await strategy.initialize(customerInitializeOptions);
            children = container.children;

            expect(children.length).toBe(1);
        });

        it('throws error when payment data is empty', async () => {
            await expect(strategy.initialize({})).rejects.toThrow(MissingDataError);
        });

        it('throws error when applepay object is empty', async () => {
            await expect(strategy.initialize({methodId: 'applepay'})).rejects.toThrow(MissingDataError);
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
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
                const button = buttonContainer?.firstChild as HTMLElement;
                if (button) {
                    button.click();

                    expect(applePaySession.begin).toHaveBeenCalled();
                    await applePaySession.oncancel();

                    expect(paymentIntegrationService.signOut).toHaveBeenCalled();
                    expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
                }
            }
        });

        it('validates merchant successfully', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            await strategy.initialize(customerInitializeOptions);
            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
            jest.spyOn(requestSender, 'post')
                .mockRejectedValue(false);
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            await strategy.initialize(customerInitializeOptions);
            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
            const availableShippingMethods = newCheckout.consignments[0].availableShippingOptions.reverse().map(option => ({
                label: option.description,
                amount: option.cost.toFixed(2),
                detail: option.additionalDescription,
                identifier: option.id,
            }));

            jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow')
                .mockReturnValue(newCheckout);
            await strategy.initialize(customerInitializeOptions);

            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
                const button = buttonContainer?.firstChild as HTMLElement;
                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(paymentIntegrationService.selectShippingOption)
                        .toHaveBeenCalledWith('0:61d4bb52f746477e1d4fb41127361823');
                    expect(applePaySession.completeShippingContactSelection).toHaveBeenCalledWith({
                        newShippingMethods: availableShippingMethods,
                        newTotal: expect.anything(),
                        newLineItems: expect.anything(),
                    });
                }
            }
        });

        it('throws error if call to update address fails', async () => {
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress')
                .mockRejectedValue(false);
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            await strategy.initialize(customerInitializeOptions);
            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
            jest.spyOn(paymentIntegrationService, 'selectShippingOption')
                .mockRejectedValue(false);
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            await strategy.initialize(customerInitializeOptions);
            if (customerInitializeOptions.applepay) {
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
                const button = buttonContainer?.firstChild as HTMLElement;
                if (button) {
                    button.click();
                    await applePaySession.onpaymentauthorized(authEvent);

                    expect(paymentIntegrationService.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(customerInitializeOptions.applepay.onPaymentAuthorize).toHaveBeenCalled();
                }
            }
        });

        it('returns an error if autorize payment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment')
                .mockRejectedValue(false);
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
                const buttonContainer = document.getElementById(customerInitializeOptions?.applepay.container);
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

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signIn()).toThrowError();
        });
    });

    describe('#signOut()', () => {
        it('throws error if trying to sign out programmatically', () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            strategy.initialize(customerInitializeOptions);

            expect(() => strategy.signOut()).toThrowError();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const mockCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({ continueWithCheckoutCallback: mockCallback });

            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });
});
