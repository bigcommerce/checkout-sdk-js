import { PaymentIntegrationService } from "@bigcommerce/checkout-sdk/payment-integration-api";

import getCart from "./carts.mock";
import getCheckout from "./checkouts.mock";
import getConfig from "./config.mock";

const subscribe = jest.fn();
const state = {
    getCartOrThrow: jest.fn(() => getCart()),
    getCheckoutOrThrow: jest.fn(() => getCheckout()),
    getHost: jest.fn(),
    getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig),
    getPaymentMethodOrThrow: jest.fn(),
};

const getState = jest.fn(() => state);
const loadCheckout = jest.fn();
const loadDefaultCheckout = jest.fn();
const loadPaymentMethod = jest.fn();
const loadCurrentOrder = jest.fn();
const submitOrder = jest.fn();
const submitPayment = jest.fn();
const finalizeOrder = jest.fn();
const updateBillingAddress = jest.fn();
const updateShippingAddress = jest.fn();
const signOut = jest.fn();
const selectShippingOption = jest.fn();

const PaymentIntegrationServiceMock = jest
    .fn<PaymentIntegrationService>()
    .mockImplementation(() => {
        return {
            subscribe,
            getState,
            loadCheckout,
            loadDefaultCheckout,
            loadPaymentMethod,
            loadCurrentOrder,
            submitOrder,
            submitPayment,
            finalizeOrder,
            updateBillingAddress,
            updateShippingAddress,
            signOut,
            selectShippingOption,
        };
    });

export default PaymentIntegrationServiceMock;
