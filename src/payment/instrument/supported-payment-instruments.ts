import PaymentInstrument from './instrument';

interface SupportedInstruments {
    [key: string]: Pick<PaymentInstrument, 'method' | 'provider'>;
}

const supportedInstruments: SupportedInstruments = {
    'adyenv2.scheme': {
        provider: 'adyenv2',
        method: 'scheme',
    },
    'adyenv2.bcmc': {
        provider: 'adyenv2',
        method: 'bcmc',
    },
    'adyenv2.ideal': {
        provider: 'adyenv2',
        method: 'ideal',
    },
    'adyenv2.sepadirectdebit': {
        provider: 'adyenv2',
        method: 'sepadirectdebit',
    },
    'adyenv2.directEbanking': {
        provider: 'adyenv2',
        method: 'directEbanking',
    },
    'adyenv2.giropay': {
        provider: 'adyenv2',
        method: 'giropay',
    },
    braintree: {
        provider: 'braintree',
        method: 'credit_card',
    },
    braintreepaypal: {
        provider: 'braintree',
        method: 'paypal',
    },
    authorizenet: {
        provider: 'authorizenet',
        method: 'credit_card',
    },
    elavon: {
        provider: 'elavon',
        method: 'credit_card',
    },
    checkoutcom: {
        provider: 'checkoutcom',
        method: 'credit_card',
    },
    stripe: {
        provider: 'stripe',
        method: 'credit_card',
    },
    'stripev3.card': {
        provider: 'stripev3',
        method: 'card',
    },
    cybersource: {
        provider: 'cybersource',
        method: 'credit_card',
    },
    converge: {
        provider: 'converge',
        method: 'credit_card',
    },
    bluesnapv2: {
        provider: 'bluesnapv2',
        method: 'credit_card',
    },
    orbital: {
        provider: 'orbital',
        method: 'credit_card',
    },
    paymetric: {
        provider: 'paymetric',
        method: 'credit_card',
    },
    bolt: {
        provider: 'bolt',
        method: 'credit_card',
    },
    'barclaycard.credit_card': {
        provider: 'barclaycard',
        method: 'credit_card',
    },
};

export default supportedInstruments;
