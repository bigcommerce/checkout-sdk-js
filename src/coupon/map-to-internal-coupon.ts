import Coupon from './coupon';
import InternalCoupon from './internal-coupon';

export default function mapToInternalCoupon(coupon: Coupon, existingCoupon: InternalCoupon): InternalCoupon {
    return {
        code: coupon.code,
        discount: existingCoupon.discount,
        discountType: existingCoupon.discountType,
        name: existingCoupon.name,
    };
}
