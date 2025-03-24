interface ConsignmentDiscountBase {
    id: number;
    amount: number;
}

interface ConsignmentAutomaticDiscount extends ConsignmentDiscountBase {
    type: 'AUTOMATIC';
}

interface ConsignmentCouponDiscount extends ConsignmentDiscountBase {
    type: 'COUPON';
    couponId: number;
    couponCode: string;
}

export type ConsignmentDiscount = ConsignmentAutomaticDiscount | ConsignmentCouponDiscount;
