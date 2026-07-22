import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { B2BTokenRequestSender } from '../b2b-token';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';
import { getGuestCustomer } from '../customer/customers.mock';

import B2BPaymentsRefreshActionCreator from './b2b-payments-refresh-action-creator';
import { B2BPaymentsRefreshActionType } from './b2b-payments-refresh-actions';
import B2BPaymentsRefreshRequestSender from './b2b-payments-refresh-request-sender';
import PaymentMethod from './payment-method';

describe('B2BPaymentsRefreshActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BPaymentsRefreshRequestSender;
    let b2bTokenRequestSender: B2BTokenRequestSender;
    let actionCreator: B2BPaymentsRefreshActionCreator;

    const b2bApiSettings = {
        clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
        baseUrl: 'https://api-b2b.bigcommerce.com',
    };

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'cheque',
            method: 'check',
            type: 'PAYMENT_TYPE_OFFLINE',
            supportedCards: [],
            config: { displayName: 'Check' },
            skipRedirectConfirmationAlert: false,
        },
        {
            id: 'stripe-card',
            method: 'credit-card',
            type: 'PAYMENT_TYPE_API',
            supportedCards: [],
            gateway: 'stripev3',
            config: {},
            skipRedirectConfirmationAlert: false,
        },
        {
            id: 'no-display-no-gateway',
            method: 'credit-card',
            type: 'PAYMENT_TYPE_API',
            supportedCards: [],
            config: {},
            skipRedirectConfirmationAlert: false,
        },
    ];

    beforeEach(() => {
        store = createCheckoutStore({
            ...getCheckoutStoreState(),
            b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
            paymentMethods: {
                data: paymentMethods,
                errors: {},
                statuses: {},
            },
        });

        requestSender = new B2BPaymentsRefreshRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'refresh').mockResolvedValue(getResponse({}));

        b2bTokenRequestSender = new B2BTokenRequestSender(createRequestSender());

        jest.spyOn(b2bTokenRequestSender, 'getCurrentCustomerJWT').mockResolvedValue(
            'bc-jwt-token',
        );

        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            b2bApiSettings,
        });

        actionCreator = new B2BPaymentsRefreshActionCreator(requestSender, b2bTokenRequestSender);
    });

    describe('#refreshB2BPaymentMethods()', () => {
        it('emits requested and succeeded actions on success', async () => {
            const actions = await from(actionCreator.refreshB2BPaymentMethods()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested },
                { type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsSucceeded },
            ]);
        });

        it('calls refresh with payments mapped from payment methods state', async () => {
            await from(actionCreator.refreshB2BPaymentMethods()(store)).toPromise();

            expect(requestSender.refresh).toHaveBeenCalledWith(
                [
                    { code: 'cheque', name: 'Check' },
                    { code: 'stripe-card', name: 'stripev3' },
                    { code: 'no-display-no-gateway', name: '' },
                ],
                { b2bToken: 'b2b-auth-token', bcToken: undefined },
                b2bApiSettings.baseUrl,
                undefined,
            );
        });

        it('sends an empty array when no payment methods are loaded', async () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
                paymentMethods: { errors: {}, statuses: {} },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            await from(actionCreator.refreshB2BPaymentMethods()(store)).toPromise();

            expect(requestSender.refresh).toHaveBeenCalledWith(
                [],
                { b2bToken: 'b2b-auth-token', bcToken: undefined },
                b2bApiSettings.baseUrl,
                undefined,
            );
        });

        it('forwards request options to the request sender', async () => {
            const options = { timeout: undefined, params: { foo: 'bar' } };

            await from(actionCreator.refreshB2BPaymentMethods(options)(store)).toPromise();

            expect(requestSender.refresh).toHaveBeenCalledWith(
                expect.any(Array),
                { b2bToken: 'b2b-auth-token', bcToken: undefined },
                b2bApiSettings.baseUrl,
                options,
            );
        });

        it('refreshes without a token when the customer is a guest', async () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                customer: { data: getGuestCustomer(), errors: {}, statuses: {} },
                paymentMethods: {
                    data: paymentMethods,
                    errors: {},
                    statuses: {},
                },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            const actions = await from(actionCreator.refreshB2BPaymentMethods()(store))
                .pipe(toArray())
                .toPromise();

            expect(b2bTokenRequestSender.getCurrentCustomerJWT).not.toHaveBeenCalled();
            expect(requestSender.refresh).toHaveBeenCalledWith(
                expect.any(Array),
                { b2bToken: undefined, bcToken: undefined },
                b2bApiSettings.baseUrl,
                undefined,
            );
            expect(actions).toEqual([
                { type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested },
                { type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsSucceeded },
            ]);
        });

        it('refreshes with a bc token when a signed-in customer has no b2b token', async () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                paymentMethods: {
                    data: paymentMethods,
                    errors: {},
                    statuses: {},
                },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            await from(actionCreator.refreshB2BPaymentMethods()(store)).toPromise();

            expect(b2bTokenRequestSender.getCurrentCustomerJWT).toHaveBeenCalledWith(
                b2bApiSettings.clientId,
            );
            expect(requestSender.refresh).toHaveBeenCalledWith(
                expect.any(Array),
                { b2bToken: undefined, bcToken: 'bc-jwt-token' },
                b2bApiSettings.baseUrl,
                undefined,
            );
        });

        it('throws when the b2b base url is missing', () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings: { ...b2bApiSettings, baseUrl: '' },
            });

            expect(() => actionCreator.refreshB2BPaymentMethods()(store)).toThrow();
        });

        it('emits failed action when the request rejects', async () => {
            jest.spyOn(requestSender, 'refresh').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.refreshB2BPaymentMethods()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsRequested },
                expect.objectContaining({
                    type: B2BPaymentsRefreshActionType.RefreshB2BPaymentMethodsFailed,
                    error: true,
                }),
            ]);
        });
    });
});
