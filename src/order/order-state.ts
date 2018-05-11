import InternalIncompleteOrder from './internal-incomplete-order';
import InternalOrder, { InternalOrderMeta } from './internal-order';

export default interface OrderState {
    data?: InternalOrder | InternalIncompleteOrder;
    meta?: OrderMetaState;
    errors: OrderErrorsState;
    statuses: OrderStatusesState;
}

export interface OrderMetaState extends InternalOrderMeta {
    token?: string;
}

export interface OrderErrorsState {
    loadError?: Error;
    submitError?: Error;
    finalizeError?: Error;
}

export interface OrderStatusesState {
    isLoading?: boolean;
    isSubmitting?: boolean;
    isFinalizing?: boolean;
}
