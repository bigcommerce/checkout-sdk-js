import { Action, combineReducers, Reducer } from '@bigcommerce/data-store';

import { checkoutButtonReducer } from '../checkout-buttons';

import HeadlessButtonStoreState from './headless-button-store-state';

export default function createHeadlessButtonStoreReducer(): Reducer<
    HeadlessButtonStoreState,
    Action
> {
    return combineReducers({
        checkoutButton: checkoutButtonReducer,
    });
}
