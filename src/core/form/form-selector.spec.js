import { getAppConfig } from '../config/configs.mock';
import FormSelector from './form-selector';

describe('FormSelector', () => {
    let formSelector;
    let state;

    beforeEach(() => {
        state = {
            config: {
                data: getAppConfig(),
            },
        };
    });

    describe('#getShippingAddressFields()', () => {
        it('returns the shipping address form fields', () => {
            formSelector = new FormSelector(state.config);

            expect(formSelector.getShippingAddressFields())
                .toEqual(state.config.data.storeConfig.formFields.shippingAddressFields);
        });
    });

    describe('#getBillingAddressFields()', () => {
        it('returns the billing address form fields', () => {
            formSelector = new FormSelector(state.config);

            expect(formSelector.getBillingAddressFields())
                .toEqual(state.config.data.storeConfig.formFields.billingAddressFields);
        });
    });
});
