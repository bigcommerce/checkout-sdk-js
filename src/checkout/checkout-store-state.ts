import { CustomerStrategyState } from '../customer';
import { PaymentStrategyState } from '../payment';
import { RemoteCheckoutState } from '../remote-checkout';
import { ShippingStrategyState } from '../shipping';

/**
 * @todo Convert this file into TypeScript properly
 */
export default interface CheckoutStoreState {
    cart: any;
    config: any;
    countries: any;
    coupons: any;
    customer: any;
    customerStrategy: CustomerStrategyState;
    giftCertificates: any;
    instruments: any;
    order: any;
    payment: any;
    paymentMethods: any;
    paymentStrategy: PaymentStrategyState;
    quote: any;
    remoteCheckout: RemoteCheckoutState;
    shippingCountries: any;
    shippingOptions: any;
    shippingStrategy: ShippingStrategyState;
}
