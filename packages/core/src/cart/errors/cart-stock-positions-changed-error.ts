import { StandardError } from '../../common/error/errors';

/**
 * This error is thrown when at least one cart item changed stock position (e.g. moved to a different warehouse)
 * and the server returns type `cart_stock_positions_changed`.
 */
export default class CartStockPositionsChangedError extends StandardError {
    changedItemIds: string[];

    constructor(changedItemIds: string[], message?: string) {
        super(
            message ||
                'At least one item changed stock position. Please review your cart and try again.',
        );

        this.name = 'CartStockPositionsChangedError';
        this.type = 'cart_stock_positions_changed';
        this.changedItemIds = changedItemIds;
    }
}
