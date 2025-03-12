import { omit } from 'lodash';

import { getCart } from '../carts.mock';
import { LineItemMap } from '../index';

import mapToCartLineItems from './map-to-cart-line-items';
import { getHeadlessCartResponse } from './mocks/headless-cart.mock';

describe('mapToCartLinesItem', () => {
    let headlessCartLineItemsResponse: LineItemMap | undefined;

    beforeEach(() => {
        const {
            data: {
                site: { cart },
            },
        } = getHeadlessCartResponse();

        headlessCartLineItemsResponse = mapToCartLineItems(
            cart?.lineItems ?? {
                physicalItems: [],
                digitalItems: [],
                giftCertificates: [],
                customItems: [],
            },
        );
    });

    it('maps to cart line items', () => {
        const {
            lineItems: {
                physicalItems: [firstPhysicalItem],
            },
        } = getCart();

        // TODO:: data is not yet fully compatible due to lack of information
        const physicalItem = {
            // omits fields that do not exist to retrieve information via GQL
            ...omit(firstPhysicalItem, ['categoryNames', 'categories']),
            // default props that are set due lack of information
            addedByPromotion: false,
            comparisonPrice: 0,
            extendedComparisonPrice: 0,
            retailPrice: 0,
        };

        expect(headlessCartLineItemsResponse).toEqual({
            physicalItems: [physicalItem],
            digitalItems: [],
            giftCertificates: [],
            customItems: [],
        });
    });
});
