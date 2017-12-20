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
        },
    ];
}

export function getErrorInstrumentResponseBody() {
    return {
        errors: [{
            code: 400,
            message: 'Bad Request',
        }],
    };
}

export function getInstrumentState() {
    return {
        data: getInstruments(),
        meta: {},
    };
}

export function getShopperTokenResponseBody() {
    return {
        data: {
            token: '123123123',
        },
        meta: {},
    };
}

export function getInstrumentsResponseBody() {
    return {
        data: {
            vaulted_instruments: getInstruments(),
        },
        meta: {},
    };
}
