import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getBillingAddressState } from '../billing/internal-billing-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCartState } from '../cart/internal-carts.mock';
import { getCompleteOrderState } from '../order/internal-orders.mock';
import { getConfigState } from '../config/configs.mock';
import { getConsignment } from '../shipping/consignments.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getCustomerState } from '../customer/internal-customers.mock';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import { getRemoteCheckoutMeta, getRemoteCheckoutState } from '../remote-checkout/remote-checkout.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';
import { getShippingOptionsState } from '../shipping/internal-shipping-options.mock';
import Checkout from './checkout';
import CheckoutState from './checkout-state';

export function getCheckout(): Checkout {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        cart: getCart(),
        billingAddress: getBillingAddress(),
        consignments: [
            getConsignment(),
        ],
        taxes: [],
        discounts: [],
        coupons: [],
        orderId: 295,
        shippingCostTotal: 15,
        taxTotal: 0,
        grandTotal: 190,
        storeCredit: 0,
        giftCertificates: [],
        balanceDue: 0,
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}

export function getCheckoutState(): CheckoutState {
    return {
        data: getCheckout(),
        errors: {},
        statuses: {},
    };
}

export function getCheckoutMeta() {
    return {
        remoteCheckout: getRemoteCheckoutMeta(),
    };
}

export function getCheckoutStoreState() {
    return {
        billingAddress: getBillingAddressState(),
        cart: getCartState(),
        checkout: getCheckoutState(),
        config: getConfigState(),
        countries: getCountriesState(),
        customer: getCustomerState(),
        instruments: getInstrumentsState(),
        order: getCompleteOrderState(),
        paymentMethods: getPaymentMethodsState(),
        quote: getQuoteState(),
        remoteCheckout: getRemoteCheckoutState(),
        shippingCountries: getShippingCountriesState(),
        shippingOptions: getShippingOptionsState(),
    };
}
