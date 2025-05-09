import { createDataStore } from '@bigcommerce/data-store';

import { createHeadlessButtonSelectorsFactory } from './create-haedless-button-selectors';
import createHeadlessButtonStoreReducer from './create-headless-button-store-reducer';
import HeadlessButtonStore from './headless-button-store';
import HeadlessButtonStoreState from './headless-button-store-state';

export default function createHeadlessButtonStore(
    initialState: Partial<HeadlessButtonStoreState> = {},
): HeadlessButtonStore {
    const createHeadlessButtonSelectors = createHeadlessButtonSelectorsFactory();
    const stateTransformer = (state: HeadlessButtonStoreState) =>
        createHeadlessButtonSelectors(state);

    return createDataStore(createHeadlessButtonStoreReducer(), initialState, {
        stateTransformer,
    });
}
