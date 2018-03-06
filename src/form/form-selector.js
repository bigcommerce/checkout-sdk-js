import { find } from 'lodash';

export default class FormSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(config = {}) {
        this._config = config.data;
    }

    /**
     * @param {Country[]} countries
     * @param {string} countryCode
     * @returns {Field[]}
     */
    getShippingAddressFields(countries = [], countryCode) {
        const selectedCountry = find(countries, { code: countryCode });

        return this._config.storeConfig.formFields.shippingAddressFields
            .map((field) => field.name === 'phone' ? { ...field, required: false } : field)
            .map((field) => this._processField(field, countries, selectedCountry));
    }

    /**
     * @param {Country[]} countries
     * @param {string} countryCode
     * @returns {Field[]}
     */
    getBillingAddressFields(countries = [], countryCode) {
        const selectedCountry = find(countries, { code: countryCode });

        return this._config.storeConfig.formFields.billingAddressFields
            .map((field) => this._processField(field, countries, selectedCountry));
    }

    /**
     * @private
     * @param {Field} field
     * @param {Country[]} countries
     * @param {Country} selectedCountry
     * @returns {Field}
     */
    _processField(field, countries, selectedCountry = {}) {
        if (field.name === 'countryCode') {
            return this._processCountry(field, countries, selectedCountry);
        }

        if (field.name === 'province') {
            return this._processProvince(field, selectedCountry);
        }

        if (field.name === 'postCode') {
            return this._processsPostCode(field, selectedCountry);
        }

        return field;
    }

    /**
     * @private
     * @param {Field} field
     * @param {Country[]} countries
     * @param {Country} country
     * @param {string} country.code
     * @returns {Field}
     */
    _processCountry(field, countries = [], { code = '' }) {
        if (!countries.length) {
            return field;
        }

        const items = countries.map(({ code, name }) => ({
            value: code,
            label: name,
        }));

        return {
            ...field,
            options: { items },
            default: code,
            type: 'array',
            fieldType: 'dropdown',
            itemtype: 'string',
        };
    }

    /**
     * @private
     * @param {Field} field
     * @param {Country} country
     * @param {State[]} country.subdivisions
     * @returns {Field}
     */
    _processProvince(field, { subdivisions = [] }) {
        if (!subdivisions.length) {
            return {
                ...field,
                required: false,
            };
        }

        const items = subdivisions.map(({ code, name }) => ({
            value: code,
            label: name,
        }));

        return {
            ...field,
            name: 'provinceCode',
            options: { items },
            required: true,
            type: 'array',
            fieldType: 'dropdown',
            itemtype: 'string',
        };
    }

    /**
     * @private
     * @param {Field} field
     * @param {Country} country
     * @param {boolean} country.hasPostalCodes
     * @returns {Field}
     */
    _processsPostCode(field, { hasPostalCodes }) {
        if (hasPostalCodes === undefined) {
            return field;
        }

        return { ...field, required: Boolean(hasPostalCodes) };
    }
}
