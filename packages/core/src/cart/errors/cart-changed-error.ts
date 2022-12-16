import { ComparableCheckout } from '../../checkout';
import { StandardError } from '../../common/error/errors';

export default class CartChangedError extends StandardError {
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    data: { previous: ComparableCheckout; updated: ComparableCheckout };

    constructor(previous: ComparableCheckout, updated: ComparableCheckout) {
        super(
            'An update to your shopping cart has been detected and your available shipping costs have been updated.',
        );

        this.name = 'CartChangedError';
        this.type = 'cart_changed';
        this.data = {
            previous,
            updated,
        };
    }
}
