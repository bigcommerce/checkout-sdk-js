import { find } from 'lodash';

import { selector } from '../common/selector';
import { ConfigState } from '../config';
import { Country } from '../geography';

import FormField from './form-field';

@selector
export default class FormSelector {
    constructor(
        private _config: ConfigState
    ) {}

    getShippingAddressFields(countries: Country[] = [], countryCode: string): FormField[] {
        const selectedCountry = find(countries, { code: countryCode });
        const fields = this._config.data ? this._config.data.storeConfig.formFields.shippingAddressFields : [];

        return fields.map((field: any) => this._processField(field, countries, selectedCountry));
    }

    getBillingAddressFields(countries: Country[] = [], countryCode: string): FormField[] {
        const selectedCountry = find(countries, { code: countryCode });
        const fields = this._config.data ? this._config.data.storeConfig.formFields.billingAddressFields : [];

        return fields.map((field: any) => this._processField(field, countries, selectedCountry));
    }

    private _processField(field: FormField, countries: Country[], selectedCountry?: Country): FormField {
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

    private _processCountry(field: FormField, countries: Country[] = [], country?: Country): FormField {
        if (!countries.length) {
            return field;
        }

        const { code = '' } = country || {};
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

    private _processProvince(field: FormField, country?: Country): FormField {
        const { subdivisions = [] } = country || {};

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

    private _processsPostCode(field: FormField, country?: Country): FormField {
        const { hasPostalCodes = [] } = country || {};

        if (hasPostalCodes === undefined) {
            return field;
        }

        return { ...field, required: Boolean(hasPostalCodes) };
    }
}
