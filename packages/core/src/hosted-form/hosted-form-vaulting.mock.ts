const hostedFormVaultingDataMock = {
    currencyCode: 'USD',
    paymentsUrl: 'https//test.com',
    providerId: 'bluesnapdirect',
    shopperId: '12345',
    storeHash: '12345',
    vaultToken: 'token124',
};

const hostedFormVaultingBillingAddressMock = {
    address1: '57 Balsham Road',
    address2: '',
    city: 'Harthill',
    postal_code: 'S31 6EN',
    country_code: 'NL',
    company: 'String',
    first_name: 'John',
    last_name: 'Smith',
    email: 'string@mail.com',
    phone: '123456789',
    state_or_province_code: 'BEL',
};

const hostedFormVaultingPaymentInstrumentMock = {
    type: 'card',
    cardholder_name: 'John Smith',
    number: '4111111111111111',
    expiry_month: 3,
    expiry_year: 2030,
    verification_value: '777',
};

const hostedFormVaultingInstrumentFormMock = {
    billingAddress: hostedFormVaultingBillingAddressMock,
    instrument: hostedFormVaultingPaymentInstrumentMock,
    default_instrument: true,
};
const hostedFormVaultingInstrumentFieldsMock = {
    ...hostedFormVaultingBillingAddressMock,
    default_instrument: true,
    cardholder_name: hostedFormVaultingPaymentInstrumentMock.cardholder_name,
};

export {
    hostedFormVaultingDataMock,
    hostedFormVaultingBillingAddressMock,
    hostedFormVaultingPaymentInstrumentMock,
    hostedFormVaultingInstrumentFormMock,
    hostedFormVaultingInstrumentFieldsMock,
};
