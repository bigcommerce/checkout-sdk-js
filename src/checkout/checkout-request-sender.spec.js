import { createRequestSender } from '@bigcommerce/request-sender';
import { getCheckout } from './checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';
import CheckoutRequestSender from './checkout-request-sender';

describe('CheckoutRequestSender', () => {
    it('sends request to load checkout', async () => {
        const response = getResponse(getCheckout());
        const requestSender = createRequestSender();
        const checkoutRequestSender = new CheckoutRequestSender(requestSender);

        jest.spyOn(requestSender, 'get').mockReturnValue(response);

        expect(await checkoutRequestSender.loadCheckout()).toEqual(response);
    });
});
