import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingStrategySelector } from '../shipping';
import { ConsignmentSelector } from '../shipping';

import CheckoutSelector from './checkout-selector';

export default interface InternalCheckoutSelectors {
    billingAddress: BillingAddressSelector;
    cart: CartSelector;
    checkout: CheckoutSelector;
    config: ConfigSelector;
    consignments: ConsignmentSelector;
    countries: CountrySelector;
    coupons: CouponSelector;
    customer: CustomerSelector;
    customerStrategies: CustomerStrategySelector;
    form: FormSelector;
    giftCertificates: GiftCertificateSelector;
    instruments: InstrumentSelector;
    order: OrderSelector;
    payment: PaymentSelector;
    paymentMethods: PaymentMethodSelector;
    paymentStrategies: PaymentStrategySelector;
    remoteCheckout: RemoteCheckoutSelector;
    shippingAddress: ShippingAddressSelector;
    shippingCountries: ShippingCountrySelector;
    shippingStrategies: ShippingStrategySelector;
}
