import { find, map } from 'lodash';

import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { Country } from '../geography';
import { getCountries } from '../geography/countries.mock';
import { getShippingCountries } from '../shipping/shipping-countries.mock';

import FormSelector, { createFormSelectorFactory, FormSelectorFactory } from './form-selector';
import { getFormFields } from './form.mocks';

// tslint:disable:no-non-null-assertion

describe('FormSelector', () => {
    let createFormSelector: FormSelectorFactory;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createFormSelector = createFormSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getShippingAddressFields()', () => {
        let formSelector: FormSelector;
        let countries: Country[];

        beforeEach(() => {
            formSelector = createFormSelector(state.config);
            countries = getShippingCountries();
        });

        it('returns the shipping address form fields', () => {
            const expected = getFormFields();
            const result = formSelector.getShippingAddressFields([], '');

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('includes the countries as options for the country field', () => {
            const forms = formSelector.getShippingAddressFields(countries, '');
            const country = find(forms, { name: 'countryCode' });

            expect(country!.fieldType).toEqual('dropdown');
            expect(country!.options!.items).toEqual([
                { value: 'AU', label: 'Australia' },
                { value: 'JP', label: 'Japan' },
            ]);
        });

        it('sets the default country to the selected one', () => {
            const forms = formSelector.getShippingAddressFields(countries, 'JP');
            const country = find(forms, { name: 'countryCode' });

            expect(country!.default).toEqual('JP');
        });

        it('includes the provinces for the selected country', () => {
            const forms = formSelector.getShippingAddressFields(countries, 'AU');
            const province = find(forms, { name: 'stateOrProvinceCode' });

            expect(province!.required).toBe(true);
            expect(province!.fieldType).toEqual('dropdown');
            expect(province!.options!.items).toEqual([
                { value: 'NSW', label: 'New South Wales' },
            ]);
        });

        it('does not make provinces required if we do not have them in the countries list', () => {
            const forms = formSelector.getShippingAddressFields(countries, 'JP');
            const province = find(forms, { name: 'stateOrProvince' });

            expect(province!.required).toBe(false);
            expect(province!.fieldType).not.toEqual('dropdown');
        });

        it('makes postcode required for countries that require it', () => {
            const forms = formSelector.getShippingAddressFields(countries, 'AU');
            const postCode = find(forms, { name: 'postalCode' });

            expect(postCode!.required).toBe(true);
        });

        it('makes postcode NOT required for countries that DO NOT require it', () => {
            const forms = formSelector.getShippingAddressFields(countries, 'JP');
            const postCode = find(forms, { name: 'postalCode' });

            expect(postCode!.required).toBe(false);
        });
    });

    describe('#getBillingAddressFields()', () => {
        let formSelector: FormSelector;
        let countries: Country[];

        beforeEach(() => {
            formSelector = createFormSelector(state.config);
            countries = getCountries();
        });

        it('returns the billing address form fields', () => {
            const expected = getFormFields();
            const result = formSelector.getBillingAddressFields([], '');

            expect(map(result, 'id')).toEqual(map(expected, 'id'));
        });

        it('includes the countries as options for the country field', () => {
            const forms = formSelector.getBillingAddressFields(countries, '');
            const country = find(forms, { name: 'countryCode' });

            expect(country!.fieldType).toBe('dropdown');
            expect(country!.options!.items).toEqual([
                { value: 'AU', label: 'Australia' },
                { value: 'US', label: 'United States' },
                { value: 'JP', label: 'Japan' },
            ]);
        });

        it('sets the default country to the selected one', () => {
            const forms = formSelector.getBillingAddressFields(countries, 'US');
            const country = find(forms, { name: 'countryCode' });

            expect(country!.default).toEqual('US');
        });

        it('includes the provinces for the selected country', () => {
            const forms = formSelector.getBillingAddressFields(countries, 'AU');
            const province = find(forms, { name: 'stateOrProvinceCode' });

            expect(province!.required).toBe(true);
            expect(province!.fieldType).toBe('dropdown');
            expect(province!.options!.items).toEqual([
                { value: 'NSW', label: 'New South Wales' },
                { value: 'VIC', label: 'Victoria' },
            ]);
        });

        it('does not make provinces required if we do not have them in the countries list', () => {
            const forms = formSelector.getBillingAddressFields(countries, 'JP');
            const province = find(forms, { name: 'stateOrProvince' });

            expect(province!.required).toBe(false);
            expect(province!.fieldType).not.toBe('dropdown');
        });

        it('makes postcode required for countries that require it', () => {
            const forms = formSelector.getBillingAddressFields(countries, 'AU');
            const postCode = find(forms, { name: 'postalCode' });

            expect(postCode!.required).toBe(true);
        });

        it('makes postcode NOT required for countries that DO NOT require it', () => {
            const forms = formSelector.getBillingAddressFields(countries, 'JP');
            const postCode = find(forms, { name: 'postalCode' });

            expect(postCode!.required).toBe(false);
        });
    });
});
