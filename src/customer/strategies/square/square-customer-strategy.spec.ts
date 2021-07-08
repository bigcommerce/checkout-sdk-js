import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { PaymentMethod } from '../../../payment';
import { getPaymentMethodsState, getSquare } from '../../../payment/payment-methods.mock';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerRequestSender from '../../customer-request-sender';
import { getCustomerState } from '../../customers.mock';
import CustomerStrategy from '../customer-strategy';

import SquareCustomerStrategy from './square-customer-strategy';

describe('SquareCustomerStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let container: HTMLDivElement;
    let customerActionCreator: CustomerActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let store: CheckoutStore;
    let strategy: CustomerStrategy;

    beforeEach(() => {
        paymentMethodMock = { ...getSquare() };

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );

        googleRecaptchaMockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(createScriptLoader(), googleRecaptchaMockWindow);
        googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, new MutationObserverFactory());

        customerActionCreator = new CustomerActionCreator(
            new CustomerRequestSender(createRequestSender()),
            new CheckoutActionCreator(
                new CheckoutRequestSender(createRequestSender()),
                new ConfigActionCreator(new ConfigRequestSender(createRequestSender())),
                new FormFieldsActionCreator(new FormFieldsRequestSender(createRequestSender()))
            ),
            new SpamProtectionActionCreator(
                googleRecaptcha,
                new SpamProtectionRequestSender(createRequestSender())
            )
        );

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(createRequestSender()),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(createRequestSender())
            )
        );

        strategy = new SquareCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            billingAddressActionCreator,
            customerActionCreator
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of SquareCustomerStrategy', () => {
        expect(strategy).toBeInstanceOf(SquareCustomerStrategy);
    });

    describe('#continueAsGuest()', () => {
        it('runs default continue as guest flow', async () => {
            const credentials = { email: 'foo@bar.com' };
            const options = { methodId: 'squarev2' };
            const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

            jest.spyOn(billingAddressActionCreator, 'continueAsGuest')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const output = await strategy.continueAsGuest(credentials, options);

            expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
            expect(output).toEqual(store.getState());
        });
    });

    describe('#signIn()', () => {
        it('throws error if trying to sign in programmatically', () => {
            expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrowError();
        });
    });

    describe('#signOut()', () => {
        beforeEach(() => {
            const paymentId = { providerId: 'squarev2' };

            jest.spyOn(store.getState().payment, 'getPaymentId').mockReturnValue(paymentId);

            jest.spyOn(remoteCheckoutActionCreator, 'signOut')
                .mockReturnValue('data');
        });

        it('throws error if trying to sign out programmatically', async () => {
            const options = { methodId: 'squarev2' };

            await strategy.signOut(options);

            expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('squarev2', options);
            expect(store.dispatch).toHaveBeenCalled();
        });
    });

    describe('#signUp()', () => {
        it('runs default sign up customer flow', async () => {
            const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
            const options = { methodId: 'squarev2' };
            const action = of(createAction(CustomerActionType.CreateCustomerRequested, getQuote()));

            jest.spyOn(customerActionCreator, 'createCustomer')
                .mockReturnValue(action);

            jest.spyOn(store, 'dispatch');

            const output = await strategy.signUp(customerAccount, options);

            expect(customerActionCreator.createCustomer).toHaveBeenCalledWith(customerAccount, options);
            expect(store.dispatch).toHaveBeenCalledWith(action);
            expect(output).toEqual(store.getState());
        });
    });
});
