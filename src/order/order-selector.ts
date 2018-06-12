import { selector } from '../common/selector';

import Order from './order';
import OrderState, { OrderMetaState } from './order-state';

@selector
export default class OrderSelector {
    constructor(
        private _order: OrderState
    ) {}

    getOrder(): Order | undefined {
        return this._order.data;
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
