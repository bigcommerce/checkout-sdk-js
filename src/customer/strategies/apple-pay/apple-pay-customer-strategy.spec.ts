import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs/internal/observable/of';
import { Observable } from 'rxjs/internal/Observable';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import { createPaymentClient, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentRequestSender, PaymentRequestTransformer } from '../../../payment';
// eslint-disable-next-line import/no-internal-modules
import { PaymentActionType, SubmitPaymentAction } from '../../../payment/payment-actions';
import { getApplePay } from '../../../payment/payment-methods.mock';
import { ApplePaySessionFactory } from '../../../payment/strategies/apple-pay';
import { MockApplePaySession } from '../../../payment/strategies/apple-pay/apple-pay-payment.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerStrategy from '../customer-strategy';

import { ApplePayCustomerStrategy } from '.';
import { getApplePayCustomerInitializationOptions } from './apple-pay-customer-mock';

describe('ApplePayCustomerStrategy', () => {
    let container: HTMLDivElement;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;
    let paymentClient: OrderRequestSender;
    let paymentMethod: PaymentMethod;
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
        paymentMethod = getApplePay();
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

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());
        jest.spyOn(requestSender, 'post')
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

    describe('#iniialize', () => {});

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
