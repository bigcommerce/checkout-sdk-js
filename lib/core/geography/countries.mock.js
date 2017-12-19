"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCountries() {
    return [
        getAustralia(),
        getUnitedStates(),
        getJapan(),
    ];
}
exports.getCountries = getCountries;
function getCountriesResponseBody() {
    return {
        meta: {},
        data: getCountries(),
    };
}
exports.getCountriesResponseBody = getCountriesResponseBody;
function getCountriesState() {
    return {
        meta: {},
        data: getCountries(),
    };
}
exports.getCountriesState = getCountriesState;
function getAustralia() {
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
exports.getAustralia = getAustralia;
function getUnitedStates() {
    return {
        code: 'US',
        name: 'United States',
        hasPostalCodes: true,
    };
}
exports.getUnitedStates = getUnitedStates;
function getJapan() {
    return {
        code: 'JP',
        name: 'Japan',
        hasPostalCodes: false,
    };
}
exports.getJapan = getJapan;
//# sourceMappingURL=countries.mock.js.map