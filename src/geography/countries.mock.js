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
        data: getCountries(),
        errors: {},
        statuses: {},
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
        subdivisions: [
            { code: 'CA', name: 'California' },
            { code: 'TX', name: 'Texas' },
        ],
    };
}

export function getJapan() {
    return {
        code: 'JP',
        name: 'Japan',
        hasPostalCodes: false,
        subdivisions: [],
    };
}
