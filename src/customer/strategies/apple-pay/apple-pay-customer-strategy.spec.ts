import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { createPaymentClient, PaymentActionCreator, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentRequestSender, PaymentRequestTransformer } from '../../../payment';
import { PaymentMethodCancelledError } from '../../../payment/errors';
// eslint-disable-next-line import/no-internal-modules
import { PaymentActionType, SubmitPaymentAction } from '../../../payment/payment-actions';
import { ApplePaySessionFactory } from '../../../payment/strategies/apple-pay';
import { MockApplePaySession } from '../../../payment/strategies/apple-pay/apple-pay-payment.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import { CustomerInitializeOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import { ApplePayCustomerStrategy } from '.';
import { getApplePayCustomerInitializationOptions, getContactAddress } from './apple-pay-customer-mock';

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
            new CheckoutRequestSender(requestSender)
        );

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(requestSender)
            )
        );

        orderActionCreator = new OrderActionCreator(
            paymentClient,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );

        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(paymentClient),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender)
        );

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(of(createAction(OrderActionType.SubmitOrderRequested)));
        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());
        jest.spyOn(requestSender, 'post')
            .mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(true);
        jest.spyOn(consignmentActionCreator, 'selectShippingOption')
            .mockReturnValue(true);
        jest.spyOn(billingAddressActionCreator, 'updateAddress')
            .mockReturnValue(true);
        jest.spyOn(applePayFactory, 'create')
            .mockReturnValue(applePaySession);

        strategy = new ApplePayCustomerStrategy(
            store,
            requestSender,
            paymentMethodActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
            orderActionCreator,
            applePayFactory
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
                    expect(() => applePaySession.oncancel()).toThrow(PaymentMethodCancelledError);
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

        it('throws error if call to update address fails', async () => {
            jest.spyOn(consignmentActionCreator, 'updateAddress')
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

                    expect(customerInitializeOptions.applepay.onError).toHaveBeenCalled()
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
            jest.spyOn(consignmentActionCreator, 'selectShippingOption')
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

                    expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
                    expect(applePaySession.completePayment).toHaveBeenCalled();
                    expect(customerInitializeOptions.applepay.onPaymentAuthorize).toHaveBeenCalled();
                }
            }
        });

        it('returns an error if autorize payment fails', async () => {
            jest.spyOn(paymentActionCreator, 'submitPayment')
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

            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
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
