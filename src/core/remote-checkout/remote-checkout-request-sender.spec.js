import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';
import { getRemoteBillingResponseBody, getRemoteShippingResponseBody, getRemotePaymentResponseBody } from './remote-checkout.mock';
import { getResponse } from '../common/http-request/responses.mock';
import RemoteCheckoutRequestSender from './remote-checkout-request-sender';

describe('RemoteCheckoutRequestSender', () => {
    let remoteCheckoutRequestSender;
    let requestSender;

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
});
