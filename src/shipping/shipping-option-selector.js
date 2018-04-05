import { find } from 'lodash';

export default class ShippingOptionSelector {
    /**
     * @constructor
     * @param {ShippingOptionsState} shippingOptions
     * @param {QuoteState} quote
     */
    constructor(shippingOptions = {}, quote = {}) {
        this._shippingOptions = shippingOptions;
        this._quote = quote;
    }

    /**
     * @return {InternalShippingOptionList}
     */
    getShippingOptions() {
        return this._shippingOptions.data;
    }

    /**
     * @return {?ShippingOption}
     */
    getSelectedShippingOption() {
        const { shippingAddress, shippingOption: optionId } = this._quote.data || {};
        const shippingOptions = this.getShippingOptions();

        if (!shippingAddress || !shippingOptions) {
            return;
        }

        return find(shippingOptions[shippingAddress.id], { id: optionId });
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._shippingOptions.errors && this._shippingOptions.errors.loadError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._shippingOptions.statuses && this._shippingOptions.statuses.isLoading);
    }
}
