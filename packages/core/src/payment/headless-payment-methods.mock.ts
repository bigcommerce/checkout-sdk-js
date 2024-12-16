import HeadlessPaymentMethod from './headless-payment-method';

export const initializationData = {
    merchantId: '100000',
    paymentButtonStyles: {
        checkoutTopButtonStyles: { color: 'blue', label: 'checkout', height: '36' },
    },
};

export const encodedInitializationData = btoa(JSON.stringify(initializationData));

export function getHeadlessPaymentMethod(): HeadlessPaymentMethod {
    return {
        paymentWalletWithInitializationData: {
            clientToken: 'clientToken',
            initializationData: encodedInitializationData,
        },
    };
}
