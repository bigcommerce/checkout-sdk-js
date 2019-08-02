import { Omit } from '../common/types';

import { InternalOrderMeta, InternalOrderPayment } from './internal-order';
import Order from './order';

export default interface OrderState {
    data?: OrderDataState;
    meta?: OrderMetaState;
    errors: OrderErrorsState;
    statuses: OrderStatusesState;
}

export type OrderDataState = Omit<Order, 'billingAddress' | 'coupons'>;

export interface OrderMetaState extends InternalOrderMeta {
    token?: string;
    orderToken?: string;
    callbackUrl?: string;
    payment?: InternalOrderPayment;
    spamProtectionToken?: string;
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

export const DEFAULT_STATE: OrderState = {
    errors: {},
    meta: {},
    statuses: {},
};
