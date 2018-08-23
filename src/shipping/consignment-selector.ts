import { find } from 'lodash';

import { isAddressEqual, AddressRequestBody } from '../address';
import { CartSelector, PhysicalItem } from '../cart';
import { selector } from '../common/selector';

import Consignment from './consignment';
import ConsignmentState from './consignment-state';
import ShippingOption from './shipping-option';

@selector
export default class ConsignmentSelector {
    constructor(
        private _consignments: ConsignmentState,
        private _cart: CartSelector
    ) {}

    getConsignments(): Consignment[] | undefined {
        return this._consignments.data;
    }

    getConsignmentById(id: string): Consignment | undefined {
        const consignments = this._consignments.data;

        if (!consignments || !consignments.length) {
            return;
        }

        return find(consignments, { id });
    }

    getConsignmentByAddress(address: AddressRequestBody): Consignment | undefined {
        const consignments = this._consignments.data;

        if (!consignments || !consignments.length) {
            return;
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

    getUnassignedItems(): PhysicalItem[] {
        const cart = this._cart.getCart();

        if (!cart) {
            return [];
        }

        const assignedLineItemIds = (this.getConsignments() || []).reduce(
            (itemIds, consignment) => itemIds.concat(consignment.lineItemIds),
            [] as string[]
        );

        return (cart.lineItems.physicalItems || []).filter(
            item => assignedLineItemIds.indexOf(item.id as string) < 0
        );
    }

    getUpdateError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateError[consignmentId];
        }

        return find(this._consignments.errors.updateError);
    }

    getDeleteError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.deleteError[consignmentId];
        }

        return find(this._consignments.errors.deleteError);
    }

    getItemAssignmentError(address: AddressRequestBody): Error | undefined {
        const consignment = this.getConsignmentByAddress(address);

        return consignment ? this.getUpdateError(consignment.id) : this.getCreateError();
    }

    getUpdateShippingOptionError(consignmentId?: string): Error | undefined {
        if (consignmentId) {
            return this._consignments.errors.updateShippingOptionError[consignmentId];
        }

        return find(this._consignments.errors.updateShippingOptionError);
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

    isDeleting(consignmentId?: string): boolean {
        if (consignmentId) {
            return this._consignments.statuses.isDeleting[consignmentId] === true;
        }

        return find(this._consignments.statuses.isDeleting) === true;
    }

    isAssigningItems(address: AddressRequestBody): boolean {
        const consignment = this.getConsignmentByAddress(address);

        return consignment ? this.isUpdating(consignment.id) : this.isCreating();
    }

    isUpdatingShippingOption(consignmentId?: string): boolean {
        if (consignmentId) {
            return this._consignments.statuses.isUpdatingShippingOption[consignmentId] === true;
        }

        return find(this._consignments.statuses.isUpdatingShippingOption) === true;
    }
}
