import Coupon from './coupon';
import InternalCoupon from './internal-coupon';

const couponTypes = [
    'per_item_discount',
    'percentage_discount',
    'per_total_discount',
    'shipping_discount',
    'free_shipping',
];

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalCoupon(coupon: Coupon): InternalCoupon {
    return {
        code: coupon.code,
        discount: coupon.displayName,
        discountType: couponTypes.indexOf(coupon.couponType),
    };
}
