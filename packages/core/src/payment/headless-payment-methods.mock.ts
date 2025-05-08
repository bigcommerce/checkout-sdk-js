import { GqlPaymentMethod } from './gql-payment';

export const initializationData = {
    merchantId: '100000',
    paymentButtonStyles: {
        checkoutTopButtonStyles: { color: 'blue', label: 'checkout', height: '36' },
    },
};

export const encodedInitializationData = btoa(JSON.stringify(initializationData));

export function getHeadlessPaymentMethod(): GqlPaymentMethod {
    return {
        paymentWalletWithInitializationData: {
            clientToken: 'clientToken',
            initializationData: encodedInitializationData,
        },
    };
}
