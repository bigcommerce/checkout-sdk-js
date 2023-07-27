import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { CheckoutButtonSelector } from '../checkout-buttons';
import { ConfigSelector } from '../config';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { ExtensionSelector } from '../extension';
import { FormSelector } from '../form';
import { CountrySelector } from '../geography';
import { OrderSelector } from '../order';
import OrderBillingAddressSelector from '../order-billing-address/order-billing-address-selector';
import { PaymentMethodSelector, PaymentSelector, PaymentStrategySelector } from '../payment';
import { PaymentProviderCustomerSelector } from '../payment-provider-customer';
import { InstrumentSelector } from '../payment/instrument';
import { RemoteCheckoutSelector } from '../remote-checkout';
import {
    ConsignmentSelector,
    PickupOptionSelector,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingStrategySelector,
} from '../shipping';
import { SignInEmailSelector } from '../signin-email';
import { StoreCreditSelector } from '../store-credit';
import { SubscriptionsSelector } from '../subscription';

import CheckoutSelector from './checkout-selector';

export default interface InternalCheckoutSelectors {
    billingAddress: BillingAddressSelector;
    cart: CartSelector;
    checkout: CheckoutSelector;
    checkoutButton: CheckoutButtonSelector;
    config: ConfigSelector;
    consignments: ConsignmentSelector;
    countries: CountrySelector;
    coupons: CouponSelector;
    customer: CustomerSelector;
    customerStrategies: CustomerStrategySelector;
    extensions: ExtensionSelector;
    form: FormSelector;
    giftCertificates: GiftCertificateSelector;
    instruments: InstrumentSelector;
    order: OrderSelector;
    orderBillingAddress: OrderBillingAddressSelector;
    payment: PaymentSelector;
    paymentMethods: PaymentMethodSelector;
    paymentStrategies: PaymentStrategySelector;
    paymentProviderCustomer: PaymentProviderCustomerSelector;
    pickupOptions: PickupOptionSelector;
    remoteCheckout: RemoteCheckoutSelector;
    shippingAddress: ShippingAddressSelector;
    shippingCountries: ShippingCountrySelector;
    shippingStrategies: ShippingStrategySelector;
    signInEmail: SignInEmailSelector;
    subscriptions: SubscriptionsSelector;
    storeCredit: StoreCreditSelector;
}
