import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import {
    createExtensionSelectorFactory,
    ExtensionSelector,
    ExtensionSelectorFactory,
} from './extension-selector';

describe('ExtensionSelector', () => {
    let createExtensionSelector: ExtensionSelectorFactory;
    let extensionSelector: ExtensionSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createExtensionSelector = createExtensionSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getExtensions()', () => {
        it('returns a list of extensions', () => {
            extensionSelector = createExtensionSelector(state.extensions);

            expect(extensionSelector.getExtensions()).toEqual(state.extensions.data);
        });

        it('returns an empty array if there are no extension', () => {
            extensionSelector = createExtensionSelector({
                ...state.extensions,
                data: [],
            });

            expect(extensionSelector.getExtensions()).toEqual([]);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new RequestError(getErrorResponse());

            extensionSelector = createExtensionSelector({
                ...state.extensions,
                errors: { loadError },
            });

            expect(extensionSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            extensionSelector = createExtensionSelector(state.extensions);

            expect(extensionSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading extensions', () => {
            extensionSelector = createExtensionSelector({
                ...state.extensions,
                statuses: { isLoading: true },
            });

            expect(extensionSelector.isLoading()).toBe(true);
        });

        it('returns false if not loading extensions', () => {
            extensionSelector = createExtensionSelector(state.extensions);

            expect(extensionSelector.isLoading()).toBe(false);
        });
    });
});
