import { find } from 'lodash';

import { selector } from '../common/selector';
import { QuoteState } from '../quote';

import InternalShippingOption, { InternalShippingOptionList } from './internal-shipping-option';
import ShippingOptionState from './shipping-option-state';

@selector
export default class ShippingOptionSelector {
    constructor(
        private _shippingOptions: ShippingOptionState,
        private _quote: QuoteState
    ) {}

    getShippingOptions(): InternalShippingOptionList | undefined {
        return this._shippingOptions.data;
    }

    getSelectedShippingOption(): InternalShippingOption | undefined {
        const { shippingAddress = null, shippingOption: optionId = null } = this._quote.data || {};
        const shippingOptions = this.getShippingOptions();

        if (!shippingAddress || !shippingOptions) {
            return;
        }

        return find(shippingOptions[shippingAddress.id], { id: optionId });
    }

    getLoadError(): Error | undefined {
        return this._shippingOptions.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._shippingOptions.statuses.isLoading;
    }
}
