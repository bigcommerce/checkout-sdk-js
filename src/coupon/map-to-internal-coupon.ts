import Coupon from './coupon';
import InternalCoupon from './internal-coupon';

export default function mapToInternalCoupon(coupon: Coupon): InternalCoupon {
    return {
        code: coupon.code,
        discount: coupon.description,
        discountType: coupon.couponType,
    };
}
