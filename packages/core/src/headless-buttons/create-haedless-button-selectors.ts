import { createCheckoutButtonSelectorFactory } from '../checkout-buttons';

import HeadlessButtonSelectors from './headless-button-selectors';

import { HeadlessButtonStoreState } from './';

export type HeadlessButtonSelectorsFactory = (
    state: HeadlessButtonStoreState,
) => HeadlessButtonSelectors;

export function createHeadlessButtonSelectorsFactory(): HeadlessButtonSelectorsFactory {
    const createCheckoutButtonSelector = createCheckoutButtonSelectorFactory();

    return (state) => {
        const checkoutButton = createCheckoutButtonSelector(state.checkoutButton);

        return {
            checkoutButton,
        };
    };
}

export default function createHeadlessButtonSelectors(
    state: HeadlessButtonStoreState,
): HeadlessButtonSelectors {
    return createHeadlessButtonSelectorsFactory()(state);
}
