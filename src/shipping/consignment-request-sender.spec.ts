import { createRequestSender, createTimeout } from '@bigcommerce/request-sender';

import { getCheckout } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';

import ConsignmentRequestSender from './consignment-request-sender';
import { getConsignmentRequestBody } from './consignments.mock';

describe('ConsignmentRequestSender', () => {
    let consignmentRequestSender: ConsignmentRequestSender;
    const requestSender = createRequestSender();

    const checkoutId = 'foo';
    const consignment = getConsignmentRequestBody();
    const consignments = [{
        // tslint:disable-next-line:no-non-null-assertion
        shippingAddress: consignment.shippingAddress!,
        // tslint:disable-next-line:no-non-null-assertion
        lineItems: consignment.lineItems!,
    }];
    const options = { timeout: createTimeout() };
    const include = [
        'consignments.availableShippingOptions',
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(',');

    beforeEach(() => {
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve({ body: getCheckout() }));
        jest.spyOn(requestSender, 'put').mockReturnValue(Promise.resolve({ body: getCheckout() }));
        jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve({ body: getCheckout() }));

        consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    });

    describe('#createConsignments()', () => {
        it('creates consignments', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/consignments', {
                body: consignments,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });

        it('creates consignments with timeout', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments, options);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/consignments', {
                ...options,
                body: consignments,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });
    });

    describe('#updateConsignment()', () => {
        const { id, ...body } = consignment;

        it('updates a consignment', async () => {
            await consignmentRequestSender.updateConsignment(checkoutId, consignment);

            expect(requestSender.put).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/consignments/${id}`, {
                body,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });

        it('updates a consignment with timeout', async () => {
            await consignmentRequestSender.updateConsignment(checkoutId, consignment, options);

            expect(requestSender.put).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/consignments/${id}`, {
                ...options,
                body,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });
    });

    describe('#deleteConsignment()', () => {
        it('deletes a consignment', async () => {
            await consignmentRequestSender.deleteConsignment(checkoutId, consignment.id);

            expect(requestSender.delete).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/consignments/${consignment.id}`, {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });

        it('deletes a consignment with timeout', async () => {
            await consignmentRequestSender.deleteConsignment(checkoutId, consignment.id, options);

            expect(requestSender.delete).toHaveBeenCalledWith(`/api/storefront/checkouts/foo/consignments/${consignment.id}`, {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include,
                },
            });
        });
    });
});
