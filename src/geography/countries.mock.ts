import Country from './country';
import { CountryResponseBody } from './country-responses';
import CountryState from './country-state';

export function getCountries(): Country[] {
    return [
        getAustralia(),
        getUnitedStates(),
        getJapan(),
    ];
}

export function getCountriesResponseBody(): CountryResponseBody {
    return {
        meta: {},
        data: getCountries(),
    };
}

export function getCountriesState(): CountryState {
    return {
        data: getCountries(),
        errors: {},
        statuses: {},
    };
}

export function getAustralia(): Country {
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

export function getUnitedStates(): Country {
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

export function getJapan(): Country {
    return {
        code: 'JP',
        name: 'Japan',
        hasPostalCodes: false,
        subdivisions: [],
    };
}
