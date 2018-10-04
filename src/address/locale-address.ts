import { Country } from '../geography';

import Address from './address';

export default function localeAddress<T1 extends Address>(address: T1, countries?: Country[]): T1 {
    const country =  (countries || []).find(({ code }) => code === address.countryCode);
    const states = !country || !country.subdivisions.length ? [] : country.subdivisions;
    const state = states.find(({ code }) => code === address.stateOrProvinceCode);

    return Object.assign({},
        address,
        {
            country: country ? country.name : address.country,
            stateOrProvince: state ? state.name : address.stateOrProvince,
        }
    );
}
