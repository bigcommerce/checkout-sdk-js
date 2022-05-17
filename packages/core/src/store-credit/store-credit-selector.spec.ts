import { RequestError } from '../common/error/errors';

import StoreCreditSelector, { createStoreCreditSelectorFactory, StoreCreditSelectorFactory } from './store-credit-selector';
import StoreCreditState from './store-credit-state';

describe('StoreCreditSelector', () => {
    let selector: StoreCreditSelector;
    let createStoreCreditSelector: StoreCreditSelectorFactory;
    let state: StoreCreditState;

    beforeEach(() => {
        createStoreCreditSelector = createStoreCreditSelectorFactory();
        state = {
            errors: {},
            statuses: {},
        };
    });

    describe('#getApplyError()', () => {
        it('returns error if unable to apply', () => {
            const applyError = new RequestError();

            selector = createStoreCreditSelector({
                ...state,
                errors: { applyError },
            });

            expect(selector.getApplyError()).toEqual(applyError);
        });

        it('does not returns error if able to apply', () => {
            selector = createStoreCreditSelector(state);

            expect(selector.getApplyError()).toBeUndefined();
        });
    });

    describe('#isApplying()', () => {
        it('returns true if applying a coupon', () => {
            selector = createStoreCreditSelector({
                ...state,
                statuses: { isApplying: true },
            });

            expect(selector.isApplying()).toEqual(true);
        });

        it('returns false if not applying a coupon', () => {
            selector = createStoreCreditSelector(state);

            expect(selector.isApplying()).toEqual(false);
        });
    });
});
