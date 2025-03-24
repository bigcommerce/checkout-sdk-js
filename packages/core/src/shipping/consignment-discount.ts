interface ConsignmentDiscountBase<T> {
    id: number;
    amount: number;
    type: T;
}

interface ConsignmentAutomaticDiscount extends ConsignmentDiscountBase<'AUTOMATIC'> {}

interface ConsignmentCouponDiscount extends ConsignmentDiscountBase<'COUPON'> {
    couponId: number;
    couponCode: string;
}

export type ConsignmentDiscount = ConsignmentAutomaticDiscount | ConsignmentCouponDiscount;
