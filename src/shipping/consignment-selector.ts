import { find } from 'lodash';

import { AddressRequestBody } from '../address';
import isAddressEqual from '../address/is-address-equal';
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

    getConsignmentByAddress(address: AddressRequestBody): Consignment | undefined {
        const consignments = this._consignments.data;

        if (!consignments || !consignments.length) {
            return undefined;
        }

        return find(consignments, consignment =>
            isAddressEqual(consignment.shippingAddress, address)
        );
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

    getUpdateErrorByAddress(address: AddressRequestBody): Error | undefined {
        const consignment = this.getConsignmentByAddress(address);

        return consignment && this.getUpdateError(consignment.id);
    }

    getUpdateShippingOptionError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateShippingOptionError[consignmentId];
        }

        return find(this._consignments.errors.updateShippingOptionError);
    }

    getUpdateShippingOptionErrorByAddress(address: AddressRequestBody): Error | undefined {
        const consignment = this.getConsignmentByAddress(address);

        return consignment && this.getUpdateShippingOptionError(consignment.id);
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

    isUpdatingAddress(address: AddressRequestBody): boolean {
        const consignment = this.getConsignmentByAddress(address);

        return !!consignment && this.isUpdating(consignment.id);
    }

    isUpdatingShippingOption(consignmentId?: string): boolean {
        if (consignmentId) {
            return this._consignments.statuses.isUpdatingShippingOption[consignmentId] === true;
        }

        return find(this._consignments.statuses.isUpdatingShippingOption) === true;
    }

    isUpdatingAddressShippingOption(address: AddressRequestBody): boolean {
        const consignment = this.getConsignmentByAddress(address);

        return !!consignment && this.isUpdatingShippingOption(consignment.id);
    }
}
