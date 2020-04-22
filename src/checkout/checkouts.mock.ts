import { getBillingAddress, getBillingAddressState } from '../billing/billing-addresses.mock';
import { getCart, getCartState } from '../cart/carts.mock';
import { getCheckoutButtonState } from '../checkout-buttons/checkout-buttons.mock';
import { getConfigState } from '../config/configs.mock';
import { getCoupon, getCouponsState, getShippingCoupon } from '../coupon/coupons.mock';
import { getGiftCertificate, getGiftCertificatesState } from '../coupon/gift-certificates.mock';
import { getCustomer, getCustomerState } from '../customer/customers.mock';
import { getCustomerStrategyState } from '../customer/internal-customers.mock';
import { getCountriesState } from '../geography/countries.mock';
import { getOrderState } from '../order/orders.mock';
import { ACKNOWLEDGE, HOSTED } from '../payment';
import { getInstrumentsState } from '../payment/instrument/instrument.mock';
import { getPaymentMethod, getPaymentMethodsState } from '../payment/payment-methods.mock';
import { getPaymentState } from '../payment/payments.mock';
import { getRemoteCheckoutState } from '../remote-checkout/remote-checkout.mock';
import { getConsignment, getConsignmentsState } from '../shipping/consignments.mock';
import { getShippingCountriesState } from '../shipping/shipping-countries.mock';

import Checkout, { CheckoutPayment } from './checkout';
import CheckoutState from './checkout-state';
import CheckoutStoreState from './checkout-store-state';

export function getCheckout(): Checkout {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        cart: getCart(),
        customer: getCustomer(),
        customerMessage: 'comment',
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
        isStoreCreditApplied: false,
        shouldExecuteSpamCheck: false,
        orderId: 295,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        taxTotal: 3,
        subtotal: 190,
        grandTotal: 190,
        outstandingBalance: 190,
        giftCertificates: [],
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
            getCheckoutPayment(),
        ],
    };
}

export function getCheckoutWithCoupons(): Checkout {
    return {
        ...getCheckout(),
        coupons: [
            getCoupon(),
            getShippingCoupon(),
        ],
    };
}

export function getCheckoutWithGiftCertificates(): Checkout {
    return {
        ...getCheckout(),
        giftCertificates: [
            getGiftCertificate(),
            { ...getGiftCertificate(), code: 'gc2' },
        ],
    };
}

export function getCheckoutPayment(): CheckoutPayment {
    return {
        providerId: getPaymentMethod().id,
        gatewayId: getPaymentMethod().gateway,
        providerType: HOSTED,
        detail: {
            step: ACKNOWLEDGE,
        },
    };
}

export function getCheckoutState(): CheckoutState {
    return {
        data: getCheckout(),
        errors: {},
        statuses: {},
    };
}

export function getCheckoutStoreState(): CheckoutStoreState {
    return {
        billingAddress: getBillingAddressState(),
        cart: getCartState(),
        checkout: getCheckoutState(),
        checkoutButton: getCheckoutButtonState(),
        config: getConfigState(),
        consignments: getConsignmentsState(),
        countries: getCountriesState(),
        coupons: getCouponsState(),
        customer: getCustomerState(),
        customerStrategies: getCustomerStrategyState(),
        giftCertificates: getGiftCertificatesState(),
        instruments: getInstrumentsState(),
        order: { errors: {}, statuses: {} },
        payment: getPaymentState(),
        paymentMethods: getPaymentMethodsState(),
        paymentStrategies: { data: {}, errors: {}, statuses: {} },
        remoteCheckout: getRemoteCheckoutState(),
        shippingCountries: getShippingCountriesState(),
        shippingStrategies: { data: {}, errors: {}, statuses: {} },
        subscriptions: { errors: {}, statuses: {} },
        signInEmail: { errors: {}, statuses: {} },
        storeCredit: { errors: {}, statuses: {} },
    };
}

export function getCheckoutStoreStateWithOrder(): CheckoutStoreState {
    return {
        ...getCheckoutStoreState(),
        order: getOrderState(),
    };
}
