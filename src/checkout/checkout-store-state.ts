import { CartState } from '../cart';
import { CustomerStrategyState } from '../customer';
import { PaymentStrategyState } from '../payment';
import { RemoteCheckoutState } from '../remote-checkout';
import { ShippingStrategyState } from '../shipping';

/**
 * @todo Convert this file into TypeScript properly
 */
export default interface CheckoutStoreState {
    cart: CartState;
    config: any;
    countries: any;
    coupons: any;
    customer: any;
    customerStrategies: CustomerStrategyState;
    giftCertificates: any;
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
