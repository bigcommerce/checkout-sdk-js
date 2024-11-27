import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { CheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { isElementId, setUniqueElementId } from '../common/dom';

import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from './checkout-button-options';
import CheckoutButtonSelectors from './checkout-button-selectors';
import CheckoutHeadlessButtonStrategyActionCreator from './checkout-headless-button-strategy-action-creator';
import createCheckoutButtonSelectors from './create-checkout-button-selectors';

@bind
export default class CheckoutHeadlessButtonInitializer {
    private _state: CheckoutButtonSelectors;

    /**
     * @internal
     */
    constructor(
        private _store: CheckoutStore,
        private _checkoutHeadlessButtonStrategyActionCreator: CheckoutHeadlessButtonStrategyActionCreator,
    ) {
        this._state = createCheckoutButtonSelectors(this._store.getState());

        this._store.subscribe((state) => {
            this._state = createCheckoutButtonSelectors(state);
        });
    }

    /**
     * Returns a snapshot of the current state.
     *
     * The method returns a new instance every time there is a change in the
     * state. You can query the state by calling any of its getter methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.errors.getInitializeButtonError());
     * console.log(state.statuses.isInitializingButton());
     * ```
     *
     * @returns The current customer's checkout state
     */
    getState(): CheckoutButtonSelectors {
        return this._state;
    }

    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the current state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.statuses.isInitializingButton());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.errors.getInitializeButtonError();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.errors.getInitializeButtonError())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    subscribe(
        subscriber: (state: CheckoutButtonSelectors) => void,
        ...filters: Array<(state: CheckoutButtonSelectors) => any>
    ): () => void {
        return this._store.subscribe(
            () => subscriber(this.getState()),
            (state) => state.checkoutButton.getState(),
            ...filters.map(
                (filter) => (state: InternalCheckoutSelectors) =>
                    filter(createCheckoutButtonSelectors(state)),
            ),
        );
    }

    /**
     * Initializes the headless wallet button of a payment method.
     *
     * When the headless wallet button is initialized, it will be inserted into the DOM,
     * ready to be interacted with by the customer.
     *
     * ```js
     * initializer.initializeHeadlessButton({
     *     methodId: 'braintreepaypal',
     *     containerId: 'headlessWalletButton',
     *     braintreepaypal: {
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    initializeHeadlessButton(
        options: CheckoutButtonInitializeOptions,
    ): Promise<CheckoutButtonSelectors> {
        const containerIds = this.getContainerIds(options);

        return Promise.all(
            containerIds.map((containerId) => {
                const action = this._checkoutHeadlessButtonStrategyActionCreator.initialize({
                    ...options,
                    containerId,
                });
                const queueId = `checkoutHeadlessButtonStrategy:${options.methodId}:${containerId}`;

                return this._store.dispatch(action, { queueId });
            }),
        ).then(() => this.getState());
    }

    /**
     * De-initializes the checkout button by performing any necessary clean-ups.
     *
     * ```js
     * await service.deinitializeHeadlessButton({
     *     methodId: 'braintreepaypal',
     * });
     * ```
     *
     * @param options - Options for deinitializing the checkout button.
     * @returns A promise that resolves to the current state.
     */
    deinitializeHeadlessButton(options: CheckoutButtonOptions): Promise<CheckoutButtonSelectors> {
        const action = this._checkoutHeadlessButtonStrategyActionCreator.deinitialize(options);
        const queueId = `checkoutHeadlessButtonStrategy:${options.methodId}`;

        return this._store.dispatch(action, { queueId }).then(() => this.getState());
    }

    private getContainerIds(options: CheckoutButtonInitializeOptions) {
        return isElementId(options.containerId)
            ? [options.containerId]
            : setUniqueElementId(options.containerId, `${options.methodId}-container`);
    }
}
