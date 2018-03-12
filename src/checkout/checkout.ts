import { Address } from '../address';
import { Cart } from '../cart';
import { Consignment } from '../shipping';
import { Coupon, GiftCertificate } from '../coupon';
import { Discount } from '../discount';
import { Shopper } from '../customer';
import { Tax } from '../tax';

export default interface Checkout {
    id: string;
    cart: Cart;
    billingAddress: Address;
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    coupons: Coupon[];
    orderId: number;
    shippingCostTotal: number;
    taxTotal: number;
    grandTotal: number;
    storeCredit: number;
    giftCertificates: GiftCertificate[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    shopper?: Shopper;
}
