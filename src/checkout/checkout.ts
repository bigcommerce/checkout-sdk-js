import { Address } from '../address';
import { Cart } from '../cart';
import { Coupon, GiftCertificate } from '../coupon';
import { Customer } from '../customer';
import { Discount } from '../discount';
import { Consignment } from '../shipping';
import { Tax } from '../tax';

export default interface Checkout {
    id: string;
    cart: Cart;
    customer: Customer;
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
}
