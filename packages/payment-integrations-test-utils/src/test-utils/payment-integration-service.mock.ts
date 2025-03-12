import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getAddress } from './address.mock';
import getBillingAddress from './billing-address.mock';
import getCart from './carts.mock';
import getCheckout from './checkouts.mock';
import getConfig from './config.mock';
import getConsignment from './consignment.mock';
import getCountries from './countries.mock';
import { getCustomer } from './customer.mock';
import { getOrder, getOrderMeta } from './orders.mock';
import getPaymentId from './payment-id.mock';
import { getCardInstrument, getInstruments } from './payments.mock';

const subscribe = jest.fn();
const state = {
    getBillingAddress: jest.fn(() => getBillingAddress()),
    getBillingAddressOrThrow: jest.fn(() => getBillingAddress()),
    getCart: jest.fn(() => getCart()),
    getCartOrThrow: jest.fn(() => getCart()),
    getCardInstrument: jest.fn(() => getCardInstrument()),
    getCardInstrumentOrThrow: jest.fn(() => getCardInstrument()),
    getInstruments: jest.fn(() => getInstruments()),
    getInstrumentsMeta: jest.fn(),
    getCheckout: jest.fn(() => getCheckout()),
    getCheckoutOrThrow: jest.fn(() => getCheckout()),
    getConsignments: jest.fn(() => [getConsignment()]),
    getConsignmentsOrThrow: jest.fn(() => [getConsignment()]),
    getContextConfig: jest.fn(() => getConfig().context),
    getCountries: jest.fn(() => getCountries()),
    getCustomer: jest.fn(() => getCustomer()),
    getCustomerOrThrow: jest.fn(() => getCustomer()),
    getHost: jest.fn(),
    getLocale: jest.fn(),
    getOrder: jest.fn(() => getOrder()),
    getOrderOrThrow: jest.fn(() => getOrder()),
    getOrderMeta: jest.fn(() => getOrderMeta()),
    getShippingAddress: jest.fn(() => getAddress()),
    getShippingAddressOrThrow: jest.fn(() => getAddress()),
    getShippingAddresses: jest.fn(() => [getAddress()]),
    getShippingAddressesOrThrow: jest.fn(() => [getAddress()]),
    getShippingCountries: jest.fn(() => getCountries()),
    getConfig: jest.fn(() => getConfig()),
    getStoreConfig: jest.fn(() => getConfig().storeConfig),
    getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig),
    getPaymentId: jest.fn(() => getPaymentId()),
    getPaymentIdOrThrow: jest.fn(() => getPaymentId()),
    getPaymentMethod: jest.fn(),
    getPaymentMethodOrThrow: jest.fn(),
    getPaymentMethodsMeta: jest.fn(),
    getPaymentProviderCustomer: jest.fn(),
    getPaymentProviderCustomerOrThrow: jest.fn(),
    getPaymentStatus: jest.fn(),
    getPaymentStatusOrThrow: jest.fn(),
    getPaymentToken: jest.fn(),
    getPaymentTokenOrThrow: jest.fn(),
    isPaymentMethodInitialized: jest.fn(),
    getOutstandingBalance: jest.fn(),
    getPaymentRedirectUrl: jest.fn(),
    getPaymentRedirectUrlOrThrow: jest.fn(),
    isPaymentDataRequired: jest.fn(),
};

const createBuyNowCart = jest.fn(() => Promise.resolve(getCart()));
const createHostedForm = jest.fn();
const forgetCheckout = jest.fn();
const remoteCheckoutSignOut = jest.fn();
const getConsignments = jest.fn();
const getState = jest.fn(() => state);
const handlePaymentHumanVerification = jest.fn();
const getPaymentProviderCustomerOrThrow = jest.fn();
const deleteConsignment = jest.fn();
const initializeOffsitePayment = jest.fn();
const loadCheckout = jest.fn();
const loadDefaultCheckout = jest.fn();
const loadHeadlessCheckout = jest.fn();
const loadPaymentMethod = jest.fn();
const loadPaymentMethods = jest.fn();
const loadShippingCountries = jest.fn(() => Promise.resolve(state));
const loadCurrentOrder = jest.fn();
const submitOrder = jest.fn();
const submitPayment = jest.fn();
const finalizeOrder = jest.fn();
const loadCard = jest.fn();
const updateBillingAddress = jest.fn();
const updateShippingAddress = jest.fn();
const signInCustomer = jest.fn();
const signOutCustomer = jest.fn();
const selectShippingOption = jest.fn();
const applyStoreCredit = jest.fn();
const verifyCheckoutSpamProtection = jest.fn();
const updatePaymentProviderCustomer = jest.fn();
const initializePayment = jest.fn();
const validateCheckout = jest.fn();
const widgetInteraction = jest.fn();
const handle = jest.fn();

const PaymentIntegrationServiceMock = jest
    .fn<PaymentIntegrationService, []>()
    .mockImplementation(() => {
        return {
            createBuyNowCart,
            createHostedForm,
            deleteConsignment,
            subscribe,
            forgetCheckout,
            remoteCheckoutSignOut,
            getConsignments,
            loadCard,
            getPaymentProviderCustomerOrThrow,
            getState,
            handlePaymentHumanVerification,
            initializeOffsitePayment,
            loadCheckout,
            loadDefaultCheckout,
            loadHeadlessCheckout,
            loadPaymentMethod,
            loadPaymentMethods,
            loadShippingCountries,
            loadCurrentOrder,
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
            initializePayment,
            validateCheckout,
            handle,
            widgetInteraction,
        };
    });

export default PaymentIntegrationServiceMock;
