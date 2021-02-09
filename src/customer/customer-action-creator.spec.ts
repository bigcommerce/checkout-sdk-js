import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutActionCreator, CheckoutActionType, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { MutationObserverFactory } from '../common/dom';
import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { getConfig } from '../config/configs.mock';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import { GoogleRecaptcha, GoogleRecaptchaScriptLoader, GoogleRecaptchaWindow, SpamProtectionActionCreator, SpamProtectionActionType, SpamProtectionRequestSender } from '../spam-protection';

import Customer from './customer';
import CustomerActionCreator from './customer-action-creator';
import { CustomerActionType } from './customer-actions';
import CustomerRequestSender from './customer-request-sender';
import { getCustomer } from './customers.mock';
import { InternalCustomerResponseBody } from './internal-customer-responses';
import { getCustomerResponseBody } from './internal-customers.mock';

describe('CustomerActionCreator', () => {
    let customerRequestSender: CustomerRequestSender;
    let checkoutActionCreator: CheckoutActionCreator;
    let customerActionCreator: CustomerActionCreator;
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response<InternalCustomerResponseBody>;
    let customerResponse: Response<Customer>;
    let store: CheckoutStore;

    beforeEach(() => {
        const requestSender = createRequestSender();
        const mockWindow = { grecaptcha: {} } as GoogleRecaptchaWindow;
        const scriptLoader = new ScriptLoader();
        const googleRecaptchaScriptLoader = new GoogleRecaptchaScriptLoader(scriptLoader, mockWindow);
        const mutationObserverFactory = new MutationObserverFactory();
        const googleRecaptcha = new GoogleRecaptcha(googleRecaptchaScriptLoader, mutationObserverFactory);

        response = getResponse(getCustomerResponseBody());
        customerResponse = getResponse(getCustomer());
        errorResponse = getErrorResponse();
        store = createCheckoutStore(getCheckoutStoreState());

        customerRequestSender = new CustomerRequestSender(requestSender);

        jest.spyOn(customerRequestSender, 'createAccount').mockReturnValue(Promise.resolve({}));
        jest.spyOn(customerRequestSender, 'createAddress').mockReturnValue(Promise.resolve(customerResponse));
        jest.spyOn(customerRequestSender, 'signInCustomer').mockReturnValue(Promise.resolve(response));
        jest.spyOn(customerRequestSender, 'signOutCustomer').mockReturnValue(Promise.resolve(response));

        checkoutActionCreator = new CheckoutActionCreator(
            new CheckoutRequestSender(requestSender),
            new ConfigActionCreator(new ConfigRequestSender(requestSender)),
            new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
        );

        jest.spyOn(checkoutActionCreator, 'loadCurrentCheckout')
            .mockReturnValue(() => from([
                createAction(CheckoutActionType.LoadCheckoutRequested),
                createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout()),
            ]));

        spamProtectionActionCreator = new SpamProtectionActionCreator(
            googleRecaptcha,
            new SpamProtectionRequestSender(requestSender)
        );

        jest.spyOn(spamProtectionActionCreator, 'execute')
            .mockReturnValue(() => from([
                createAction(SpamProtectionActionType.ExecuteRequested),
                createAction(SpamProtectionActionType.ExecuteSucceeded, { token: 'token' }),
            ]));

        customerActionCreator = new CustomerActionCreator(
            customerRequestSender,
            checkoutActionCreator,
            spamProtectionActionCreator
        );
    });

    describe('#createCustomer()', () => {
        it('emits actions if able to create customer', async () => {
            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            const actions = await from(customerActionCreator.createCustomer(customer)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.CreateCustomerSucceeded },
            ]);
        });

        it('emits error actions if unable to create customer', async () => {
            jest.spyOn(customerRequestSender, 'createAccount').mockReturnValue(Promise.reject(errorResponse));

            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.createCustomer(customer)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerRequested },
                { type: CustomerActionType.CreateCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('does not execute spam protection if disabled', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
                merge(getConfig().storeConfig, {
                    checkoutSettings: { isStorefrontSpamProtectionEnabled: false },
                })
            );

            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            await from(customerActionCreator.createCustomer(customer)(store))
                .toPromise();

            expect(spamProtectionActionCreator.execute)
                .not.toHaveBeenCalled();

            expect(customerRequestSender.createAccount).toHaveBeenCalledWith({
                ...customer,
                token: undefined,
            }, undefined);
        });

        it('executes spam protection if enabled', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
                merge(getConfig().storeConfig, {
                    checkoutSettings: { isStorefrontSpamProtectionEnabled: true },
                })
            );

            const customer = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            const actions = await from(customerActionCreator.createCustomer(customer)(store))
                .pipe(toArray())
                .toPromise();

            expect(spamProtectionActionCreator.execute)
                .toHaveBeenCalled();

            expect(customerRequestSender.createAccount).toHaveBeenCalledWith({
                ...customer,
                token: 'token',
            }, undefined);

            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerRequested },
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.ExecuteSucceeded, payload: { token: 'token' } },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.CreateCustomerSucceeded },
            ]);
        });
    });

    describe('#createAddress()', () => {
        it('emits actions if able to create customer address', async () => {
            const address = getShippingAddress();

            const actions = await customerActionCreator.createAddress(address)
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerAddressRequested },
                { type: CustomerActionType.CreateCustomerAddressSucceeded, payload: getCustomer() },
            ]);
        });

        it('emits error actions if unable to create customer address', async () => {
            jest.spyOn(customerRequestSender, 'createAddress').mockReturnValue(Promise.reject(errorResponse));

            const address = getShippingAddress();

            const errorHandler = jest.fn(action => of(action));
            const actions = await customerActionCreator.createAddress(address)
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.CreateCustomerAddressRequested },
                { type: CustomerActionType.CreateCustomerAddressFailed, payload: errorResponse, error: true },
            ]);
        });
    });

    describe('#signInCustomer()', () => {
        it('emits actions if able to sign in customer', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const actions = await from(customerActionCreator.signInCustomer(credentials)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignInCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign in customer', async () => {
            jest.spyOn(customerRequestSender, 'signInCustomer').mockReturnValue(Promise.reject(errorResponse));

            const credentials = { email: 'foo@bar.com', password: 'foobar' };
            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.signInCustomer(credentials)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignInCustomerRequested },
                { type: CustomerActionType.SignInCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await from(customerActionCreator.signInCustomer(credentials)(store))
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });

    describe('#signOutCustomer()', () => {
        it('emits actions if able to sign out customer', async () => {
            const actions = await from(customerActionCreator.signOutCustomer()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
                { type: CustomerActionType.SignOutCustomerSucceeded, payload: response.body.data },
            ]);
        });

        it('emits error actions if unable to sign out customer', async () => {
            jest.spyOn(customerRequestSender, 'signOutCustomer').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(customerActionCreator.signOutCustomer()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CustomerActionType.SignOutCustomerRequested },
                { type: CustomerActionType.SignOutCustomerFailed, payload: errorResponse, error: true },
            ]);
        });

        it('emits actions to reload current checkout', async () => {
            const credentials = { email: 'foo@bar.com', password: 'foobar' };

            await from(customerActionCreator.signInCustomer(credentials)(store))
                .toPromise();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
        });
    });
});
