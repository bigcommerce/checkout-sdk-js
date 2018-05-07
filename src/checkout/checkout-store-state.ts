import { CartState } from '../cart';
import { ConfigState } from '../config';
import { CouponState, GiftCertificateState } from '../coupon';
import { CustomerState, CustomerStrategyState } from '../customer';
import { CountryState } from '../geography';
import { OrderState } from '../order';
import { PaymentMethodState, PaymentState, PaymentStrategyState } from '../payment';
import { RemoteCheckoutState } from '../remote-checkout';
import { ShippingCountryState, ShippingStrategyState } from '../shipping';

/**
 * @todo Convert this file into TypeScript properly
 */
export default interface CheckoutStoreState {
    cart: CartState;
    config: ConfigState;
    countries: CountryState;
    coupons: CouponState;
    customer: CustomerState;
    customerStrategies: CustomerStrategyState;
    giftCertificates: GiftCertificateState;
    instruments: any;
    order: OrderState;
    payment: PaymentState;
    paymentMethods: PaymentMethodState;
    paymentStrategies: PaymentStrategyState;
    quote: any;
    remoteCheckout: RemoteCheckoutState;
    shippingCountries: ShippingCountryState;
    shippingOptions: any;
    shippingStrategies: ShippingStrategyState;
}
