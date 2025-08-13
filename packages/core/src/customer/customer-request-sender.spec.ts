import {
    createRequestSender,
    createTimeout,
    RequestSender,
    Response,
} from '@bigcommerce/request-sender';

import { SDK_VERSION_HEADERS } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import CustomerAccountRequestBody, { CustomerAddressRequestBody } from './customer-account';
import CustomerCredentials from './customer-credentials';
import CustomerRequestSender from './customer-request-sender';
import { InternalCustomerResponseBody } from './internal-customer-responses';
import { getCustomerResponseBody } from './internal-customers.mock';

describe('CustomerRequestSender', () => {
    let customerRequestSender: CustomerRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve());
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

        customerRequestSender = new CustomerRequestSender(requestSender);
    });

    describe('#createAccount()', () => {
        let customerAccount: CustomerAccountRequestBody;
        let response: Response<InternalCustomerResponseBody>;

        beforeEach(() => {
            customerAccount = {
                email: 'foo@bar.com',
                password: 'foobar',
                firstName: 'first',
                lastName: 'last',
            };

            response = getResponse(getCustomerResponseBody());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('posts customer credentials', async () => {
            const output = await customerRequestSender.createAccount(customerAccount);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/customer', {
                body: customerAccount,
                headers: SDK_VERSION_HEADERS,
            });
        });

        it('posts customer credentials with timeout', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.createAccount(customerAccount, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/customer', {
                ...options,
                body: customerAccount,
            });
        });
    });

    describe('#createAddress()', () => {
        let customerAddress: CustomerAddressRequestBody;
        let response: Response<InternalCustomerResponseBody>;

        beforeEach(() => {
            customerAddress = getShippingAddress();

            response = getResponse(getCustomerResponseBody());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));
        });

        it('posts customer credentials', async () => {
            const output = await customerRequestSender.createAddress(customerAddress);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/customer-address', {
                body: customerAddress,
                headers: SDK_VERSION_HEADERS,
            });
        });

        it('posts customer credentials with timeout', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.createAddress(customerAddress, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/customer-address', {
                ...options,
                body: customerAddress,
            });
        });
    });

    describe('#signInCustomer()', () => {
        let credentials: CustomerCredentials;
        let response: Response<InternalCustomerResponseBody>;

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
                headers: SDK_VERSION_HEADERS,
            });
        });

        it('posts customer credentials with timeout', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.signInCustomer(credentials, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                ...options,
                body: credentials,
            });
        });

        it('posts customer credentials with timeout and cartId', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.signInCustomer(
                { ...credentials, cartId: 'test' },
                options,
            );

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                ...options,
                body: { ...credentials, cartId: 'test' },
            });
        });
    });

    describe('#signOutCustomer()', () => {
        let response: Response<InternalCustomerResponseBody>;

        beforeEach(() => {
            response = getResponse(getCustomerResponseBody());

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));
        });

        it('signs out customer', async () => {
            const output = await customerRequestSender.signOutCustomer();

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                timeout: undefined,
                headers: SDK_VERSION_HEADERS,
            });
        });

        it('signs out customer with timeout', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.signOutCustomer(options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith(
                '/internalapi/v1/checkout/customer',
                options,
            );
        });

        it('signs out customer with timeout and calls with cart id', async () => {
            const options = { timeout: createTimeout(), headers: SDK_VERSION_HEADERS };
            const output = await customerRequestSender.signOutCustomer(options, 'test');

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                ...options,
                body: { cartId: 'test' },
            });
        });
    });
});
