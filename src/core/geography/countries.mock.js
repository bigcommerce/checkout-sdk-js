export function getCountries() {
    return [
        getAustralia(),
        getUnitedStates(),
        getJapan(),
    ];
}

export function getCountriesResponseBody() {
    return {
        meta: {},
        data: getCountries(),
    };
}

export function getCountriesState() {
    return {
        meta: {},
        data: getCountries(),
    };
}

export function getAustralia() {
    return {
        code: 'AU',
        name: 'Australia',
        subdivisions: [
            { code: 'NSW', name: 'New South Wales' },
            { code: 'VIC', name: 'Victoria' },
        ],
        hasPostalCodes: true,
    };
}

export function getUnitedStates() {
    return {
        code: 'US',
        name: 'United States',
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
