import Coupon from './coupon';
import InternalCoupon from './internal-coupon';

const couponTypes = [
    'per_item_discount',
    'percentage_discount',
    'per_total_discount',
    'shipping_discount',
    'free_shipping',
];

export default function mapToInternalCoupon(coupon: Coupon): InternalCoupon {
    return {
        code: coupon.code,
        discount: coupon.displayName,
        discountType: couponTypes.indexOf(coupon.couponType),
    };
}
