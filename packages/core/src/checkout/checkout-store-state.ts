import { BillingAddressState } from '../billing';
import { CartState } from '../cart';
import { CheckoutButtonState } from '../checkout-buttons';
import { ConfigState } from '../config';
import { CouponState, GiftCertificateState } from '../coupon';
import { CustomerState, CustomerStrategyState } from '../customer';
import { ExtensionState } from '../extension';
import { FormFieldsState } from '../form';
import { CountryState } from '../geography';
import { OrderState } from '../order';
import { OrderBillingAddressState } from '../order-billing-address';
import { PaymentMethodState, PaymentState, PaymentStrategyState } from '../payment';
import { PaymentProviderCustomerState } from '../payment-provider-customer';
import { InstrumentState } from '../payment/instrument';
import { RemoteCheckoutState } from '../remote-checkout';
import {
    ConsignmentState,
    PickupOptionState,
    ShippingCountryState,
    ShippingStrategyState,
} from '../shipping';
import { SignInEmailState } from '../signin-email';
import { StoreCreditState } from '../store-credit';
import { SubscriptionsState } from '../subscription';

import CheckoutState from './checkout-state';

export default interface CheckoutStoreState {
    billingAddress: BillingAddressState;
    cart: CartState;
    checkout: CheckoutState;
    checkoutButton: CheckoutButtonState;
    config: ConfigState;
    countries: CountryState;
    coupons: CouponState;
    consignments: ConsignmentState;
    customer: CustomerState;
    customerStrategies: CustomerStrategyState;
    extensions: ExtensionState;
    formFields: FormFieldsState;
    giftCertificates: GiftCertificateState;
    instruments: InstrumentState;
    order: OrderState;
    orderBillingAddress: OrderBillingAddressState;
    payment: PaymentState;
    paymentMethods: PaymentMethodState;
    paymentProviderCustomer: PaymentProviderCustomerState;
    paymentStrategies: PaymentStrategyState;
    pickupOptions: PickupOptionState;
    remoteCheckout: RemoteCheckoutState;
    shippingCountries: ShippingCountryState;
    shippingStrategies: ShippingStrategyState;
    signInEmail: SignInEmailState;
    subscriptions: SubscriptionsState;
    storeCredit: StoreCreditState;
}
