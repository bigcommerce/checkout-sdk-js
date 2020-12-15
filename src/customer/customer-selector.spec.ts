import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CustomerSelector, { createCustomerSelectorFactory, CustomerSelectorFactory } from './customer-selector';
import { DEFAULT_STATE } from './customer-state';
import { getCustomer } from './customers.mock';

describe('CustomerSelector', () => {
    let createCustomerSelector: CustomerSelectorFactory;
    let selector: CustomerSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createCustomerSelector = createCustomerSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getCustomer()', () => {
        it('returns current customer', () => {
            selector = createCustomerSelector(state.customer);

            expect(selector.getCustomer()).toEqual(getCustomer());
        });

        it('returns undefined if customer is unavailable', () => {
            selector = createCustomerSelector(DEFAULT_STATE);

            expect(selector.getCustomer()).toEqual(undefined);
        });
    });

    describe('#getCreateAccountError()', () => {
        it('returns current customer', () => {
            const createError = new Error();

            selector = createCustomerSelector({
                errors: { createError },
                statuses: {},
            });

            expect(selector.getCreateAccountError()).toEqual(createError);
        });

        it('returns undefined if customer is unavailable', () => {
            selector = createCustomerSelector(DEFAULT_STATE);

            expect(selector.getCreateAccountError()).toEqual(undefined);
        });
    });

    describe('#isCreatingCustomerAccount()', () => {
        it('returns current customer', () => {
            selector = createCustomerSelector({
                errors: { },
                statuses: { isCreating: true },
            });

            expect(selector.isCreatingCustomerAccount()).toEqual(true);
        });

        it('returns undefined if customer is unavailable', () => {
            selector = createCustomerSelector(DEFAULT_STATE);

            expect(selector.isCreatingCustomerAccount()).toEqual(false);
        });
    });
});
