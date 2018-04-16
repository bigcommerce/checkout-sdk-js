import { createTimeout } from '@bigcommerce/request-sender';
import ConsignmentRequestSender from './consignment-request-sender';
import { getConsignmentRequestBody } from './consignments.mock';
import { getCheckout } from '../checkout/checkouts.mock';

describe('ConsignmentRequestSender', () => {
    let consignmentRequestSender;
    let requestSender;

    const checkoutId = 'foo';
    const consignments = [
        getConsignmentRequestBody(),
    ];

    beforeEach(() => {
        requestSender = {
            post: jest.fn(() => Promise.resolve()),
        };

        consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    });

    describe('#createConsignments()', () => {
        let response;
        beforeEach(() => {
            response = {
                body: getCheckout(),
            };

            requestSender.post.mockReturnValue(Promise.resolve(response));
        });

        it('creates consignments', async () => {
            await consignmentRequestSender.createConsignments(checkoutId, consignments);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/consignments', {
                body: consignments,
                params: {
                    include: 'consignments.availableShippingOptions',
                },
            });
        });

        it('creates consignments with timeout', async () => {
            const options = { timeout: createTimeout() };
            await consignmentRequestSender.createConsignments(checkoutId, consignments, options);

            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/foo/consignments', {
                ...options,
                body: consignments,
                params: {
                    include: 'consignments.availableShippingOptions',
                },
            });
        });
    });
});
