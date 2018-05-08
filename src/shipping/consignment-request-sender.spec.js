import { createTimeout } from '@bigcommerce/request-sender';
import { ContentType } from '../common/http-request';
import ConsignmentRequestSender from './consignment-request-sender';
import { getConsignmentRequestBody } from './consignments.mock';
import { getCheckout } from '../checkout/checkouts.mock';

describe('ConsignmentRequestSender', () => {
    let consignmentRequestSender;
    let requestSender;

    const checkoutId = 'foo';
    const consignment = getConsignmentRequestBody();
    const consignments = [consignment];
    const options = { timeout: createTimeout() };

    beforeEach(() => {
        requestSender = {
            post: jest.fn(() => Promise.resolve({ body: getCheckout() })),
            put: jest.fn(() => Promise.resolve({ body: getCheckout() })),
        };

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
                    include: 'consignments.availableShippingOptions',
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
                    include: 'consignments.availableShippingOptions',
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
                    include: 'consignments.availableShippingOptions',
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
                    include: 'consignments.availableShippingOptions',
                },
            });
        });
    });
});
