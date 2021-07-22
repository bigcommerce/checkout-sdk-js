import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutState, CheckoutStore, CheckoutStoreState } from '../../../checkout';
import { getCheckoutStoreState, getCheckoutWithPayments } from '../../../checkout/checkouts.mock';
import { MutationObserverFactory } from '../../../common/dom';
import { MissingDataError } from '../../../common/error/errors';
import { getErrorResponse, getResponse } from '../../../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import { HOSTED, INITIALIZE, PaymentMethod, PaymentMethodActionCreator, PaymentMethodActionType, PaymentMethodRequestSender } from '../../../payment';
import { getAmazonPay } from '../../../payment/payment-methods.mock';
import { AmazonPayLogin, AmazonPayLoginButton, AmazonPayLoginButtonOptions, AmazonPayLoginOptions, AmazonPayScriptLoader, AmazonPayWindow } from '../../../payment/strategies/amazon-pay';
import { getQuote } from '../../../quote/internal-quotes.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { getRemoteTokenResponseBody } from '../../../remote-checkout/remote-checkout.mock';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../../../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerRequestSender from '../../customer-request-sender';
import CustomerStrategy from '../customer-strategy';

import AmazonPayCustomerStrategy from './amazon-pay-customer-strategy';

describe('AmazonPayCustomerStrategy', () => {
    let authorizeSpy: jest.Mock;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let buttonConstructorSpy: jest.Mock;
    let container: HTMLDivElement;
    let customerActionCreator: CustomerActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let googleRecaptchaMockWindow: GoogleRecaptchaWindow;
    let googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader;
    let hostWindow: AmazonPayWindow;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let remoteCheckoutRequestSender: RemoteCheckoutRequestSender;

    let scriptLoader: AmazonPayScriptLoader;
    let strategy: CustomerStrategy;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    class MockLoginButton implements AmazonPayLoginButton {
        constructor(
            container: string,
            merchantId: string,
            options: AmazonPayLoginButtonOptions
        ) {
            const element = document.getElementById(container);

            if (element) {
                element.addEventListener('authorize', _ => {
                    if (options.authorization) {
                        options.authorization();
                    }
                });
            }

            buttonConstructorSpy(container, merchantId, options);
        }
    }

    const MockLogin: AmazonPayLogin = {
        authorize(options: AmazonPayLoginOptions, redirectUrl: string) {
            authorizeSpy(options, redirectUrl);
        },
        setClientId() {},
        setUseCookie() {},
    };

    beforeEach(() => {
        authorizeSpy = jest.fn();
        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(createRequestSender()),
            new SubscriptionsActionCreator(
                new SubscriptionsRequestSender(createRequestSender())
            )
        );
        buttonConstructorSpy = jest.fn();
        container = document.createElement('div');
        hostWindow = window;
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
        paymentMethod = getAmazonPay();
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(createRequestSender()));
        remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(createRequestSender());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender);
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());
        strategy = new AmazonPayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            remoteCheckoutRequestSender,
            scriptLoader,
            billingAddressActionCreator,
            customerActionCreator
        );

        container.setAttribute('id', 'login');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((_, onReady) => {
            hostWindow.OffAmazonPayments = { Button: MockLoginButton } as any;
            hostWindow.amazon = { Login: MockLogin };

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(remoteCheckoutRequestSender, 'generateToken')
            .mockReturnValue(Promise.resolve(getResponse(getRemoteTokenResponseBody())));

        jest.spyOn(remoteCheckoutRequestSender, 'trackAuthorizationEvent')
            .mockReturnValue(Promise.resolve(getResponse('')));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod)));
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads payment method', async () => {
        const action = of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('amazon');
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('throws error if payment method is unavailable', async () => {
        const response = getErrorResponse();

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(of(createErrorAction(PaymentMethodActionType.LoadPaymentMethodFailed, response)));

        try {
            await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });
        } catch (error) {
            expect(error).toEqual(response);
        }
    });

    it('loads widget script', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        expect(scriptLoader.loadWidget).toHaveBeenCalledWith(paymentMethod, expect.any(Function));
    });

    it('creates login button', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        expect(buttonConstructorSpy).toHaveBeenCalledWith('login', paymentMethod.config.merchantId, {
            authorization: expect.any(Function),
            onError: expect.any(Function),
            color: 'Gold',
            size: 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
        });
    });

    it('throws error if unable to create login button', async () => {
        paymentMethod = { ...paymentMethod, config: { merchantId: undefined } };

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod)));

        try {
            await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('generates request token', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        const element = document.getElementById('login');

        if (element) {
            element.dispatchEvent(new CustomEvent('authorize'));
        }

        expect(remoteCheckoutRequestSender.generateToken).toHaveBeenCalled();
    });

    it('tracks authorization event', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        const element = document.getElementById('login');

        if (element) {
            element.dispatchEvent(new CustomEvent('authorize'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(remoteCheckoutRequestSender.trackAuthorizationEvent).toHaveBeenCalled();
    });

    it('sends authorization request', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        const element = document.getElementById('login');

        if (element) {
            element.dispatchEvent(new CustomEvent('authorize'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(authorizeSpy).toHaveBeenCalledWith({
            popup: false,
            scope: 'payments:shipping_address payments:billing_address payments:widget profile',
            state: `${paymentMethod.initializationData.tokenPrefix}cb5eda6a-ab78-4bf1-b849-4a0ab0b0c5a0`,
        }, paymentMethod.initializationData.redirectUrl);
    });

    it('signs out from remote checkout provider', async () => {
        const action = of(createAction(RemoteCheckoutActionType.SignOutRemoteCustomerSucceeded));

        store = createCheckoutStore({
            ...state,
            checkout: {
                ...state.checkout,
                data: {
                    ...getCheckoutWithPayments(),
                    payments: [{
                        providerId: 'amazon',
                        providerType: HOSTED,
                        detail: { step: INITIALIZE },
                    }],
                },
            } as CheckoutState,
        });

        strategy = new AmazonPayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            remoteCheckoutRequestSender,
            scriptLoader,
            billingAddressActionCreator,
            customerActionCreator
        );

        jest.spyOn(store, 'dispatch');

        jest.spyOn(remoteCheckoutActionCreator, 'signOut')
            .mockReturnValue(action);

        await strategy.signOut();

        expect(remoteCheckoutActionCreator.signOut).toHaveBeenCalledWith('amazon', undefined);
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('does nothing if already signed out from remote checkout provider', async () => {
        const action = of(createAction(RemoteCheckoutActionType.SignOutRemoteCustomerSucceeded));

        jest.spyOn(remoteCheckoutActionCreator, 'signOut')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        await strategy.signOut();

        expect(remoteCheckoutActionCreator.signOut).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalledWith(action);
    });

    it('throws error if trying to sign in programmatically', async () => {
        await strategy.initialize({ methodId: 'amazon', amazon: { container: 'login' } });

        expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
    });

    it('runs default continue as guest flow', async () => {
        const credentials = { email: 'foo@bar.com' };
        const options = { methodId: 'amazon' };
        const action = of(createAction(BillingAddressActionType.ContinueAsGuestRequested, getQuote()));

        jest.spyOn(billingAddressActionCreator, 'continueAsGuest')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.continueAsGuest(credentials, options);

        expect(billingAddressActionCreator.continueAsGuest).toHaveBeenCalledWith(credentials, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('runs default sign up customer flow', async () => {
        const customerAccount = { firstName: 'foo', lastName: 'bar', email: 'foo@bar.com', password: 'foobar' };
        const options = { methodId: 'amazon' };
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
