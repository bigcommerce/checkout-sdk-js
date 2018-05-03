import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import { PaymentMethodSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector, ShippingStrategySelector } from '../shipping';

export default interface InternalCheckoutSelectors {
    billingAddress: BillingAddressSelector;
    cart: CartSelector;
    config: ConfigSelector;
    country: CountrySelector;
    coupon: CouponSelector;
    customer: CustomerSelector;
    customerStrategy: CustomerStrategySelector;
    form: FormSelector;
    giftCertificate: GiftCertificateSelector;
    instrument: InstrumentSelector;
    order: OrderSelector;
    paymentMethod: PaymentMethodSelector;
    paymentStrategy: PaymentStrategySelector;
    quote: QuoteSelector;
    remoteCheckout: RemoteCheckoutSelector;
    shippingAddress: ShippingAddressSelector;
    shippingCountry: ShippingCountrySelector;
    shippingOption: ShippingOptionSelector;
    shippingStrategy: ShippingStrategySelector;
}
