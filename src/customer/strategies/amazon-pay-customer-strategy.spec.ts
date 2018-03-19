/// <reference path="../../remote-checkout/methods/amazon-pay/amazon-login.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />

import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';
import { CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import { getResponse } from '../../common/http-request/responses.mock';
import createSignInCustomerService from '../../customer/create-sign-in-customer-service';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import * as paymentMethodActionTypes from '../../payment/payment-method-action-types';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutRequestSender } from '../../remote-checkout';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { getRemoteTokenResponseBody } from '../../remote-checkout/remote-checkout.mock';
import { getGuestCustomer } from '../internal-customers.mock';
import SignInCustomerService from '../sign-in-customer-service';
import AmazonPayCustomerStrategy from './amazon-pay-customer-strategy';

describe('AmazonPayCustomerStrategy', () => {
    let authorizeSpy: jest.Mock;
    let buttonConstructorSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: OffAmazonPayments.HostWindow & amazon.HostWindow;
    let paymentMethod: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let requestSender: RemoteCheckoutRequestSender;
    let scriptLoader: AmazonPayScriptLoader;
    let signInCustomerService: SignInCustomerService;
    let strategy: AmazonPayCustomerStrategy;
    let store: CheckoutStore;

    class Button implements OffAmazonPayments.Button {
        constructor(
            container: string,
            merchantId: string,
            options: OffAmazonPayments.ButtonOptions
        ) {
            const element = document.getElementById(container);

            element.addEventListener('authorize', (event) => {
                options.authorization();
            });

            buttonConstructorSpy(container, merchantId, options);
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class Login implements amazon.Login {
        static authorize(options: amazon.LoginOptions, redirectUrl: string): void {
            authorizeSpy(options, redirectUrl);
        }
    }

    beforeEach(() => {
        authorizeSpy = jest.fn();
        buttonConstructorSpy = jest.fn();
        container = document.createElement('div');
        hostWindow = window;
        paymentMethod = getAmazonPay();
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        requestSender = new RemoteCheckoutRequestSender(createRequestSender());
        store = createCheckoutStore();
        signInCustomerService = createSignInCustomerService(store, createCheckoutClient());
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());
        strategy = new AmazonPayCustomerStrategy(store, signInCustomerService, paymentMethodActionCreator, requestSender, scriptLoader);

        container.setAttribute('id', 'login');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((method, onReady) => {
            hostWindow.OffAmazonPayments = { Button };
            hostWindow.amazon = { Login };

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(requestSender, 'generateToken')
            .mockReturnValue(Promise.resolve(getResponse(getRemoteTokenResponseBody())));

        jest.spyOn(requestSender, 'trackAuthorizationEvent')
            .mockReturnValue(Promise.resolve(getResponse()));

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.of(createAction(paymentMethodActionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod })));
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads payment method', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('amazon');
    });

    it('loads widget script', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(scriptLoader.loadWidget).toHaveBeenCalledWith(paymentMethod, expect.any(Function));
    });

    it('creates login button', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(buttonConstructorSpy).toHaveBeenCalledWith('login', paymentMethod.config.merchantId, {
            authorization: expect.any(Function),
            onError: expect.any(Function),
            color: 'Gold',
            size: 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
        });
    });

    it('only initializes widget once until deinitialization', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(buttonConstructorSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(buttonConstructorSpy).toHaveBeenCalledTimes(2);
    });

    it('generates request token', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        document.getElementById('login')
            .dispatchEvent(new CustomEvent('authorize'));

        expect(requestSender.generateToken).toHaveBeenCalled();
    });

    it('tracks authorization event', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        document.getElementById('login')
            .dispatchEvent(new CustomEvent('authorize'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(requestSender.trackAuthorizationEvent).toHaveBeenCalled();
    });

    it('sends authorization request', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        document.getElementById('login')
            .dispatchEvent(new CustomEvent('authorize'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(authorizeSpy).toHaveBeenCalledWith({
            popup: false,
            scope: 'payments:shipping_address payments:billing_address payments:widget profile',
            state: `${paymentMethod.initializationData.tokenPrefix}cb5eda6a-ab78-4bf1-b849-4a0ab0b0c5a0`,
        }, paymentMethod.initializationData.redirectUrl);
    });

    it('signs out from remote checkout provider', async () => {
        jest.spyOn(store.getState().checkout, 'getCustomer')
            .mockReturnValue({
                ...getGuestCustomer(),
                remote: { provider: 'amazon' },
            });

        jest.spyOn(signInCustomerService, 'remoteSignOut')
            .mockReturnValue(Promise.resolve(store.getState()));

        await strategy.signOut();

        expect(signInCustomerService.remoteSignOut).toHaveBeenCalledWith('amazon', undefined);
    });

    it('does nothing if already signed out from remote checkout provider', async () => {
        jest.spyOn(signInCustomerService, 'remoteSignOut')
            .mockReturnValue(Promise.resolve(store.getState()));

        await strategy.signOut();

        expect(signInCustomerService.remoteSignOut).not.toHaveBeenCalled();
    });

    it('throws error if trying to sign in programmatically', async () => {
        await strategy.initialize({ container: 'login', methodId: 'amazon' });

        expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
    });
});
