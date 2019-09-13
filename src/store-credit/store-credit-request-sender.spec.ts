import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import StoreCreditRequestSender from './store-credit-request-sender';

describe('StoreCredit Request Sender', () => {
    let storeCreditRequestSender: StoreCreditRequestSender;
    let requestSender: RequestSender;
    const defaultIncludes = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'customer.customerGroup',
        'payments',
        'promotions.banners',
    ].join(',');

    beforeEach(() => {
        requestSender = createRequestSender();
        storeCreditRequestSender = new StoreCreditRequestSender(requestSender);
    });

    it('storeCreditRequestSender is defined', () => {
        expect(storeCreditRequestSender).toBeDefined();
    });

    const checkoutId = 'checkoutId1234';

    describe('#applyStoreCredit()', () => {
        it('applies store credit', async () => {
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await storeCreditRequestSender.applyStoreCredit(checkoutId);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/store-credit', {
                params: {
                    include: defaultIncludes,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });

        it('applies store credit with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await storeCreditRequestSender.applyStoreCredit(checkoutId, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/store-credit', {
                ...options,
                params: {
                    include: defaultIncludes,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });

    describe('#removeStoreCredit()', () => {
        it('removes store credit', async () => {
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await storeCreditRequestSender.removeStoreCredit(checkoutId);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/store-credit', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });

        it('removes store credit with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckout());
            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await storeCreditRequestSender.removeStoreCredit(checkoutId, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/store-credit', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });
    });
});
