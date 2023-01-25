import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckout, getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import {
    createPaymentClient,
    PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../../../payment';
import { PaymentActionType, SubmitPaymentAction } from '../../../payment/payment-actions';
import { ApplePaySessionFactory } from '../../../payment/strategies/apple-pay';
import { MockApplePaySession } from '../../../payment/strategies/apple-pay/apple-pay-payment.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { getConsignment } from '../../../shipping/consignments.mock';
import { getShippingOption } from '../../../shipping/shipping-options.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import {
    getApplePayCustomerInitializationOptions,
    getContactAddress,
} from './apple-pay-customer-mock';

import { ApplePayCustomerStrategy } from '.';

describe('ApplePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let paymentClient: OrderRequestSender;
    let applePaySession: MockApplePaySession;
    let paymentActionCreator: PaymentActionCreator;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let consignmentActionCreator: ConsignmentActionCreator;
    let orderActionCreator: OrderActionCreator;
    let applePayFactory: ApplePaySessionFactory;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let checkoutActionCreator: CheckoutActionCreator;

    beforeEach(() => {
        applePaySession = new MockApplePaySession();

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: applePaySession,
        });

        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = createRequestSender();
        paymentClient = createPaymentClient(store);
        applePayFactory = new ApplePaySessionFactory();
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender),
        );

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        );

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            checkoutActionCreator,
        );

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
        );

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(
            of(createAction(OrderActionType.SubmitOrderRequested)),
        );
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );
        jest.spyOn(requestSender, 'post').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(true);
        jest.spyOn(billingAddressActionCreator, 'updateAddress').mockReturnValue(true);
        jest.spyOn(applePayFactory, 'create').mockReturnValue(applePaySession);
        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout').mockReturnValue(true);
        jest.spyOn(remoteCheckoutActionCreator, 'signOut').mockReturnValue(true);

        strategy = new ApplePayCustomerStrategy(
            store,
            checkoutActionCreator,
            requestSender,
            paymentMethodActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
            remoteCheckoutActionCreator,
            orderActionCreator,
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
        it('creates the button', async () => {
            const customerInitializeOptions = getApplePayCustomerInitializationOptions();
            let children = container.children;

            expect(children).toHaveLength(0);

            await strategy.initialize(customerInitializeOptions);
            children = container.children;

            expect(children).toHaveLength(1);
        });

        it('throws error when payment data is empty', async () => {
            await expect(strategy.initialize({})).rejects.toThrow(MissingDataError);
        });

        it('throws error when applepay object is empty', async () => {
            await expect(strategy.initialize({ methodId: 'applepay' })).rejects.toThrow(
                MissingDataError,
            );
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

                    expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalled();
                    expect(checkoutActionCreator.loadCurrentCheckout).toHaveBeenCalled();
                }
            }
        });

        it('validates merchant successfully', async () => {
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

            jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue(
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

                    expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
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

            jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue(
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
            jest.spyOn(consignmentActionCreator, 'updateAddress').mockRejectedValue(false);

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
            jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockRejectedValue(false);

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

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(
                        customerInitializeOptions.applepay.onPaymentAuthorize,
                    ).toHaveBeenCalled();
                }
            }
        });

        it('returns an error if autorize payment fails', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment').mockRejectedValue(false);

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

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
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

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
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
});
