import { find, reject } from 'lodash';

import { FormField } from '../form';
import { getFormFields } from '../form/form.mock';
import { getUnitedStates } from '../geography/countries.mock';
import { getBraintree } from '../payment/payment-methods.mock';
import { getAustralia } from '../shipping/shipping-countries.mock';
import { getShippingOptions } from '../shipping/shipping-options.mock';

import CheckoutStoreSelector, { createCheckoutStoreSelectorFactory, CheckoutStoreSelectorFactory } from './checkout-store-selector';
import CheckoutStoreState from './checkout-store-state';
import { getCheckoutStoreStateWithOrder } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutStoreSelector', () => {
    let createCheckoutStoreSelector: CheckoutStoreSelectorFactory;
    let state: CheckoutStoreState;
    let internalSelectors: InternalCheckoutSelectors;
    let selector: CheckoutStoreSelector;

    beforeEach(() => {
        createCheckoutStoreSelector = createCheckoutStoreSelectorFactory();
        state = getCheckoutStoreStateWithOrder();
        internalSelectors = createInternalCheckoutSelectors(state);
        selector = createCheckoutStoreSelector(internalSelectors);
    });

    it('returns checkout data', () => {
        expect(selector.getCheckout()).toEqual(internalSelectors.checkout.getCheckout());
    });

    it('returns flash messages', () => {
        expect(selector.getFlashMessages()).toEqual(internalSelectors.config.getFlashMessages());
    });

    it('returns order', () => {
        expect(selector.getOrder()).toEqual(internalSelectors.order.getOrder());
    });

    it('returns sign-in email', () => {
        expect(selector.getSignInEmail()).toEqual(internalSelectors.signInEmail.getEmail());
    });

    it('returns config', () => {
        expect(selector.getConfig()).toEqual(internalSelectors.config.getStoreConfig());
    });

    it('returns shipping options', () => {
        expect(selector.getShippingOptions()).toEqual(getShippingOptions());
    });

    it('returns consignments', () => {
        expect(selector.getConsignments()).toEqual(internalSelectors.consignments.getConsignments());
    });

    it('returns shipping countries', () => {
        expect(selector.getShippingCountries()).toEqual(internalSelectors.shippingCountries.getShippingCountries());
    });

    it('returns billing countries', () => {
        expect(selector.getBillingCountries()).toEqual(internalSelectors.countries.getCountries());
    });

    it('returns payment methods', () => {
        expect(selector.getPaymentMethods()).toEqual(internalSelectors.paymentMethods.getPaymentMethods());
    });

    it('returns payment method', () => {
        expect(selector.getPaymentMethod('braintree')).toEqual(internalSelectors.paymentMethods.getPaymentMethod('braintree'));
    });

    it('returns cart', () => {
        expect(selector.getCart()).toEqual(internalSelectors.cart.getCart());
    });

    it('returns customer', () => {
        expect(selector.getCustomer()).toEqual(internalSelectors.customer.getCustomer());
    });

    describe('#getBillingAddress()', () => {
        it('returns billing address', () => {
            expect(selector.getBillingAddress()).toEqual(internalSelectors.billingAddress.getBillingAddress());
        });

        it('returns geo-ip dummy billing address when billing address is undefined', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.billingAddress, 'getBillingAddress').mockReturnValue(undefined);

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getBillingAddress()).toEqual({
                id: '',
                address1: '',
                address2: '',
                city: '',
                company: '',
                country: '',
                customFields: [],
                email: '',
                firstName: '',
                lastName: '',
                phone: '',
                postalCode: '',
                stateOrProvince: '',
                stateOrProvinceCode: '',
                countryCode: 'AU',
            });
        });

        it('returns geo-ip dummy billing address when only email is defined in billing address', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.billingAddress, 'getBillingAddress')
                .mockReturnValue({
                    email: 'foo@bar.com',
                    id: '2',
                    address1: '',
                    customFields: [],
                });

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getBillingAddress()).toEqual({
                id: '2',
                address1: '',
                address2: '',
                city: '',
                company: '',
                country: '',
                customFields: [],
                email: 'foo@bar.com',
                firstName: '',
                lastName: '',
                phone: '',
                postalCode: '',
                stateOrProvince: '',
                stateOrProvinceCode: '',
                countryCode: 'AU',
            });
        });

        it('returns undefined if getBillingAddress & geoIp are not present', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.billingAddress, 'getBillingAddress').mockReturnValue(undefined);
            jest.spyOn(internalSelectors.config, 'getContextConfig').mockReturnValue(undefined);

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getBillingAddress()).toBeUndefined();
        });

        it('returns address if address is partially defined but geo IP is not defined', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.billingAddress, 'getBillingAddress').mockReturnValue({ email: 'foo@bar.com' });
            jest.spyOn(internalSelectors.config, 'getContextConfig').mockReturnValue(undefined);

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getBillingAddress()).toEqual({ email: 'foo@bar.com' });
        });
    });

    describe('#getShippingAddress()', () => {
        it('returns shipping address', () => {
            expect(selector.getShippingAddress()).toEqual(internalSelectors.shippingAddress.getShippingAddress());
        });

        it('returns geo-ip dummy shipping address', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.shippingAddress, 'getShippingAddress').mockReturnValue(undefined);

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getShippingAddress()).toEqual({
                address1: '',
                address2: '',
                city: '',
                company: '',
                country: '',
                customFields: [],
                firstName: '',
                lastName: '',
                phone: '',
                postalCode: '',
                stateOrProvince: '',
                stateOrProvinceCode: '',
                countryCode: 'AU',
            });
        });

        it('returns undefined if shippingAddress & geoIp are not present', () => {
            internalSelectors = createInternalCheckoutSelectors(state);

            jest.spyOn(internalSelectors.shippingAddress, 'getShippingAddress').mockReturnValue(undefined);
            jest.spyOn(internalSelectors.config, 'getContextConfig').mockReturnValue(undefined);

            selector = createCheckoutStoreSelector(internalSelectors);

            expect(selector.getShippingAddress()).toBeUndefined();
        });
    });

    it('returns instruments', () => {
        expect(selector.getInstruments()).toEqual(internalSelectors.instruments.getInstruments());
    });

    it('returns instruments for a particular payment method', () => {
        const paymentMethodMock = getBraintree();

        expect(selector.getInstruments(paymentMethodMock)).toEqual(internalSelectors.instruments.getInstrumentsByPaymentMethod(paymentMethodMock));
    });

    it('returns flag indicating if payment is submitted', () => {
        expect(selector.isPaymentDataSubmitted('braintree')).toEqual(true);
    });

    it('returns shipping address fields', () => {
        const results = selector.getShippingAddressFields('AU');
        const predicate = ({ name }: FormField) => name === 'stateOrProvince' || name === 'stateOrProvinceCode' || name === 'countryCode';
        const field = find(results, { name: 'stateOrProvinceCode' });

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(field && field.options && field.options.items)
            .toEqual(getAustralia().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });

    it('returns billing address fields', () => {
        const results = selector.getBillingAddressFields('US');
        const predicate = ({ name }: FormField) => name === 'stateOrProvince' || name === 'stateOrProvinceCode' || name === 'countryCode';
        const field = find(results, { name: 'stateOrProvinceCode' });

        expect(reject(results, predicate)).toEqual(reject(getFormFields(), predicate));
        expect(field && field.options && field.options.items)
            .toEqual(getUnitedStates().subdivisions.map(({ code, name }) => ({ label: name, value: code })));
    });

    it('changes to the public objects do not affect the private copy', () => {
        const publicCheckout = selector.getCheckout();
        const privateCheckout = internalSelectors.checkout.getCheckout();

        // tslint:disable-next-line:no-non-null-assertion
        publicCheckout!.customer.email = 'should@notchange.com';

        // tslint:disable-next-line:no-non-null-assertion
        expect(privateCheckout!.customer.email).not.toEqual('should@notchange.com');
    });

    it('returns flag indicating if should show embedded submit button', () => {
        expect(selector.isShowEmbeddedSubmitButton('paypalcommerce')).toEqual(false);
    });
});
