import PaymentInstrument from './instrument';

interface SupportedInstruments {
    [key: string]: Pick<PaymentInstrument, 'method' | 'provider'>;
}

const supportedInstruments: SupportedInstruments = {
    'mollie.credit_card': {
        provider: 'mollie',
        method: 'credit_card',
    },
    'adyenv2.scheme': {
        provider: 'adyenv2',
        method: 'scheme',
    },
    'adyenv3.scheme': {
        provider: 'adyenv3',
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
    barclays: {
        provider: 'barclays',
        method: 'credit_card',
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
    'checkoutcom.credit_card': {
        provider: 'checkoutcom',
        method: 'credit_card',
    },
    'checkoutcom.card': {
        provider: 'checkoutcom',
        method: 'card',
    },
    stripe: {
        provider: 'stripe',
        method: 'credit_card',
    },
    'stripev3.card': {
        provider: 'stripev3',
        method: 'card',
    },
    'stripeupe.card': {
        provider: 'stripeupe',
        method: 'card',
    },
    cybersource: {
        provider: 'cybersource',
        method: 'credit_card',
    },
    cybersourcev2: {
        provider: 'cybersourcev2',
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
    digitalriver: {
        provider: 'digitalriver',
        method: 'credit_card',
    },
    moneris: {
        provider: 'moneris',
        method: 'credit_card',
    },
};

export default supportedInstruments;
