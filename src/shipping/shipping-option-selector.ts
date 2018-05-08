import { find } from 'lodash';

import { selector } from '../common/selector';

/**
 * @todo Convert this file into TypeScript properly
 */
@selector
export default class ShippingOptionSelector {
    /**
     * @constructor
     * @param {ShippingOptionsState} shippingOptions
     * @param {QuoteState} quote
     */
    constructor(
        private _shippingOptions: any = {},
        private _quote: any = {}
    ) {}

    /**
     * @return {InternalShippingOptionList}
     */
    getShippingOptions(): any | undefined {
        return this._shippingOptions.data;
    }

    /**
     * @return {?ShippingOption}
     */
    getSelectedShippingOption(): any | undefined {
        const { shippingAddress = null, shippingOption: optionId = null } = this._quote.data || {};
        const shippingOptions = this.getShippingOptions();

        if (!shippingAddress || !shippingOptions) {
            return;
        }

        return find(shippingOptions[shippingAddress.id], { id: optionId });
    }

    getLoadError(): Error | undefined {
        return this._shippingOptions.errors && this._shippingOptions.errors.loadError;
    }

    isLoading(): boolean {
        return !!(this._shippingOptions.statuses && this._shippingOptions.statuses.isLoading);
    }
}
