import { CheckoutButtonInitializeOptions } from '../checkout-button-options';

export default interface CheckoutButtonStrategy {
    initialize(options: CheckoutButtonInitializeOptions): Promise<void>;

    deinitialize(): Promise<void>;
}
