import { applyMixin } from '../common/utility';
import { getCart } from '../cart/carts.mock';
import OrderSummarySelectorMixin from './order-summary-selector-mixin';

describe('OrderSummarySelectorMixin', () => {
    class Selector {
        constructor(summary) {
            this._summary = summary;
        }
    }

    beforeEach(() => {
        applyMixin(Selector, OrderSummarySelectorMixin);
    });

    describe('#getItems()', () => {
        it('returns a list of items', () => {
            const selector = new Selector(getCart());

            expect(selector.getItems()).toEqual(getCart().items);
        });

        it('returns an empty array if no data was set', () => {
            const selector = new Selector({});

            expect(selector.getItems()).toEqual([]);
        });
    });

    describe('#getItemsCount()', () => {
        it('returns a valid count', () => {
            const selector = new Selector(getCart());

            expect(selector.getItemsCount()).toEqual(1);
        });

        it('returns 0 if the items list is empty', () => {
            const selector = new Selector({ ...getCart(), items: [] });

            expect(selector.getItemsCount()).toEqual(0);
        });

        it('returns 0 if no data was set', () => {
            const selector = new Selector({});

            expect(selector.getItemsCount()).toEqual(0);
        });
    });

    describe('#getGrandTotal()', () => {
        it('returns the grand total', () => {
            const selector = new Selector(getCart());

            expect(selector.getGrandTotal()).toEqual(200);
        });

        it('returns 0 if the grand total is not set', () => {
            const selector = new Selector({});

            expect(selector.getGrandTotal()).toEqual(0);
        });
    });

    describe('#getSubtotal()', () => {
        it('returns the subtotal', () => {
            const selector = new Selector(getCart());

            expect(selector.getSubtotal()).toEqual(200);
        });

        it('returns 0 if the subtotal is not set', () => {
            const selector = new Selector({});

            expect(selector.getSubtotal()).toEqual(0);
        });
    });

    describe('#getHandlingFee()', () => {
        it('returns the handling fee', () => {
            const selector = new Selector(getCart());

            expect(selector.getHandlingFee()).toEqual(8);
        });

        it('returns 0 if the handling fee is not set', () => {
            const selector = new Selector({});

            expect(selector.getHandlingFee()).toEqual(0);
        });
    });

    describe('#getTaxes()', () => {
        it('returns the taxes', () => {
            const selector = new Selector(getCart());

            expect(selector.getTaxes()).toEqual(getCart().taxes);
        });

        it('returns an empty array if the taxes are not set', () => {
            const selector = new Selector({});

            expect(selector.getTaxes()).toEqual([]);
        });
    });

    describe('#getDiscount()', () => {
        it('returns the discount', () => {
            const selector = new Selector(getCart());

            expect(selector.getDiscount()).toEqual(10.00);
        });

        it('returns 0 if discount is not set', () => {
            const selector = new Selector({});

            expect(selector.getDiscount()).toEqual(0);
        });
    });

    describe('#getCoupon()', () => {
        it('returns the coupon object', () => {
            const selector = new Selector(getCart());

            expect(selector.getCoupons()).toEqual(getCart().coupon.coupons);
        });

        it('returns an empty array if no coupons are defined', () => {
            const selector = new Selector({});

            expect(selector.getCoupons()).toEqual([]);
        });
    });

    describe('#getCouponsDiscountedAmount()', () => {
        it('returns the discounted amount after applying coupons', () => {
            const selector = new Selector(getCart());

            expect(selector.getCouponsDiscountedAmount()).toEqual(5);
        });

        it('returns 0 if no coupons are defined', () => {
            const selector = new Selector({});

            expect(selector.getCouponsDiscountedAmount()).toEqual(0);
        });
    });

    describe('#getGiftCertificates()', () => {
        it('returns the gift certificates', () => {
            const selector = new Selector(getCart());

            expect(selector.getGiftCertificates()).toEqual(getCart().giftCertificate.appliedGiftCertificates);
        });

        it('returns an empty array if no gift certificates are defined', () => {
            const selector = new Selector({});

            expect(selector.getGiftCertificates()).toEqual([]);
        });
    });

    describe('#getShippingCost()', () => {
        it('returns the shipping cost before discount', () => {
            const selector = new Selector(getCart());

            expect(selector.getShippingCost()).toEqual(20);
        });

        it('returns 0 if the shipping cost is not set', () => {
            const selector = new Selector({});

            expect(selector.getShippingCost()).toEqual(0);
        });
    });

    describe('#isShippingRequired()', () => {
        it('returns true if shipping is required', () => {
            const selector = new Selector(getCart());

            expect(selector.isShippingRequired()).toEqual(true);
        });

        it('returns false if shipping is not required', () => {
            const cart = getCart();
            const selector = new Selector({
                ...cart,
                shipping: {
                    ...cart.shipping,
                    required: false,
                },
            });

            expect(selector.isShippingRequired()).toEqual(false);
        });
    });
});
