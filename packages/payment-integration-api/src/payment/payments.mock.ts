import { CreditCardInstrument } from './payment';


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

