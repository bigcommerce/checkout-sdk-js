import PaymentIntegrationService from "../payment-integration-service";

const subscribe = jest.fn();
const getState = jest.fn();
const loadCheckout = jest.fn(); 
const loadPaymentMethod = jest.fn();
const submitOrder = jest.fn();
const submitPayment = jest.fn();
const finalizeOrder = jest.fn();
const updateBillingAddress = jest.fn();
const updateShippingAddress = jest.fn();

const paymentIntegrationServeMock = jest.fn<PaymentIntegrationService>().mockImplementation(() => {
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

export default paymentIntegrationServeMock;
