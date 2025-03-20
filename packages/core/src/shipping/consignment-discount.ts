enum ConsignmentDiscountType {
    Automatic = 'AUTOMATIC',
    Coupon = 'COUPON',
}

interface ConsignmentDiscountBase {
    id: number;
    amount: number;
    type: ConsignmentDiscountType;
}

interface ConsignmentAutomaticDiscount extends ConsignmentDiscountBase {
    type: ConsignmentDiscountType.Automatic;
}

interface ConsignmentCouponDiscount extends ConsignmentDiscountBase {
    type: ConsignmentDiscountType.Coupon;
    couponId: number;
    couponCode: string;
}

export type ConsignmentDiscount = ConsignmentAutomaticDiscount | ConsignmentCouponDiscount;
