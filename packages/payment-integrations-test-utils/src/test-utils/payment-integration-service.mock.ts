import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getAddress, getBillingAddress } from './address.mock';
import getCart from './carts.mock';
import getCheckout from './checkouts.mock';
import getConfig from './config.mock';
import getConsignment from './consignment.mock';
import getCountries from './countries.mock';
import { getCustomer } from './customer.mock';
import { getOrder } from './orders.mock';

const subscribe = jest.fn();
const state = {
    getBillingAddress: jest.fn(() => getBillingAddress()),
    getBillingAddressOrThrow: jest.fn(() => getBillingAddress()),
    getCart: jest.fn(() => getCart()),
    getCartOrThrow: jest.fn(() => getCart()),
    getCheckout: jest.fn(() => getCheckout()),
    getCheckoutOrThrow: jest.fn(() => getCheckout()),
    getConsignments: jest.fn(() => [getConsignment()]),
    getConsignmentsOrThrow: jest.fn(() => [getConsignment()]),
    getCountries: jest.fn(() => getCountries()),
    getCustomer: jest.fn(() => getCustomer()),
    getCustomerOrThrow: jest.fn(() => getCustomer()),
    getHost: jest.fn(),
    getLocale: jest.fn(),
    getOrder: jest.fn(() => getOrder()),
    getOrderOrThrow: jest.fn(() => getOrder()),
    getShippingAddress: jest.fn(() => getAddress()),
    getShippingAddressOrThrow: jest.fn(() => getAddress()),
    getStoreConfig: jest.fn(() => getConfig().storeConfig),
    getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig),
    getPaymentMethod: jest.fn(),
    getPaymentMethodOrThrow: jest.fn(),
    getPaymentStatus: jest.fn(),
};

const createBuyNowCart = jest.fn();
const createHostedForm = jest.fn();
const getState = jest.fn(() => state);
const initializeOffsitePayment = jest.fn();
const loadCheckout = jest.fn();
const loadDefaultCheckout = jest.fn();
const loadPaymentMethod = jest.fn();
const submitOrder = jest.fn();
const submitPayment = jest.fn();
const finalizeOrder = jest.fn();
const updateBillingAddress = jest.fn();
const updateShippingAddress = jest.fn();
const signInCustomer = jest.fn();
const signOutCustomer = jest.fn();
const selectShippingOption = jest.fn();
const applyStoreCredit = jest.fn();
const verifyCheckoutSpamProtection = jest.fn();
const updatePaymentProviderCustomer = jest.fn();

const PaymentIntegrationServiceMock = jest
    .fn<PaymentIntegrationService>()
    .mockImplementation(() => {
        return {
            createBuyNowCart,
            createHostedForm,
            subscribe,
            getState,
            initializeOffsitePayment,
            loadCheckout,
            loadDefaultCheckout,
            loadPaymentMethod,
            submitOrder,
            submitPayment,
            finalizeOrder,
            updateBillingAddress,
            updateShippingAddress,
            signInCustomer,
            signOutCustomer,
            selectShippingOption,
            applyStoreCredit,
            verifyCheckoutSpamProtection,
            updatePaymentProviderCustomer,
        };
    });

export default PaymentIntegrationServiceMock;
