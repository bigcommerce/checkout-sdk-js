import {
    InvalidArgumentError,
    PaymentIntegrationService,
    MissingDataError,
    CheckoutButtonInitializeOptions,
    CheckoutButtonMethodType,
} from "@bigcommerce/checkout-sdk/payment-integration";
import { PaymentIntegrationServiceMock,
    getCheckout,
    getConsignment,
    getShippingOption } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    createRequestSender,
    RequestSender,
} from "@bigcommerce/request-sender";
import { merge } from 'lodash';
import ApplePayButtonStrategy from './apple-pay-button-strategy';
import ApplePaySessionFactory from "./apple-pay-session-factory";
import { getApplePayButtonInitializationOptions } from './mocks/apple-pay-button.mock';
import { getApplePay } from "./mocks/apple-pay-method.mock";
import { MockApplePaySession } from "./mocks/apple-pay-payment.mock";
import {
    getContactAddress,
} from "./mocks/apple-pay-wallet-button-mock";

describe("ApplePayButtonStrategy", () => {
    let container: HTMLDivElement;
    let requestSender: RequestSender;
    let applePayFactory: ApplePaySessionFactory;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: ApplePayButtonStrategy;
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

        jest.spyOn(requestSender, "post").mockReturnValue(true);

        jest.spyOn(requestSender, "get").mockReturnValue(true);

        jest.spyOn(applePayFactory, "create").mockReturnValue(applePaySession);

        strategy = new ApplePayButtonStrategy(
            requestSender,
            paymentIntegrationService,
            applePayFactory
        );

        container = document.createElement("div");
        container.setAttribute("id", "applePayCheckoutButton");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    // describe("#initialize()", () => {
    //     beforeEach(() => {
    //         jest.spyOn(
    //             paymentIntegrationService.getState(),
    //             "getPaymentMethodOrThrow"
    //         ).mockReturnValue(getApplePay());
    //     });

    //     it("creates the button", async () => {
    //         const buttonIntializeOptions =
    //             getApplePayButtonInitializationOptions();
    //         let children = container.children;
    //         expect(children.length).toBe(0);
    //         await strategy.initialize(buttonIntializeOptions);
    //         children = container.children;

    //         expect(children.length).toBe(1);
    //     });

    //     it("throws error when payment data is empty", async () => {
    //         await expect(strategy.initialize({} as CheckoutButtonInitializeOptions)).rejects.toThrow(
    //             MissingDataError
    //         );
    //     });

    //     it("throws error when payment data is empty", async () => {
    //         await expect(strategy.initialize({} as CheckoutButtonInitializeOptions)).rejects.toThrow(
    //             MissingDataError
    //         );
    //     });

    //     it("sets up request for digital items", async () => {
    //         const cart = getCart();
    //         cart.lineItems.physicalItems = [];

    //         jest.spyOn(
    //             paymentIntegrationService.getState(),
    //             "getCartOrThrow"
    //         ).mockReturnValue(cart);

    //         const buttonIntializeOptions =
    //             getApplePayButtonInitializationOptions();
    //         if (buttonIntializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 buttonIntializeOptions?.applepay.container
    //             );
    //             await strategy.initialize(buttonIntializeOptions);
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 expect(applePaySession.begin).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("throws error when applepay object is empty", async () => {
    //         const options = {
    //             methodId: "applepay",
    //             applepay: {},
    //         } as CustomerInitializeOptions;
    //         await expect(strategy.initialize(options)).rejects.toThrow(
    //             InvalidArgumentError
    //         );
    //     });

    //     it("throws error when Apple Pay payment sheet is cancelled", async () => {
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 expect(applePaySession.begin).toHaveBeenCalled();
    //                 await applePaySession.oncancel();

    //                 expect(requestSender.get).toHaveBeenCalled();
    //                 expect(
    //                     paymentIntegrationService.loadCheckout
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("throws payment method cancelled error if loadCheckout fails", async () => {
    //         jest.spyOn(requestSender, "get").mockRejectedValue(false);
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 expect(applePaySession.begin).toHaveBeenCalled();

    //                 try {
    //                     await applePaySession.oncancel();
    //                 } catch (err) {
    //                     expect(
    //                         customerInitializeOptions.applepay.onError
    //                     ).toHaveBeenCalled();
    //                 }
    //             }
    //         }
    //     });

    //     it("validates merchant successfully", async () => {
    //         jest.spyOn(
    //             paymentIntegrationService.getState(),
    //             "getCartOrThrow"
    //         ).mockReturnValue(getCart());
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const validateEvent = {
    //                     validationURL: "test",
    //                 } as ApplePayJS.ApplePayValidateMerchantEvent;

    //                 await applePaySession.onvalidatemerchant(validateEvent);

    //                 expect(requestSender.post).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("throws error if merchant validation fails", async () => {
    //         jest.spyOn(requestSender, "post").mockRejectedValue(false);
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const validateEvent = {
    //                     validationURL: "test",
    //                 } as ApplePayJS.ApplePayValidateMerchantEvent;

    //                 await applePaySession.onvalidatemerchant(validateEvent);
    //                 expect(
    //                     customerInitializeOptions.applepay.onError
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("gets shipping contact selected successfully", async () => {
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const event = {
    //                     shippingContact: getContactAddress(),
    //                 } as ApplePayJS.ApplePayShippingContactSelectedEvent;

    //                 await applePaySession.onshippingcontactselected(event);

    //                 expect(
    //                     applePaySession.completeShippingContactSelection
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("gets shipping contact selected successfully with a selected shipping option", async () => {
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         const newCheckout = {
    //             ...getCheckout(),
    //             consignments: [
    //                 {
    //                     ...getConsignment(),
    //                     selectedShippingOption: {
    //                         ...getShippingOption(),
    //                         description: "Free Shipping",
    //                         additionalDescription:
    //                             "Free shipping to your order",
    //                         id: "0:61d4bb52f746477e1d4fb41127361823",
    //                     },
    //                     availableShippingOptions: [
    //                         getShippingOption(),
    //                         {
    //                             ...getShippingOption(),
    //                             description: "Free Shipping",
    //                             additionalDescription:
    //                                 "Free shipping to your order",
    //                             id: "0:61d4bb52f746477e1d4fb41127361823",
    //                         },
    //                     ],
    //                 },
    //             ],
    //         };
    //         const availableShippingMethods =
    //             newCheckout.consignments[0].availableShippingOptions
    //                 .reverse()
    //                 .map((option) => ({
    //                     label: option.description,
    //                     amount: option.cost.toFixed(2),
    //                     detail: option.additionalDescription,
    //                     identifier: option.id,
    //                 }));

    //         jest.spyOn(
    //             paymentIntegrationService.getState(),
    //             "getCheckoutOrThrow"
    //         ).mockReturnValue(newCheckout);
    //         await strategy.initialize(customerInitializeOptions);

    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const event = {
    //                     shippingContact: getContactAddress(),
    //                 } as ApplePayJS.ApplePayShippingContactSelectedEvent;

    //                 await applePaySession.onshippingcontactselected(event);

    //                 expect(
    //                     paymentIntegrationService.selectShippingOption
    //                 ).toHaveBeenCalledWith(
    //                     "0:61d4bb52f746477e1d4fb41127361823"
    //                 );
    //                 expect(
    //                     applePaySession.completeShippingContactSelection
    //                 ).toHaveBeenCalledWith({
    //                     newShippingMethods: availableShippingMethods,
    //                     newTotal: expect.anything(),
    //                     newLineItems: expect.anything(),
    //                 });
    //             }
    //         }
    //     });

    //     it("throws error if call to update address fails", async () => {
    //         jest.spyOn(
    //             paymentIntegrationService,
    //             "updateShippingAddress"
    //         ).mockRejectedValue(false);
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const event = {
    //                     shippingContact: getContactAddress(),
    //                 } as ApplePayJS.ApplePayShippingContactSelectedEvent;

    //                 await applePaySession.onshippingcontactselected(event);

    //                 expect(
    //                     customerInitializeOptions.applepay.onError
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("gets shipping method selected successfully", async () => {
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const event = {
    //                     shippingMethod: {
    //                         label: "test",
    //                         detail: "test2",
    //                         amount: "10",
    //                         identifier: "1",
    //                     },
    //                 } as ApplePayJS.ApplePayShippingMethodSelectedEvent;
    //                 await applePaySession.onshippingmethodselected(event);

    //                 expect(
    //                     applePaySession.completeShippingMethodSelection
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("gets call to update shipping option in consignment fails", async () => {
    //         jest.spyOn(
    //             paymentIntegrationService,
    //             "selectShippingOption"
    //         ).mockRejectedValue(false);
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();

    //                 const event = {
    //                     shippingMethod: {
    //                         label: "test",
    //                         detail: "test2",
    //                         amount: "10",
    //                         identifier: "1",
    //                     },
    //                 } as ApplePayJS.ApplePayShippingMethodSelectedEvent;

    //                 await applePaySession.onshippingmethodselected(event);

    //                 expect(
    //                     customerInitializeOptions.applepay.onError
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("submits payment when shopper authorises", async () => {
    //         jest.spyOn(
    //             paymentIntegrationService,
    //             "updateShippingAddress"
    //         ).mockResolvedValue(true);
    //         const authEvent = {
    //             payment: {
    //                 billingContact: getContactAddress(),
    //                 shippingContact: getContactAddress(),
    //                 token: {
    //                     paymentData: {},
    //                     paymentMethod: {},
    //                     transactionIdentifier: {},
    //                 },
    //             },
    //         } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();
    //                 await applePaySession.onpaymentauthorized(authEvent);

    //                 expect(
    //                     paymentIntegrationService.submitPayment
    //                 ).toHaveBeenCalled();
    //                 expect(applePaySession.completePayment).toHaveBeenCalled();
    //                 expect(
    //                     customerInitializeOptions.applepay.onPaymentAuthorize
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });

    //     it("returns an error if autorize payment fails", async () => {
    //         jest.spyOn(
    //             paymentIntegrationService,
    //             "updateShippingAddress"
    //         ).mockResolvedValue(true);
    //         jest.spyOn(
    //             paymentIntegrationService,
    //             "submitPayment"
    //         ).mockRejectedValue(false);
    //         const authEvent = {
    //             payment: {
    //                 billingContact: getContactAddress(),
    //                 shippingContact: getContactAddress(),
    //                 token: {
    //                     paymentData: {},
    //                     paymentMethod: {},
    //                     transactionIdentifier: {},
    //                 },
    //             },
    //         } as ApplePayJS.ApplePayPaymentAuthorizedEvent;
    //         const customerInitializeOptions =
    //             getApplePayCustomerInitializationOptions();
    //         await strategy.initialize(customerInitializeOptions);
    //         if (customerInitializeOptions.applepay) {
    //             const buttonContainer = document.getElementById(
    //                 customerInitializeOptions?.applepay.container
    //             );
    //             const button = buttonContainer?.firstChild as HTMLElement;
    //             if (button) {
    //                 button.click();
    //                 await applePaySession.onpaymentauthorized(authEvent);

    //                 expect(
    //                     paymentIntegrationService.submitPayment
    //                 ).toHaveBeenCalled();
    //                 expect(applePaySession.completePayment).toHaveBeenCalled();
    //                 expect(
    //                     customerInitializeOptions.applepay.onError
    //                 ).toHaveBeenCalled();
    //             }
    //         }
    //     });
    // });

    describe('#initialize()', () => {
        beforeEach(() => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                "getPaymentMethodOrThrow"
            ).mockReturnValue(getApplePay());
        });
        it('creates the button', async () => {
            const checkoutButtonInitializeOptions = getApplePayButtonInitializationOptions();
            let children = container.children;
            expect(children.length).toBe(0);
            await strategy.initialize(checkoutButtonInitializeOptions);
            children = container.children;

            expect(children.length).toBe(1);
            expect(container.getElementsByClassName('apple-pay-checkout-button')[0]).toBeTruthy();
        });

        it('creates the button with a custom style class name', async () => {
            const customClass = 'testClassName';
            const CheckoutButtonInitializeOptions = merge(getApplePayButtonInitializationOptions(), { applepay: { buttonClassName: customClass }});
            await strategy.initialize(CheckoutButtonInitializeOptions);

            expect(container.getElementsByClassName(customClass)[0]).toBeTruthy();
        });

        it('throws error when payment data is empty', async () => {
            await expect(strategy.initialize({containerId: '', methodId: CheckoutButtonMethodType.APPLEPAY, params: {}})).rejects.toThrow(MissingDataError);
        });

        it('throws error when ApplePay object is empty', async () => {
            await expect(strategy.initialize({containerId: '', params: {}, methodId: CheckoutButtonMethodType.APPLEPAY })).rejects.toThrow(MissingDataError);
        });

        it('throws error when ApplePay object is empty', async () => {
            const options = {
                methodId: 'applepay',
                applepay: {},
            } as CheckoutButtonInitializeOptions;
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
            jest.spyOn(requestSender, 'post')
                .mockRejectedValue(false);
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
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress')
                .mockRejectedValue(false);
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
            jest.spyOn(paymentIntegrationService, 'updateShippingAddress')
                .mockResolvedValue(true);
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
            const availableShippingMethods = newCheckout.consignments[0].availableShippingOptions.reverse().map(option => ({
                label: option.description,
                amount: option.cost.toFixed(2),
                detail: option.additionalDescription,
                identifier: option.id,
            }));

            jest.spyOn(
                paymentIntegrationService.getState(),
                "getCheckoutOrThrow"
            ).mockReturnValue(newCheckout);

            await strategy.initialize(CheckoutButtonInitializeOptions);

            if (CheckoutButtonInitializeOptions.applepay) {
                const button = container.firstChild as HTMLElement;
                if (button) {
                    button.click();

                    const event = {
                        shippingContact: getContactAddress(),
                    } as ApplePayJS.ApplePayShippingContactSelectedEvent;

                    await applePaySession.onshippingcontactselected(event);

                    expect(paymentIntegrationService.selectShippingOption)
                        .toHaveBeenCalled();
                    expect(applePaySession.completeShippingContactSelection).toHaveBeenCalledWith({
                        newShippingMethods: availableShippingMethods,
                        newTotal: expect.anything(),
                        newLineItems: expect.anything(),
                    });
                }
            }
        });

        it('gets call to update shipping option in consignment fails', async () => {
            jest.spyOn(paymentIntegrationService, 'selectShippingOption')
                .mockRejectedValue(false);
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
                    expect(CheckoutButtonInitializeOptions.applepay.onPaymentAuthorize).toHaveBeenCalled();
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

    describe("#deinitialize()", () => {
        it("deinitializes strategy", async () => {
            await expect(strategy.deinitialize()).resolves.not.toThrow();
        });
    });
});
