import { InternalCheckoutSelectors } from '../../checkout';
import { CheckoutButtonInitializeOptions } from '../checkout-button-options';

export default interface CheckoutButtonStrategy {
    initialize(options: CheckoutButtonInitializeOptions): Promise<void | InternalCheckoutSelectors>;

    deinitialize(): Promise<void | InternalCheckoutSelectors>;
}
