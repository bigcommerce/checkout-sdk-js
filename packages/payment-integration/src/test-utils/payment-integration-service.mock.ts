import PaymentIntegrationService from "../payment-integration-service";
import getCart from "./carts.mock";
import getCheckout from "./checkouts.mock";
import getConfig from "./config.mock";

const subscribe = jest.fn();
const getState = jest.fn(() => {
    return {
        getCartOrThrow: jest.fn(() => getCart()),
        getCheckoutOrThrow: jest.fn(() => getCheckout()),
        getStoreConfigOrThrow: jest.fn(() => getConfig().storeConfig),
        getPaymentMethodOrThrow: jest.fn(() => { id: 'applepay' }),
    };
});
const loadCheckout = jest.fn(); 
const loadPaymentMethod = jest.fn();
const submitOrder = jest.fn();
const submitPayment = jest.fn();
const finalizeOrder = jest.fn();
const updateBillingAddress = jest.fn();
const updateShippingAddress = jest.fn();

const PaymentIntegrationServiceMock = jest.fn<PaymentIntegrationService>().mockImplementation(() => {
    return {
        subscribe,
        getState,
        loadCheckout,
        loadPaymentMethod,
        submitOrder,
        submitPayment,
        finalizeOrder,
        updateBillingAddress,
        updateShippingAddress,
    }
});

export default PaymentIntegrationServiceMock;
