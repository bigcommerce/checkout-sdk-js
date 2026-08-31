import { BillingAddress } from '../billing';
import { Cart } from '../cart';
import { Coupon, GiftCertificate } from '../coupon';
import { Customer } from '../customer';
import { Discount } from '../discount';
import { Fee } from '../fee';
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
    displayDiscountTotal: number;
    isStoreCreditApplied: boolean;
    coupons: Coupon[];
    orderId?: number;
    giftWrappingCostTotal: number;
    comparisonShippingCost: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    /**
     * Whether the current checkout must execute spam protection
     * before placing the order.
     *
     * Note: **this can be `true` even when the store has no reCAPTCHA
     * configured.** Spam protection is not limited to stores that enable
     * Google reCAPTCHA in Checkout Settings — after repeated order creation
     * attempts on a cart, BigCommerce requires a challenge using its own
     * reCAPTCHA site key, served to you as
     * `checkoutSettings.googleRecaptchaSitekey`. Always render the challenge
     * when this flag is `true` by calling `CheckoutService#executeSpamCheck`;
     * otherwise order creation fails with a 429 and a `spam_protection_failed`
     * error.
     */
    shouldExecuteSpamCheck: boolean;
    handlingCostTotal: number;
    taxTotal: number;
    subtotal: number;
    grandTotal: number;
    outstandingBalance: number;
    orderBasedAutoDiscountTotal: number;
    manualDiscountTotal: number;
    hasOrderLevelAutoDiscountMaxLimitReached?: boolean;
    giftCertificates: GiftCertificate[];
    promotions?: Promotion[];
    balanceDue: number;
    createdTime: string;
    updatedTime: string;
    payments?: CheckoutPayment[];
    channelId: number;
    fees: Fee[];
    totalDiscount: number;
    version: number;
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
