import { find } from 'lodash';

import { selector } from '../common/selector';

import Consignment from './consignment';
import ConsignmentState from './consignment-state';
import ShippingOption from './shipping-option';

@selector
export default class ShippingOptionSelector {
    constructor(
        private _consignments: ConsignmentState
    ) {}

    getShippingOptions(): ShippingOption[] | undefined {
        const consignment = this._getConsignment();

        return consignment && consignment.availableShippingOptions;
    }

    getSelectedShippingOption(): ShippingOption | undefined {
        const consignment = this._getConsignment();

        if (!consignment) {
            return;
        }

        const { selectedShippingOptionId, availableShippingOptions } = consignment;
        const shippingOption = find(availableShippingOptions, { id: selectedShippingOptionId });

        return shippingOption;
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

    private _getConsignment(): Consignment | undefined {
        if (!this._consignments.data) {
            return;
        }

        return this._consignments.data[0];
    }
}
