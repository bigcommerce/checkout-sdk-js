import { InternalCheckoutSelectors } from '../checkout';
import { selector } from '../common/selector';

import CheckoutButtonSelector from './checkout-button-selector';
import { CheckoutButtonMethodType } from './strategies';

@selector
export default class CheckoutButtonStatusSelector {
    private _checkoutButton: CheckoutButtonSelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._checkoutButton = selectors.checkoutButton;
    }

    isInitializingButton(methodId?: CheckoutButtonMethodType): boolean {
        return this._checkoutButton.isInitializing(methodId);
    }

    isDeinitializingButton(methodId?: CheckoutButtonMethodType): boolean {
        return this._checkoutButton.isDeinitializing(methodId);
    }
}
