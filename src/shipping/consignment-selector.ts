import { find } from 'lodash';

import { selector } from '../common/selector';

import Consignment from './consignment';
import ConsignmentState from './consignment-state';
import ShippingOption from './shipping-option';

@selector
export default class ConsignmentSelector {
    constructor(
        private _consignments: ConsignmentState
    ) {}

    getConsignments(): Consignment[] | undefined {
        return this._consignments.data;
    }

    getShippingOption(): ShippingOption | undefined {
        const consignments = this._consignments.data;

        if (consignments && consignments.length) {
            return consignments[0].selectedShippingOption;
        }
    }

    getLoadError(): Error | undefined {
        return this._consignments.errors.loadError;
    }

    getCreateError(): Error | undefined {
        return this._consignments.errors.createError;
    }

    getLoadShippingOptionsError(): Error | undefined {
        return this._consignments.errors.loadShippingOptionsError;
    }

    getUpdateError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateError[consignmentId];
        }

        return find(this._consignments.errors.updateError);
    }

    getupdateShippingOptionError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateShippingOptionError[consignmentId];
        }

        return find(this._consignments.errors.updateShippingOptionError);
    }

    getUpdateConsignmentError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateError[consignmentId];
        }

        return find(this._consignments.errors.updateError);
    }

    isLoading(): boolean {
        return this._consignments.statuses.isLoading === true;
    }

    isLoadingShippingOptions(): boolean {
        return this._consignments.statuses.isLoadingShippingOptions === true;
    }

    isCreating(): boolean {
        return this._consignments.statuses.isCreating === true;
    }

    isUpdating(consignmentId?: string): boolean {
        if (consignmentId) {
            return this._consignments.statuses.isUpdating[consignmentId] === true;
        }

        return find(this._consignments.statuses.isUpdating) === true;
    }

    isUpdatingShippingOption(consignmentId?: string): boolean {
        if (consignmentId) {
            return this._consignments.statuses.isUpdatingShippingOption[consignmentId] === true;
        }

        return find(this._consignments.statuses.isUpdatingShippingOption) === true;
    }
}
