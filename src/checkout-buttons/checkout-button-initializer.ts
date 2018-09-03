import { CheckoutStore, InternalCheckoutSelectors } from '../checkout';

import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonSelectors from './checkout-button-selectors';
import CheckoutButtonStrategyActionCreator from './checkout-button-strategy-action-creator';
import createCheckoutButtonSelectors from './create-checkout-button-selectors';

export default class CheckoutButtonInitializer {
    private _state: CheckoutButtonSelectors;

    /**
     * @internal
     */
    constructor(
        private _store: CheckoutStore,
        private _buttonStrategyActionCreator: CheckoutButtonStrategyActionCreator
    ) {
        this._state = createCheckoutButtonSelectors(this._store.getState());

        this._store.subscribe(state => {
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
            state => state.checkoutButton.getState(),
            ...filters.map(filter => (state: InternalCheckoutSelectors) => filter(createCheckoutButtonSelectors(state)))
        );
    }

    initializeButton(options: CheckoutButtonInitializeOptions): Promise<CheckoutButtonSelectors> {
        const action = this._buttonStrategyActionCreator.initialize(options);

        return this._store.dispatch(action, { queueId: `${options.methodId}ButtonStrategy` })
            .then(() => this.getState());
    }

    deinitializeButton(options: CheckoutButtonOptions): Promise<CheckoutButtonSelectors> {
        const action = this._buttonStrategyActionCreator.deinitialize(options);

        return this._store.dispatch(action, { queueId: `${options.methodId}ButtonStrategy` })
            .then(() => this.getState());
    }
}
