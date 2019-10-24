import PaymentInstrument from './instrument';

interface SupportedInstruments {
    [key: string]: Pick<PaymentInstrument, 'method' | 'provider'>;
}

const supportedInstruments: SupportedInstruments = {
    braintree: {
        provider: 'braintree',
        method: 'card',
    },
    authorizenet: {
        provider: 'authorizenet',
        method: 'card',
    },
    stripe: {
        provider: 'stripe',
        method: 'card',
    },
    stripev3: {
        provider: 'stripev3',
        method: 'card',
    },
    cybersource: {
        provider: 'cybersource',
        method: 'card',
    },
    converge: {
        provider: 'converge',
        method: 'card',
    },
    bluesnapv2: {
        provider: 'bluesnapv2',
        method: 'card',
    },
    paymetric: {
        provider: 'paymetric',
        method: 'card',
    },
};

export default supportedInstruments;
