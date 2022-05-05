import { InternalCheckoutSelectors } from '../checkout';
import { selector } from '../common/selector';

import CheckoutButtonSelector from './checkout-button-selector';
import { CheckoutButtonMethodType } from './strategies';

@selector
export default class CheckoutButtonErrorSelector {
    private _checkoutButton: CheckoutButtonSelector;

    /**
     * @internal
     */
    constructor(selectors: InternalCheckoutSelectors) {
        this._checkoutButton = selectors.checkoutButton;
    }

    getInitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined {
        return this._checkoutButton.getInitializeError(methodId);
    }

    getDeinitializeButtonError(methodId?: CheckoutButtonMethodType): Error | undefined {
        return this._checkoutButton.getDeinitializeError(methodId);
    }
}
