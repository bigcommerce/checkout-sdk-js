import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getBillingAddressState } from '../billing/internal-billing-addresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCartState } from '../cart/internal-carts.mock';
import { getConfigState } from '../config/configs.mock';
import { getGiftCertificate } from '../coupon/gift-certificates.mock';
import { getGuestCustomer } from '../customer/customers.mock';
import { getCustomerState, getCustomerStrategyState } from '../customer/internal-customers.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getCompleteOrderState } from '../order/internal-orders.mock';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { HOSTED } from '../payment/payment-method-types';
import { getPaymentMethod, getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import { getRemoteCheckoutState, getRemoteCheckoutStateData } from '../remote-checkout/remote-checkout.mock';
import { getConsignment, getConsignmentState } from '../shipping/consignments.mock';
import { getShippingOptionsState } from '../shipping/internal-shipping-options.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';

import Checkout from './checkout';
import CheckoutState from './checkout-state';

export function getCheckout(): Checkout {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        cart: getCart(),
        customer: getGuestCustomer(),
        customerMessage: '',
        billingAddress: getBillingAddress(),
        consignments: [
            getConsignment(),
        ],
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        discounts: [],
        coupons: [],
        orderId: 295,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        taxTotal: 0,
        subtotal: 190,
        grandTotal: 190,
        giftCertificates: [
            getGiftCertificate(),
        ],
        balanceDue: 0,
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
        promotions: [
            {
                banners: [
                    {
                        type: 'upsell',
                        text: 'foo',
                    },
                ],
            },
        ],
    };
}

export function getCheckoutWithPayments(): Checkout {
    return {
        ...getCheckout(),
        payments: [
            {
                providerId: getPaymentMethod().id,
                gatewayId: getPaymentMethod().gateway,
                providerType: HOSTED,
                detail: {
                    step: 'ACKNOWLEDGE',
                },
            },
        ],
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
        remoteCheckout: getRemoteCheckoutStateData(),
    };
}

export function getCheckoutStoreState() {
    return {
        billingAddress: getBillingAddressState(),
        cart: getCartState(),
        checkout: getCheckoutState(),
        config: getConfigState(),
        consignments: getConsignmentState(),
        countries: getCountriesState(),
        customer: getCustomerState(),
        customerStrategies: getCustomerStrategyState(),
        instruments: getInstrumentsState(),
        order: getCompleteOrderState(),
        paymentMethods: getPaymentMethodsState(),
        quote: getQuoteState(),
        remoteCheckout: getRemoteCheckoutState(),
        shippingCountries: getShippingCountriesState(),
    };
}
