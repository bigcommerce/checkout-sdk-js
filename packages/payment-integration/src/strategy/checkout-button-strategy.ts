import { CheckoutButtonInitializeOptions } from '../button-options';

export default interface CheckoutButtonStrategyNew {
    initialize(options: CheckoutButtonInitializeOptions): Promise<void>;

    deinitialize(): Promise<void>;
}
