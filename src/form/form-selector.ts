import { find } from 'lodash';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class FormSelector {
    /**
     * @constructor
     * @param {ConfigState} config
     */
    constructor(
        private _config: any = {}
    ) {}

    /**
     * @param {Country[]} countries
     * @param {string} countryCode
     * @returns {Field[]}
     */
    getShippingAddressFields(countries: any = [], countryCode: string): any {
        const selectedCountry = find(countries, { code: countryCode });

        return this._config.data.formFields.shippingAddressFields
            .map((field: any) => this._processField(field, countries, selectedCountry));
    }

    /**
     * @param {Country[]} countries
     * @param {string} countryCode
     * @returns {Field[]}
     */
    getBillingAddressFields(countries: any[] = [], countryCode: string): any {
        const selectedCountry = find(countries, { code: countryCode });

        return this._config.data.formFields.billingAddressFields
            .map((field: any) => this._processField(field, countries, selectedCountry));
    }

    /**
     * @private
     * @param {Field} field
     * @param {Country[]} countries
     * @param {Country} selectedCountry
     * @returns {Field}
     */
    private _processField(field: any, countries: any[], selectedCountry: any = {}): any {
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
    private _processCountry(field: any, countries: any[] = [], { code = '' }: any): any {
        if (!countries.length) {
            return field;
        }

        const items = countries.map(({ code, name }: any) => ({
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
    private _processProvince(field: any, { subdivisions = [] }: any): any {
        if (!subdivisions.length) {
            return {
                ...field,
                required: false,
            };
        }

        const items = subdivisions.map(({ code, name }: any) => ({
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
    private _processsPostCode(field: any, { hasPostalCodes }: any): any {
        if (hasPostalCodes === undefined) {
            return field;
        }

        return { ...field, required: Boolean(hasPostalCodes) };
    }
}
