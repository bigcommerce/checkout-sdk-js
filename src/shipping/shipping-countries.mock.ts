import { Country, CountryResponseBody } from '../geography';

import ShippingCountryState from './shipping-country-state';

export function getShippingCountries(): Country[] {
    return [
        getAustralia(),
        getJapan(),
    ];
}

export function getShippingCountriesResponseBody(): CountryResponseBody {
    return {
        meta: {},
        data: getShippingCountries(),
    };
}

export function getShippingCountriesState(): ShippingCountryState {
    return {
        data: getShippingCountries(),
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
        ],
        hasPostalCodes: true,
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
