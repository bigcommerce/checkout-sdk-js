import PaymentInstrument from './instrument';

interface SupportedInstruments {
    [key: string]: Pick<PaymentInstrument, 'method' | 'provider'>;
}

const supportedInstruments: SupportedInstruments = {
    scheme_adyenv2: {
        provider: 'adyenv2',
        method: 'scheme',
    },
    bcmc_adyenv2: {
        provider: 'adyenv2',
        method: 'bcmc',
    },
    braintree: {
        provider: 'braintree',
        method: 'card',
    },
    braintreepaypal: {
        provider: 'braintree',
        method: 'paypal',
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
    barclaycard: {
        provider: 'barclaycard',
        method: 'card',
    },
};

export default supportedInstruments;
