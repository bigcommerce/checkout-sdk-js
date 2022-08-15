import { Coupon } from "@bigcommerce/checkout-sdk/payment-integration-api";

export function getCoupon(): Coupon {
    return {
        code: "savebig2015",
        displayName: "20% off each item",
        couponType: "percentage_discount",
        discountedAmount: 5,
        id: "1",
    };
}
