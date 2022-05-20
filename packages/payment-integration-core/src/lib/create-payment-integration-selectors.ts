import { clone, InternalCheckoutSelectors } from '@bigcommerce/checkout-sdk/core'; // eslint-disable-line import/no-unresolved

import PaymentIntegrationSelectors from './payment-integration-selectors';

export default function createPaymentIntegrationSelectors({
    billingAddress: {
        getBillingAddress,
        getBillingAddressOrThrow,
    },
    cart: {
        getCart,
        getCartOrThrow,
    },
    checkout: {
        getCheckout,
        getCheckoutOrThrow,
    },
    config: {
        getStoreConfig,
        getStoreConfigOrThrow,
    },
    consignments: {
        getConsignments,
        getConsignmentsOrThrow,
    },
    customer: {
        getCustomer,
        getCustomerOrThrow,
    },
    instruments: {
        getCardInstrument,
        getCardInstrumentOrThrow,
    },
    order: {
        getOrder,
        getOrderOrThrow,
    },
    payment: {
        getPaymentToken,
        getPaymentTokenOrThrow,
        getPaymentId,
        getPaymentIdOrThrow,
        getPaymentStatus,
        getPaymentStatusOrThrow,
        getPaymentRedirectUrl,
        getPaymentRedirectUrlOrThrow,
        isPaymentDataRequired,
    },
    paymentMethods: {
        getPaymentMethod,
        getPaymentMethodOrThrow,
    },
    paymentStrategies: {
        isInitialized: isPaymentMethodInitialized,
    },
    shippingAddress: {
        getShippingAddress,
        getShippingAddressOrThrow,
    },
}: InternalCheckoutSelectors): PaymentIntegrationSelectors {
    return {
        getBillingAddress: clone(getBillingAddress),
        getBillingAddressOrThrow: clone(getBillingAddressOrThrow),
        getCart: clone(getCart),
        getCartOrThrow: clone(getCartOrThrow),
        getCheckout: clone(getCheckout),
        getCheckoutOrThrow: clone(getCheckoutOrThrow),
        getStoreConfig: clone(getStoreConfig),
        getStoreConfigOrThrow: clone(getStoreConfigOrThrow),
        getConsignments: clone(getConsignments),
        getConsignmentsOrThrow: clone(getConsignmentsOrThrow),
        getCustomer: clone(getCustomer),
        getCustomerOrThrow: clone(getCustomerOrThrow),
        getCardInstrument: clone(getCardInstrument),
        getCardInstrumentOrThrow: clone(getCardInstrumentOrThrow),
        getOrder: clone(getOrder),
        getOrderOrThrow: clone(getOrderOrThrow),
        getPaymentToken,
        getPaymentTokenOrThrow,
        getPaymentId,
        getPaymentIdOrThrow,
        getPaymentStatus,
        getPaymentStatusOrThrow,
        getPaymentRedirectUrl,
        getPaymentRedirectUrlOrThrow,
        getPaymentMethod: clone(getPaymentMethod),
        getPaymentMethodOrThrow: clone(getPaymentMethodOrThrow),
        getShippingAddress: clone(getShippingAddress),
        getShippingAddressOrThrow: clone(getShippingAddressOrThrow),
        isPaymentDataRequired,
        isPaymentMethodInitialized,
    };
}
