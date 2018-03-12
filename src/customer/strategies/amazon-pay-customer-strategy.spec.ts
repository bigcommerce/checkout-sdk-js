/// <reference path="../../remote-checkout/methods/amazon-pay/amazon-login.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />

import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { PaymentMethod } from '../../payment';
import { RemoteCheckoutRequestSender } from '../../remote-checkout';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { getGuestCustomer } from '../internal-customers.mock';
import { getRemoteTokenResponseBody } from '../../remote-checkout/remote-checkout.mock';
import { getResponse } from '../../common/http-request/responses.mock';
import AmazonPayCustomerStrategy from './amazon-pay-customer-strategy';
import SignInCustomerService from '../sign-in-customer-service';
import createSignInCustomerService from '../../customer/create-sign-in-customer-service';

describe('AmazonPayCustomerStrategy', () => {
    let authorizeSpy: jest.Mock;
    let buttonConstructorSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: OffAmazonPayments.HostWindow & amazon.HostWindow;
    let paymentMethod: PaymentMethod;
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
        requestSender = new RemoteCheckoutRequestSender(createRequestSender());
        store = createCheckoutStore();
        signInCustomerService = createSignInCustomerService(store, createCheckoutClient());
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());
        strategy = new AmazonPayCustomerStrategy(store, signInCustomerService, requestSender, scriptLoader);

        container.setAttribute('id', 'login');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation(() => {
            hostWindow.OffAmazonPayments = { Button };
            hostWindow.amazon = { Login };
            hostWindow.onAmazonPaymentsReady();

            return Promise.resolve();
        });

        jest.spyOn(requestSender, 'generateToken')
            .mockReturnValue(Promise.resolve(getResponse(getRemoteTokenResponseBody())));

        jest.spyOn(requestSender, 'trackAuthorizationEvent')
            .mockReturnValue(Promise.resolve(getResponse()));
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads widget script', async () => {
        await strategy.initialize({ container: 'login', paymentMethod });

        expect(scriptLoader.loadWidget).toHaveBeenCalledWith(paymentMethod);
    });

    it('creates login button', async () => {
        await strategy.initialize({ container: 'login', paymentMethod });

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
        await strategy.initialize({ container: 'login', paymentMethod });
        await strategy.initialize({ container: 'login', paymentMethod });

        expect(buttonConstructorSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ container: 'login', paymentMethod });

        expect(buttonConstructorSpy).toHaveBeenCalledTimes(2);
    });

    it('resolves with current state after initialization', async () => {
        jest.spyOn(signInCustomerService, 'initializeCustomer');

        const output = await strategy.initialize({ container: 'login', paymentMethod });

        expect(output).toEqual(store.getState());
        expect(signInCustomerService.initializeCustomer).toHaveBeenCalledWith(paymentMethod.id, expect.any(Function));
    });

    it('generates request token', async () => {
        await strategy.initialize({ container: 'login', paymentMethod });

        document.getElementById('login')
            .dispatchEvent(new CustomEvent('authorize'));

        expect(requestSender.generateToken).toHaveBeenCalled();
    });

    it('tracks authorization event', async () => {
        await strategy.initialize({ container: 'login', paymentMethod });

        document.getElementById('login')
            .dispatchEvent(new CustomEvent('authorize'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(requestSender.trackAuthorizationEvent).toHaveBeenCalled();
    });

    it('sends authorization request', async () => {
        await strategy.initialize({ container: 'login', paymentMethod });

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
        await strategy.initialize({ container: 'login', paymentMethod });

        expect(() => strategy.signIn({ email: 'foo@bar.com', password: 'foobar' })).toThrow();
    });
});
