import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCartState } from '../cart/internal-carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getCustomerState, getCustomerStrategyState } from '../customer/internal-customers.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getCompleteOrderState } from '../order/internal-orders.mock';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import { getRemoteCheckoutState } from '../remote-checkout/remote-checkout.mock';
import { getConsignment } from '../shipping/consignments.mock';
import { getShippingOptionsState } from '../shipping/internal-shipping-options.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';

import Checkout from './checkout';

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

export function getCheckoutStoreState() {
    return {
        cart: getCartState(),
        config: getConfigState(),
        countries: getCountriesState(),
        customer: getCustomerState(),
        customerStrategies: getCustomerStrategyState(),
        instruments: getInstrumentsState(),
        order: getCompleteOrderState(),
        paymentMethods: getPaymentMethodsState(),
        quote: getQuoteState(),
        remoteCheckout: getRemoteCheckoutState(),
        shippingOptions: getShippingOptionsState(),
        shippingCountries: getShippingCountriesState(),
    };
}
