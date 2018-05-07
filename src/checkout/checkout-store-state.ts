import { CartState } from '../cart';
import { ConfigState } from '../config';
import { CouponState, GiftCertificateState } from '../coupon';
import { CustomerStrategyState } from '../customer';
import { PaymentStrategyState } from '../payment';
import { RemoteCheckoutState } from '../remote-checkout';
import { ShippingStrategyState } from '../shipping';

/**
 * @todo Convert this file into TypeScript properly
 */
export default interface CheckoutStoreState {
    cart: CartState;
    config: ConfigState;
    countries: any;
    coupons: CouponState;
    customer: any;
    customerStrategies: CustomerStrategyState;
    giftCertificates: GiftCertificateState;
    instruments: any;
    order: any;
    payment: any;
    paymentMethods: any;
    paymentStrategies: PaymentStrategyState;
    quote: any;
    remoteCheckout: RemoteCheckoutState;
    shippingCountries: any;
    shippingOptions: any;
    shippingStrategies: ShippingStrategyState;
}
