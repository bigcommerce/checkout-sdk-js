import CheckoutButtonInitializeOptions from './checkout-button-initialize-options';

export default interface CheckoutButtonStrategy {
    initialize(options: CheckoutButtonInitializeOptions): Promise<void>;

    deinitialize(): Promise<void>;
}
