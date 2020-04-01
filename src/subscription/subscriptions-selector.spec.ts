import SubscriptionsSelector, { createSubscriptionsSelectorFactory, SubscriptionsSelectorFactory } from './subscriptions-selector';

describe('SubscriptionsSelector', () => {
    let subscriptionsSelector: SubscriptionsSelector;
    let createSubscriptionsSelector: SubscriptionsSelectorFactory;

    beforeEach(() => {
        createSubscriptionsSelector = createSubscriptionsSelectorFactory();
    });

    describe('#getUpdateError()', () => {
        it('returns error if present', () => {
            const updateError = new Error();

            subscriptionsSelector = createSubscriptionsSelector({
                errors: { updateError },
                statuses: {},
            });

            expect(subscriptionsSelector.getUpdateError()).toEqual(updateError);
        });

        it('returns no error if not present', () => {
            subscriptionsSelector = createSubscriptionsSelector({
                errors: {},
                statuses: {},
            });

            expect(subscriptionsSelector.getUpdateError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if updating subscriptions', () => {
            subscriptionsSelector = createSubscriptionsSelector({
                errors: {},
                statuses: { isUpdating: true },
            });

            expect(subscriptionsSelector.isUpdating()).toEqual(true);
        });

        it('returns false if not updating subscriptions', () => {
            subscriptionsSelector = createSubscriptionsSelector({
                errors: {},
                statuses: {},
            });

            expect(subscriptionsSelector.isUpdating()).toEqual(false);
        });
    });
});
