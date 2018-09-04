import { InternalCheckoutSelectors } from '../checkout';
import { selector } from '../common/selector';

import CheckoutButtonSelector from './checkout-button-selector';

@selector
export default class CheckoutButtonStatusSelector {
    private _checkoutButton: CheckoutButtonSelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._checkoutButton = selectors.checkoutButton;
    }

    isInitializingButton(methodId?: string): boolean {
        return this._checkoutButton.isInitializing(methodId);
    }

    isDeinitializingButton(methodId?: string): boolean {
        return this._checkoutButton.isDeinitializing(methodId);
    }
}
