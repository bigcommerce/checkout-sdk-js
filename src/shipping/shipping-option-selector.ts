import { find } from 'lodash';

import { selector } from '../common/selector';

import ConsignmentState from './consignment-state';
import InternalShippingOption, { InternalShippingOptionList } from './internal-shipping-option';
import mapToInternalShippingOption from './map-to-internal-shipping-option';
import mapToInternalShippingOptions from './map-to-internal-shipping-options';

@selector
export default class ShippingOptionSelector {
    constructor(
        private _consignments: ConsignmentState
    ) {}

    getShippingOptions(): InternalShippingOptionList | undefined {
        return this._consignments.data && mapToInternalShippingOptions(this._consignments.data);
    }

    getSelectedShippingOption(): InternalShippingOption | undefined {
        if (!this._consignments.data) {
            return;
        }

        const { selectedShippingOptionId, availableShippingOptions } = this._consignments.data[0];
        const shippingOption = find(availableShippingOptions, { id: selectedShippingOptionId });

        return shippingOption ?
            mapToInternalShippingOption(shippingOption, true)
            : undefined;
    }

    getLoadError(): Error | undefined {
        return this._consignments.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._consignments.statuses.isLoading;
    }

    getUpdateError(): Error | undefined {
        return this._consignments.errors.updateError;
    }

    isUpdating(): boolean {
        return !!this._consignments.statuses.isUpdating;
    }

    getCreateError(): Error | undefined {
        return this._consignments.errors.createError;
    }

    isCreating(): boolean {
        return !!this._consignments.statuses.isCreating;
    }
}
