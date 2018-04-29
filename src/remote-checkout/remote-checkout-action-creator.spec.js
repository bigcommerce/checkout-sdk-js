import { Observable } from 'rxjs';
import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';
import { getRemoteBillingResponseBody, getRemoteShippingResponseBody, getRemotePaymentResponseBody } from './remote-checkout.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './remote-checkout-action-types';
import RemoteCheckoutActionCreator from './remote-checkout-action-creator';
import RemoteCheckoutRequestSender from './remote-checkout-request-sender';

describe('RemoteCheckoutActionCreator', () => {
    let actionCreator;
    let requestSender;

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
            .toArray()
            .toPromise();

        expect(requestSender.initializeBilling).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize billing', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn((action) => Observable.of(action));

        jest.spyOn(requestSender, 'initializeBilling')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.initializeBilling('amazon')
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_BILLING_FAILED, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('initializes shipping and emits actions to notify progress', async () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'initializeShipping')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.initializeShipping('amazon', params, options)
            .toArray()
            .toPromise();

        expect(requestSender.initializeShipping).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize shipping', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn((action) => Observable.of(action));

        jest.spyOn(requestSender, 'initializeShipping')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.initializeShipping('amazon')
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('initializes payment and emits actions to notify progress', async () => {
        const response = getResponse(getRemotePaymentResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'initializePayment')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.initializePayment('amazon', params, options)
            .toArray()
            .toPromise();

        expect(requestSender.initializePayment).toHaveBeenCalledWith('amazon', params, options);
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED, payload: response.body, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to initialize payment', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn((action) => Observable.of(action));

        jest.spyOn(requestSender, 'initializePayment')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.initializePayment('amazon')
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('signs out and emits actions to notify progress', async () => {
        const response = getResponse();
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'signOut')
            .mockReturnValue(Promise.resolve(response));

        const actions = await actionCreator.signOut('amazon', options)
            .toArray()
            .toPromise();

        expect(requestSender.signOut).toHaveBeenCalledWith('amazon', options);
        expect(actions).toEqual([
            { type: actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED, meta: { methodId: 'amazon' } },
        ]);
    });

    it('emits error action if unable to sign out', async () => {
        const response = getErrorResponse();
        const errorHandler = jest.fn((action) => Observable.of(action));

        jest.spyOn(requestSender, 'signOut')
            .mockReturnValue(Promise.reject(response));

        const actions = await actionCreator.signOut('amazon')
            .catch(errorHandler)
            .toArray()
            .toPromise();

        expect(errorHandler).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED, meta: { methodId: 'amazon' } },
            { type: actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED, error: true, payload: response, meta: { methodId: 'amazon' } },
        ]);
    });

    it('returns action to set meta for provider', () => {
        const meta = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };

        expect(actionCreator.updateCheckout('amazon', meta))
            .toEqual({
                type: actionTypes.UPDATE_REMOTE_CHECKOUT,
                payload: meta,
                meta: { methodId: 'amazon' },
            });
    });
});
