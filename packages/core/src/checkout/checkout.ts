import { BillingAddress } from '../billing';
import { Cart } from '../cart';
import { Coupon, GiftCertificate } from '../coupon';
import { Customer } from '../customer';
import { Discount } from '../discount';
import { Promotion } from '../promotion';
import { Consignment } from '../shipping';
import { Tax } from '../tax';

export default interface Checkout {
    id: string;
    billingAddress?: BillingAddress;
    cart: Cart;
    customer: Customer;
    customerMessage: string;
    consignments: Consignment[];
    taxes: Tax[];
    discounts: Discount[];
    isStoreCreditApplied: boolean;
    coupons: Coupon[];
    orderId?: number;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    /**
     * Whether the current checkout must execute spam protection
     * before placing the order.
     *
     * Note: You need to enable Google ReCAPTCHA bot protection in your Checkout Settings.
     */
    shouldExecuteSpamCheck: boolean;
    handlingCostTotal: number;
    taxTotal: number;
    subtotal: number;
    grandTotal: number;
    outstandingBalance: number;
    giftCertificates: GiftCertificate[];
    promotions?: Promotion[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    payments?: CheckoutPayment[];
}

export interface CheckoutRequestBody {
    customerMessage: string;
}

export interface CheckoutPayment {
    detail: {
        step: string;
    };
    providerId: string;
    providerType: string;
    gatewayId?: string;
}
