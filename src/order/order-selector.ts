import { BillingAddressSelector } from '../billing';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';
import { CouponSelector } from '../coupon';

import Order from './order';
import OrderState, { DEFAULT_STATE, OrderMetaState } from './order-state';

export default interface OrderSelector {
    getOrder(): Order | undefined;
    getOrderMeta(): OrderMetaState | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type OrderSelectorFactory = (
    state: OrderState,
    billingAddress: BillingAddressSelector,
    coupons: CouponSelector
) => OrderSelector;

interface OrderSelectorDependencies {
    billingAddress: BillingAddressSelector;
    coupons: CouponSelector;
}

export function createOrderSelectorFactory(): OrderSelectorFactory {
    const getOrder = createSelector(
        (state: OrderState) => state.data,
        (_: OrderState, { billingAddress }: OrderSelectorDependencies) => billingAddress.getBillingAddress(),
        (_: OrderState, { coupons }: OrderSelectorDependencies) => coupons.getCoupons(),
        (data, billingAddress, coupons = []) => () => {
            if (!data || !billingAddress) {
                return;
            }

            return {
                ...data,
                billingAddress,
                coupons,
            };
        }
    );

    const getOrderMeta = createSelector(
        (state: OrderState) => state.meta,
        meta => () => meta
    );

    const getLoadError = createSelector(
        (state: OrderState) => state.errors.loadError,
        error => () => error
    );

    const isLoading = createSelector(
        (state: OrderState) => !!state.statuses.isLoading,
        status => () => status
    );

    return memoizeOne((
        state: OrderState = DEFAULT_STATE,
        billingAddress: BillingAddressSelector,
        coupons: CouponSelector
    ): OrderSelector => {
        return {
            getOrder: getOrder(state, { billingAddress, coupons }),
            getOrderMeta: getOrderMeta(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
