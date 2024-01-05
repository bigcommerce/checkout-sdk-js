const hostedFormVaultingDataMock = {
    currencyCode: 'USD',
    paymentsUrl: 'https//test.com',
    providerId: 'bluesnapdirect',
    shopperId: '12345',
    storeHash: '12345',
    vaultToken: 'token124',
};

const hostedFormVaultingBillingAddressAPIMock = {
    email: 'string@mail.com',
    address1: '57 Balsham Road',
    city: 'Harthill',
    postal_code: 'S31 6EN',
    country_code: 'NL',
    company: 'String',
    first_name: 'John',
    last_name: 'Smith',
    phone: '123456789',
    state_or_province_code: 'BEL',
};

const hostedFormVaultingBillingAddressMock = {
    address1: '57 Balsham Road',
    address2: '',
    city: 'Harthill',
    postalCode: 'S31 6EN',
    countryCode: 'NL',
    company: 'String',
    firstName: 'John',
    lastName: 'Smith',
    email: 'string@mail.com',
    phone: '123456789',
    stateOrProvinceCode: 'BEL',
};

const hostedFormVaultingPaymentInstrumentAPIMock = {
    type: 'card',
    cardholder_name: 'John Smith',
    number: '4111111111111111',
    expiry_month: 3,
    expiry_year: 2030,
    verification_value: '777',
};

const hostedFormVaultingPaymentInstrumentMock = {
    type: 'card',
    cardholderName: 'John Smith',
    number: '4111111111111111',
    expiryMonth: 3,
    expiryYear: 2030,
    verificationValue: '777',
};

const hostedFormVaultingInstrumentFormMock = {
    billingAddress: hostedFormVaultingBillingAddressMock,
    instrument: hostedFormVaultingPaymentInstrumentMock,
    defaultInstrument: true,
};

const hostedFormVaultingInstrumentFormAPIMock = {
    billingAddress: hostedFormVaultingBillingAddressAPIMock,
    instrument: hostedFormVaultingPaymentInstrumentAPIMock,
    default_Instrument: true,
};
const hostedFormVaultingInstrumentFieldsMock = {
    ...hostedFormVaultingBillingAddressMock,
    defaultInstrument: true,
};

export {
    hostedFormVaultingDataMock,
    hostedFormVaultingBillingAddressMock,
    hostedFormVaultingPaymentInstrumentMock,
    hostedFormVaultingInstrumentFormMock,
    hostedFormVaultingInstrumentFieldsMock,
    hostedFormVaultingInstrumentFormAPIMock,
};
