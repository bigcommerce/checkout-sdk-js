export function getShippingCountries() {
    return [
        getAustralia(),
        getJapan(),
    ];
}

export function getShippingCountriesResponseBody() {
    return {
        meta: {},
        data: getShippingCountries(),
    };
}

export function getShippingCountriesState() {
    return {
        meta: {},
        data: getShippingCountries(),
    };
}

export function getAustralia() {
    return {
        code: 'AU',
        name: 'Australia',
        subdivisions: [
            { code: 'NSW', name: 'New South Wales' },
        ],
        hasPostalCodes: true,
    };
}

export function getJapan() {
    return {
        code: 'JP',
        name: 'Japan',
        hasPostalCodes: false,
    };
}
