import B2BCompanyPaymentMethod from './b2b-company-payment-method';
import { createB2BCompanyPaymentMethodSelectorFactory } from './b2b-company-payment-method-selector';
import B2BCompanyPaymentMethodState, { DEFAULT_STATE } from './b2b-company-payment-method-state';

describe('createB2BCompanyPaymentMethodSelectorFactory()', () => {
    const createSelector = createB2BCompanyPaymentMethodSelectorFactory();

    it('returns undefined for getB2BCompanyPaymentMethods when no data is loaded', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getB2BCompanyPaymentMethods()).toBeUndefined();
    });

    it('returns the methods array when data is loaded', () => {
        const methods: B2BCompanyPaymentMethod[] = [
            { code: 'cheque', name: 'Cheque', isEnabled: true, paymentId: 1 },
        ];
        const state: B2BCompanyPaymentMethodState = {
            ...DEFAULT_STATE,
            data: methods,
        };
        const selector = createSelector(state);

        expect(selector.getB2BCompanyPaymentMethods()).toEqual(methods);
    });

    it('returns false for isLoading when not loading', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.isLoading()).toBe(false);
    });

    it('returns true for isLoading when loading', () => {
        const state: B2BCompanyPaymentMethodState = {
            ...DEFAULT_STATE,
            statuses: { isLoading: true },
        };
        const selector = createSelector(state);

        expect(selector.isLoading()).toBe(true);
    });

    it('returns undefined for getLoadError when no error', () => {
        const selector = createSelector(DEFAULT_STATE);

        expect(selector.getLoadError()).toBeUndefined();
    });

    it('returns error for getLoadError when there is an error', () => {
        const error = new Error('Company payment methods load failed');
        const state: B2BCompanyPaymentMethodState = {
            ...DEFAULT_STATE,
            errors: { loadError: error },
        };
        const selector = createSelector(state);

        expect(selector.getLoadError()).toBe(error);
    });
});
