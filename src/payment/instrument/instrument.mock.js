export function getInstrumentsMeta() {
    return {
        vaultAccessToken: 'VAT f4k3v4ul74cc3sst0k3n',
        vaultAccessExpiry: 1516097476098,
    };
}

export function getInstrument() {
    return {
        bigpay_token: '123',
        provider: 'braintree',
        iin: '11111111',
        last_4: '4321',
        expiry_month: '02',
        expiry_year: '2020',
        brand: 'test',
        default_instrument: true,
        trusted_shipping_address: true,
    };
}

export function getInstruments() {
    return [
        {
            bigpay_token: '123',
            provider: 'braintree',
            iin: '11111111',
            last_4: '4321',
            expiry_month: '02',
            expiry_year: '2020',
            brand: 'test',
            default_instrument: true,
            trusted_shipping_address: true,
        },
        {
            bigpay_token: '111',
            provider: 'authorizenet',
            iin: '11222333',
            last_4: '4444',
            expiry_month: '10',
            expiry_year: '2024',
            brand: 'test',
            default_instrument: true,
            trusted_shipping_address: false,
        },
    ];
}

export function instrumentRequestContext() {
    return {
        storeId: '1504098821',
        customerId: 0,
        token: getInstrumentsMeta().vaultAccessToken,
    };
}

export function getErrorInstrumentResponseBody() {
    return {
        errors: [{
            code: 400,
            message: 'Bad Request',
        }],
    };
}

export function getInstrumentsState() {
    return {
        data: getInstruments(),
        meta: getInstrumentsMeta(),
    };
}

export function getVaultAccessTokenResponseBody() {
    return {
        data: {
            token: 'VAT f4k3v4ul74cc3sst0k3n',
            expires_at: 1516097476098,
        },
        meta: {},
    };
}

export function getLoadInstrumentsResponseBody() {
    return {
        vaulted_instruments: getInstruments(),
    };
}

export function deleteInstrumentResponseBody() {
    return {
    };
}
