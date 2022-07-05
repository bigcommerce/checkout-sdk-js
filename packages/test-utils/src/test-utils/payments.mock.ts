import { CreditCardInstrument, Payment } from '@bigcommerce/checkout-sdk/payment-integration';

export function getPayment(): Payment {
    return {
        methodId: 'authorizenet',
        paymentData: getCreditCardInstrument(),
    };
}

export function getCreditCardInstrument(): CreditCardInstrument {
    return {
        ccExpiry: {
            month: '10',
            year: '2020',
        },
        ccName: 'BigCommerce',
        ccNumber: '4111111111111111',
        ccCvv: '123',
    };
}
