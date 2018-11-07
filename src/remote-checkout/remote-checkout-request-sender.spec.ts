import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import RemoteCheckoutRequestSender from './remote-checkout-request-sender';
import { getRemoteBillingResponseBody, getRemotePaymentResponseBody, getRemoteShippingResponseBody, getRemoteTokenResponseBody } from './remote-checkout.mock';

describe('RemoteCheckoutRequestSender', () => {
    let remoteCheckoutRequestSender: RemoteCheckoutRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();
        remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    });

    it('sends request to initialize billing', async () => {
        const response = getResponse(getRemoteBillingResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.initializeBilling('amazon', params, options);

        expect(output).toEqual(response);
        expect(requestSender.get).toHaveBeenCalledWith('/remote-checkout/amazon/billing', { ...options, params });
    });

    it('sends request to initialize shipping', async () => {
        const response = getResponse(getRemoteShippingResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.initializeShipping('amazon', params, options);

        expect(output).toEqual(response);
        expect(requestSender.get).toHaveBeenCalledWith('/remote-checkout/amazon/shipping', { ...options, params });
    });

    it('sends request to initialize payment', async () => {
        const response = getResponse(getRemotePaymentResponseBody());
        const params = { referenceId: '511ed7ed-221c-418c-8286-f5102e49220b' };
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.initializePayment('amazon', params, options);

        expect(output).toEqual(response);
        expect(requestSender.get).toHaveBeenCalledWith('/remote-checkout/amazon/payment', { ...options, params });
    });

    it('sends request to sign out from remote checkout provider', async () => {
        const response = getResponse({});
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.signOut('amazon', options);

        expect(output).toEqual(response);
        expect(requestSender.get).toHaveBeenCalledWith('/remote-checkout/amazon/signout', options);
    });

    it('sends request to generate token', async () => {
        const response = getResponse(getRemoteTokenResponseBody());
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.generateToken(options);

        expect(output).toEqual(response);
        expect(requestSender.get).toHaveBeenCalledWith('/remote-checkout-token', options);
    });

    it('sends request to track authorization event', async () => {
        const response = getResponse({});
        const options = { timeout: createTimeout() };

        jest.spyOn(requestSender, 'post').mockReturnValue(response);

        const output = await remoteCheckoutRequestSender.trackAuthorizationEvent(options);

        expect(output).toEqual(response);
        expect(requestSender.post).toHaveBeenCalledWith('/remote-checkout/events/shopper-checkout-service-provider-authorization-requested', options);
    });
});
