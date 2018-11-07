import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';

import { getResponse } from '../common/http-request/responses.mock';

import CustomerCredentials from './customer-credentials';
import CustomerRequestSender from './customer-request-sender';
import { getCustomerResponseBody } from './internal-customers.mock';

describe('CustomerRequestSender', () => {
    let customerRequestSender: CustomerRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve());
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

        customerRequestSender = new CustomerRequestSender(requestSender);
    });

    describe('#signInCustomer()', () => {
        let credentials: CustomerCredentials;
        let response: Response;

        beforeEach(() => {
            credentials = { email: 'foo@bar.com', password: 'foobar' };
            response = getResponse(getCustomerResponseBody());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('posts customer credentials', async () => {
            const output = await customerRequestSender.signInCustomer(credentials);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                body: credentials,
            });
        });

        it('posts customer credentials with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await customerRequestSender.signInCustomer(credentials, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                ...options,
                body: credentials,
            });
        });
    });

    describe('#signOutCustomer()', () => {
        let response: Response;

        beforeEach(() => {
            response = getResponse(getCustomerResponseBody());

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));
        });

        it('signs out customer', async () => {
            const output = await customerRequestSender.signOutCustomer();

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', { timeout: undefined });
        });

        it('signs out customer with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await customerRequestSender.signOutCustomer(options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', options);
        });
    });
});
