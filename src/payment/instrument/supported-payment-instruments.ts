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
    stripe: {
        provider: 'stripe',
        method: 'credit_card',
    },
    stripev3: {
        provider: 'stripev3',
        method: 'credit_card',
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
    paymetric: {
        provider: 'paymetric',
        method: 'credit_card',
    },
};

export default supportedInstruments;
