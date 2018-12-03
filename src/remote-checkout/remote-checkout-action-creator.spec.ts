import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import RemoteCheckoutActionCreator from './remote-checkout-action-creator';
import { RemoteCheckoutActionType } from './remote-checkout-actions';
import RemoteCheckoutRequestSender from './remote-checkout-request-sender';
import { getRemoteBillingResponseBody, getRemotePaymentResponseBody, getRemoteShippingResponseBody } from './remote-checkout.mock';

describe('RemoteCheckoutActionCreator', () => {
    let actionCreator: RemoteCheckoutActionCreator;
    let requestSender: RemoteCheckoutRequestSender;

    beforeEach(() => {
        requestSender = new RemoteCheckoutRequestSender(createRequestSender());
        actionCreator = new RemoteCheckoutActionCreator(requestSender);
    });

    it('initializes billing and emits actions to notify progress', async () => {
        const response = getResponse(getRemoteBillingResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'initializeBilling')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.initializeBilling('amazon', params, options)
            .pipe(toArray())
            .toPromise();

        expect(requestSender.initializeBilling).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemoteBillingRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemoteBillingSucceeded, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize billing', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn(action => of(action));

        jest.spyOn(requestSender, 'initializeBilling')
            .mockReturnValue(Promise.reject(response));

        const actions = await from(actionCreator.initializeBilling('amazon'))
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemoteBillingRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemoteBillingFailed, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('initializes shipping and emits actions to notify progress', async () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'initializeShipping')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.initializeShipping('amazon', params, options)
            .pipe(toArray())
            .toPromise();

        expect(requestSender.initializeShipping).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemoteShippingRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemoteShippingSucceeded, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize shipping', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn(action => of(action));

        jest.spyOn(requestSender, 'initializeShipping')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.initializeShipping('amazon')
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemoteShippingRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemoteShippingFailed, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('initializes payment and emits actions to notify progress', async () => {
        const response = getResponse(getRemotePaymentResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'initializePayment')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.initializePayment('amazon', params, options)
            .pipe(toArray())
            .toPromise();

        expect(requestSender.initializePayment).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemotePaymentRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemotePaymentSucceeded, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize payment', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn(action => of(action));

        jest.spyOn(requestSender, 'initializePayment')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.initializePayment('amazon')
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.InitializeRemotePaymentRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.InitializeRemotePaymentFailed, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('signs out and emits actions to notify progress', async () => {
        const response = getResponse({});
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'signOut')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.signOut('amazon', options)
            .pipe(toArray())
            .toPromise();

        expect(requestSender.signOut).toHaveBeenCalledWith('amazon', options);
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.SignOutRemoteCustomerRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.SignOutRemoteCustomerSucceeded, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to sign out', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn(action => of(action));

        jest.spyOn(requestSender, 'signOut')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.signOut('amazon')
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: RemoteCheckoutActionType.SignOutRemoteCustomerRequested, meta: { methodId: 'amazon' } },
            { type: RemoteCheckoutActionType.SignOutRemoteCustomerFailed, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('returns action to set meta for provider', () => {
        const meta = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };

        expect(actionCreator.updateCheckout('amazon', meta))
            .toEqual({
                type: RemoteCheckoutActionType.UpdateRemoteCheckout,
                payload: meta,
                meta: { methodId: 'amazon' },
            });
    });
});
