"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getShippingCountries() {
    return [
        getAustralia(),
        getJapan(),
    ];
}
exports.getShippingCountries = getShippingCountries;
function getShippingCountriesResponseBody() {
    return {
        meta: {},
        data: getShippingCountries(),
    };
}
exports.getShippingCountriesResponseBody = getShippingCountriesResponseBody;
function getShippingCountriesState() {
    return {
        meta: {},
        data: getShippingCountries(),
    };
}
exports.getShippingCountriesState = getShippingCountriesState;
function getAustralia() {
    return {
        code: 'AU',
        name: 'Australia',
        subdivisions: [
            { code: 'NSW', name: 'New South Wales' },
        ],
        hasPostalCodes: true,
    };
}
exports.getAustralia = getAustralia;
function getJapan() {
    return {
        code: 'JP',
        name: 'Japan',
        hasPostalCodes: false,
    };
}
exports.getJapan = getJapan;
//# sourceMappingURL=shipping-countries.mock.js.map