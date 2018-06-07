import { Address } from '../address';
import { Cart } from '../cart';
import { Coupon, GiftCertificate } from '../coupon';
import { Customer } from '../customer';
import { Discount } from '../discount';
import { Promotion } from '../promotion';
import { Consignment } from '../shipping';
import { Tax } from '../tax';

export default interface Checkout {
    id: string;
    cart: Cart;
    customer: Customer;
    customerMessage: string;
    billingAddress: Address;
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    coupons: Coupon[];
    orderId: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    handlingCostTotal: number;
    taxTotal: number;
    subtotal: number;
    grandTotal: number;
    giftCertificates: GiftCertificate[];
    promotions?: Promotion[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    payments?: CheckoutPayment[];
}

export interface CheckoutPayment {
    providerId: string;
    providerType: string;
    gatewayId?: string;
}
