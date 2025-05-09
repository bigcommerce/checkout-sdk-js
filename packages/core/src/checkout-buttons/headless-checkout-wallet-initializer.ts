import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { isElementId, setUniqueElementId } from '../common/dom';
import { HeadlessButtonStore } from '../headless-buttons';
import HeadlessButtonSelectors from '../headless-buttons/headless-button-selectors';

import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonSelectors from './checkout-button-selectors';
import createCheckoutButtonSelectors from './create-checkout-button-selectors';
import HeadlessCheckoutWalletStrategyActionCreator from './headless-checkout-wallet-strategy-action-creator';

@bind
export default class HeadlessCheckoutWalletInitializer {
    private _state: CheckoutButtonSelectors;

    constructor(
        private _store: HeadlessButtonStore,
        private _headlessCheckoutWalletStrategyActionCreator: HeadlessCheckoutWalletStrategyActionCreator,
    ) {
        this._state = createCheckoutButtonSelectors(this._store.getState());

        this._store.subscribe((state) => {
            this._state = createCheckoutButtonSelectors(state);
        });
    }

    getState(): CheckoutButtonSelectors {
        return this._state;
    }

    subscribe(
        subscriber: (state: CheckoutButtonSelectors) => void,
        ...filters: Array<(state: CheckoutButtonSelectors) => any>
    ): () => void {
        return this._store.subscribe(
            () => subscriber(this.getState()),
            (state) => state.checkoutButton.getState(),
            ...filters.map(
                (filter) => (state: HeadlessButtonSelectors) =>
                    filter(createCheckoutButtonSelectors(state)),
            ),
        );
    }

    initializeHeadlessButton(
        options: CheckoutButtonInitializeOptions,
    ): Promise<CheckoutButtonSelectors> {
        const containerIds = this.getContainerIds(options);

        return Promise.all(
            containerIds.map((containerId) => {
                const action = this._headlessCheckoutWalletStrategyActionCreator.initialize({
                    ...options,
                    containerId,
                });
                const queueId = `checkoutHeadlessButtonStrategy:${options.methodId}:${containerId}`;

                return this._store.dispatch(action, { queueId });
            }),
        ).then(() => this.getState());
    }

    deinitializeHeadlessButton(options: CheckoutButtonOptions): Promise<CheckoutButtonSelectors> {
        const action = this._headlessCheckoutWalletStrategyActionCreator.deinitialize(options);
        const queueId = `checkoutHeadlessButtonStrategy:${options.methodId}`;

        return this._store.dispatch(action, { queueId }).then(() => this.getState());
    }

    private getContainerIds(options: CheckoutButtonInitializeOptions) {
        return isElementId(options.containerId)
            ? [options.containerId]
            : setUniqueElementId(options.containerId, `${options.methodId}-container`);
    }
}
