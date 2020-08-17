import { getCart } from '../cart/carts.mock';
import { getDigitalItem, getGiftCertificateItem, getPhysicalItem } from '../cart/line-items.mock';

import { getConsignment } from './consignments.mock';
import getShippableLineItems from './getShippableLineItems';

describe('getShippableLineItems()', () => {
    it('returns empty if only digital items', () => {
        expect(getShippableLineItems({
            ...getCart(),
            lineItems: {
                digitalItems: [ getDigitalItem() ],
                physicalItems: [],
                giftCertificates: [],
            },
        }, []))
            .toHaveLength(0);
    });

    it('returns empty if only gift certificates items', () => {
        expect(getShippableLineItems({
            ...getCart(),
            lineItems: {
                digitalItems: [],
                physicalItems: [],
                giftCertificates: [ getGiftCertificateItem() ],
            },
        }, []))
            .toHaveLength(0);
    });

    it('returns empty if only physical items added by promotions', () => {
        expect(getShippableLineItems({
            ...getCart(),
            lineItems: {
                digitalItems: [],
                physicalItems: [ {
                    ...getPhysicalItem(),
                    addedByPromotion: true,
                }],
                giftCertificates: [],
            },
        }, []))
            .toHaveLength(0);
    });

    it('splits physical items quantities', () => {
        const items = getShippableLineItems({
            ...getCart(),
            lineItems: {
                digitalItems: [],
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        quantity: 2,
                    },
                ],
                giftCertificates: [],
            },
        }, []);

        expect(items).toHaveLength(2);
        expect(items[0]).toMatchObject(expect.objectContaining(getPhysicalItem()));
        expect(items[1]).toMatchObject(expect.objectContaining(getPhysicalItem()));
    });

    it('adds consignment information when available', () => {
        const consignment = {
            ...getConsignment(),
            lineItemIds: [ getPhysicalItem().id as string ],
        };

        const items = getShippableLineItems({
            ...getCart(),
            lineItems: {
                digitalItems: [],
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        quantity: 2,
                    },
                ],
                giftCertificates: [],
            },
        }, [
            consignment,
        ]);

        expect(items[0].consignment).toMatchObject(expect.objectContaining(consignment));
    });
});
