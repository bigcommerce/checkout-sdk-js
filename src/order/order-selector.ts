import { BillingAddressSelector } from '../billing';
import { selector } from '../common/selector';
import { CouponSelector } from '../coupon';

import Order from './order';
import OrderState, { OrderMetaState } from './order-state';

@selector
export default class OrderSelector {
    constructor(
        private _order: OrderState,
        private _billingAddress: BillingAddressSelector,
        private _coupons: CouponSelector
    ) {}

    getOrder(): Order | undefined {
        const { data } = this._order;
        const billingAddress = this._billingAddress.getBillingAddress();
        const coupons = this._coupons.getCoupons() || [];

        if (!data || !billingAddress) {
            return;
        }

        return {
            ...data,
            billingAddress,
            coupons,
        };
    }

    getOrderMeta(): OrderMetaState | undefined {
        return this._order.meta;
    }

    getLoadError(): Error | undefined {
        return this._order.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._order.statuses.isLoading;
    }
}
