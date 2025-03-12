import { omit } from 'lodash';

import { getCart } from '../carts.mock';
import { LineItem } from '../line-item';

import mapToLineItem from './map-to-cart-line-item';
import { headlessLineItem } from './mocks/headless-cart.mock';

describe('mapToLineItem', () => {
    let headlessLineItemResponse: LineItem | undefined;

    beforeEach(() => {
        headlessLineItemResponse = mapToLineItem(headlessLineItem());
    });

    it('maps to line item', () => {
        const {
            lineItems: {
                physicalItems: [firstPhysicalItem],
            },
        } = getCart();

        // TODO:: data is not yet fully compatible due to lack of information
        expect(headlessLineItemResponse).toEqual({
            // omits fields that do not exist to retrieve information via GQL
            ...omit(firstPhysicalItem, ['categoryNames', 'categories', 'isShippingRequired']),
            // default props that are set due lack of information
            addedByPromotion: false,
            comparisonPrice: 0,
            extendedComparisonPrice: 0,
            retailPrice: 0,
        });
    });
});
