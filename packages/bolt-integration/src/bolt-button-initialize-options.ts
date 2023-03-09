import { BoltBuyNowInitializeOptions } from './bolt';

export default interface BoltButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BoltBuyNowInitializeOptions;

    /**
     * A set of styling options for the checkout button.
     */
    style?: unknown; // TODO: add Bolt style options
}

export interface WithBoltButtonInitializeOptions {
    /**
     * The options that are required to initialize the Bolt payment
     * method. They can be omitted unless you need to support Bolt.
     */
    bolt?: BoltButtonInitializeOptions;
}
