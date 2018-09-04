import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from '../checkout-button-options';

export default abstract class CheckoutButtonStrategy {
    protected _isInitialized = false;

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        this._isInitialized = true;

        return Promise.resolve();
    }

    deinitialize(options: CheckoutButtonOptions): Promise<void> {
        this._isInitialized = false;

        return Promise.resolve();
    }
}
