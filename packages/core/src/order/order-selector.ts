import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';
import { CouponSelector } from '../coupon';
import OrderBillingAddressSelector from '../order-billing-address/order-billing-address-selector';

import Order from './order';
import OrderState, { DEFAULT_STATE, OrderMetaState } from './order-state';

export default interface OrderSelector {
    getOrder(): Order | undefined;
    getOrderOrThrow(): Order;
    getOrderMeta(): OrderMetaState | undefined;
    getLoadError(): Error | undefined;
    getPaymentId(methodId: string): string | undefined;
    isLoading(): boolean;
}

export type OrderSelectorFactory = (
    state: OrderState,
    billingAddress: OrderBillingAddressSelector,
    coupons: CouponSelector,
) => OrderSelector;

interface OrderSelectorDependencies {
    billingAddress: OrderBillingAddressSelector;
    coupons: CouponSelector;
}

export function createOrderSelectorFactory(): OrderSelectorFactory {
    const getOrder = createSelector(
        (state: OrderState) => state.data,
        (_: OrderState, { billingAddress }: OrderSelectorDependencies) =>
            billingAddress.getOrderBillingAddress(),
        (_: OrderState, { coupons }: OrderSelectorDependencies) => coupons.getCoupons(),
        (data, billingAddress, coupons = []) =>
            () => {
                if (!data || !billingAddress) {
                    return;
                }

                return {
                    ...data,
                    billingAddress,
                    coupons,
                };
            },
    );

    const getOrderOrThrow = createSelector(getOrder, (getOrder) => () => {
        return guard(getOrder(), () => new MissingDataError(MissingDataErrorType.MissingOrder));
    });

    const getOrderMeta = createSelector(
        (state: OrderState) => state.meta,
        (meta) => () => meta,
    );

    const getLoadError = createSelector(
        (state: OrderState) => state.errors.loadError,
        (error) => () => error,
    );

    const getPaymentId = createSelector(
        (state: OrderState) => state.data?.payments,
        (payments = []) =>
            (methodId: string) => {
                const currentPayment = payments.find(({ providerId }) => providerId === methodId);

                return currentPayment?.paymentId;
            },
    );

    const isLoading = createSelector(
        (state: OrderState) => !!state.statuses.isLoading,
        (status) => () => status,
    );

    return memoizeOne(
        (
            state: OrderState = DEFAULT_STATE,
            billingAddress: OrderBillingAddressSelector,
            coupons: CouponSelector,
        ): OrderSelector => {
            return {
                getOrder: getOrder(state, { billingAddress, coupons }),
                getOrderOrThrow: getOrderOrThrow(state, { billingAddress, coupons }),
                getOrderMeta: getOrderMeta(state),
                getLoadError: getLoadError(state),
                getPaymentId: getPaymentId(state),
                isLoading: isLoading(state),
            };
        },
    );
}
