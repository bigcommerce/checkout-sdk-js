import { CartState } from '../cart';
import { ConfigState } from '../config';
import { CouponState, GiftCertificateState } from '../coupon';
import { CustomerState, CustomerStrategyState } from '../customer';
import { CountryState } from '../geography';
import { OrderState } from '../order';
import { PaymentMethodState, PaymentState, PaymentStrategyState } from '../payment';
import { QuoteState } from '../quote';
import { RemoteCheckoutState } from '../remote-checkout';
import { ConsignmentState, ShippingCountryState, ShippingStrategyState } from '../shipping';

import CheckoutState from './checkout-state';

/**
 * @todo Convert this file into TypeScript properly
 */
export default interface CheckoutStoreState {
    cart: CartState;
    checkout: CheckoutState;
    config: ConfigState;
    countries: CountryState;
    coupons: CouponState;
    consignments: ConsignmentState;
    customer: CustomerState;
    customerStrategies: CustomerStrategyState;
    giftCertificates: GiftCertificateState;
    instruments: any;
    order: OrderState;
    payment: PaymentState;
    paymentMethods: PaymentMethodState;
    paymentStrategies: PaymentStrategyState;
    quote: QuoteState;
    remoteCheckout: RemoteCheckoutState;
    shippingCountries: ShippingCountryState;
    shippingStrategies: ShippingStrategyState;
}
