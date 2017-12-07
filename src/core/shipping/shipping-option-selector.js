import { find } from 'lodash';

export default class ShippingOptionSelector {
    /**
     * @constructor
     * @param {ShippingOptionsState} shippingOptions
     * @param {QuoteState} quote
     */
    constructor(shippingOptions = {}, quote = {}) {
        this._shippingOptions = shippingOptions.data;
        this._quote = quote.data;
        this._errors = shippingOptions.errors;
        this._statuses = shippingOptions.statuses;
    }

    /**
     * @return {ShippingOptionList}
     */
    getShippingOptions() {
        return this._shippingOptions;
    }

    /**
     * @return {?ShippingOption}
     */
    getSelectedShippingOption() {
        const { shippingAddress, shippingOption: optionId } = this._quote;
        const shippingOptions = shippingAddress ? this.getShippingOptions()[shippingAddress.id] : undefined;

        return find(shippingOptions, { id: optionId });
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getSelectError() {
        return this._errors && this._errors.selectError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }

    /**
     * @return {boolean}
     */
    isSelecting() {
        return !!(this._statuses && this._statuses.isSelecting);
    }
}
