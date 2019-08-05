import { find } from 'lodash';

import { isAddressEqual, AddressRequestBody } from '../address';
import { CartSelector, PhysicalItem } from '../cart';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import Consignment from './consignment';
import ConsignmentState, { DEFAULT_STATE } from './consignment-state';
import ShippingOption from './shipping-option';

export default interface ConsignmentSelector {
    getConsignments(): Consignment[] | undefined;
    getConsignmentById(id: string): Consignment | undefined;
    getConsignmentByAddress(address: AddressRequestBody): Consignment | undefined;
    getShippingOption(): ShippingOption | undefined;
    getLoadError(): Error | undefined;
    getCreateError(): Error | undefined;
    getLoadShippingOptionsError(): Error | undefined;
    getUnassignedItems(): PhysicalItem[];
    getUpdateError(consignmentId?: string): Error | undefined;
    getDeleteError(consignmentId?: string): Error | undefined;
    getItemAssignmentError(address: AddressRequestBody): Error | undefined;
    getUpdateShippingOptionError(consignmentId?: string): Error | undefined;
    isLoading(): boolean;
    isLoadingShippingOptions(): boolean;
    isCreating(): boolean;
    isUpdating(consignmentId?: string): boolean;
    isDeleting(consignmentId?: string): boolean;
    isAssigningItems(address: AddressRequestBody): boolean;
    isUpdatingShippingOption(consignmentId?: string): boolean;
}

export type ConsignmentSelectorFactory = (
    state: ConsignmentState,
    cart: CartSelector
) => ConsignmentSelector;

interface ConsignmentSelectorDependencies {
    cart: CartSelector;
}

export function createConsignmentSelectorFactory(): ConsignmentSelectorFactory {
    const getConsignments = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => () => consignments
    );

    const getConsignmentById = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => (id: string) => {
            if (!consignments || !consignments.length) {
                return;
            }

            return find(consignments, { id });
        }
    );

    const getConsignmentByAddress = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => (address: AddressRequestBody) => {
            if (!consignments || !consignments.length) {
                return;
            }

            return find(consignments, consignment =>
                isAddressEqual(consignment.shippingAddress, address)
            );
        }
    );

    const getShippingOption = createSelector(
        (state: ConsignmentState) => state.data,
        consignments => () => {
            if (consignments && consignments.length) {
                return consignments[0].selectedShippingOption;
            }
        }
    );

    const getLoadError = createSelector(
        (state: ConsignmentState) => state.errors.loadError,
        error => () => error
    );

    const getCreateError = createSelector(
        (state: ConsignmentState) => state.errors.createError,
        error => () => error
    );

    const getLoadShippingOptionsError = createSelector(
        (state: ConsignmentState) => state.errors.loadShippingOptionsError,
        error => () => error
    );

    const getUnassignedItems = createSelector(
        getConsignments,
        (_: ConsignmentState, { cart }: ConsignmentSelectorDependencies) => cart.getCart,
        (getConsignments, getCart) => () => {
            const cart = getCart();

            if (!cart) {
                return [];
            }

            const assignedLineItemIds = (getConsignments() || []).reduce(
                (itemIds, consignment) => itemIds.concat(consignment.lineItemIds),
                [] as string[]
            );

            return (cart.lineItems.physicalItems || []).filter(
                item => assignedLineItemIds.indexOf(item.id as string) < 0
            );
        }
    );

    const getUpdateError = createSelector(
        (state: ConsignmentState) => state.errors.updateError,
        updateError => (consignmentId?: string) => {
            if (consignmentId) {
                return updateError[consignmentId];
            }

            return find(updateError);
        }
    );

    const getDeleteError = createSelector(
        (state: ConsignmentState) => state.errors.deleteError,
        deleteError => (consignmentId?: string) => {
            if (consignmentId) {
                return deleteError[consignmentId];
            }

            return find(deleteError);
        }
    );

    const getItemAssignmentError = createSelector(
        getConsignmentByAddress,
        getUpdateError,
        getCreateError,
        (getConsignmentByAddress, getUpdateError, getCreateError) => (address: AddressRequestBody) => {
            const consignment = getConsignmentByAddress(address);

            return consignment ? getUpdateError(consignment.id) : getCreateError();
        }
    );

    const getUpdateShippingOptionError = createSelector(
        (state: ConsignmentState) => state.errors.updateShippingOptionError,
        updateShippingOptionError => (consignmentId?: string) => {
            if (consignmentId) {
                return updateShippingOptionError[consignmentId];
            }

            return find(updateShippingOptionError);
        }
    );

    const isLoading = createSelector(
        (state: ConsignmentState) => state.statuses.isLoading,
        isLoading => () => isLoading === true
    );

    const isLoadingShippingOptions = createSelector(
        (state: ConsignmentState) => state.statuses.isLoadingShippingOptions,
        isLoadingShippingOptions => () => isLoadingShippingOptions === true
    );

    const isCreating = createSelector(
        (state: ConsignmentState) => state.statuses.isCreating,
        isCreating => () => isCreating === true
    );

    const isUpdating = createSelector(
        (state: ConsignmentState) => state.statuses.isUpdating,
        isUpdating => (consignmentId?: string) => {
            if (consignmentId) {
                return isUpdating[consignmentId] === true;
            }

            return find(isUpdating) === true;
        }
    );

    const isDeleting = createSelector(
        (state: ConsignmentState) => state.statuses.isDeleting,
        isDeleting => (consignmentId?: string) => {
            if (consignmentId) {
                return isDeleting[consignmentId] === true;
            }

            return find(isDeleting) === true;
        }
    );

    const isAssigningItems = createSelector(
        getConsignmentByAddress,
        isUpdating,
        isCreating,
        (getConsignmentByAddress, isUpdating, isCreating) => (address: AddressRequestBody) => {
            const consignment = getConsignmentByAddress(address);

            return consignment ? isUpdating(consignment.id) : isCreating();
        }
    );

    const isUpdatingShippingOption = createSelector(
        (state: ConsignmentState) => state.statuses.isUpdatingShippingOption,
        isUpdatingShippingOption => (consignmentId?: string) => {
            if (consignmentId) {
                return isUpdatingShippingOption[consignmentId] === true;
            }

            return find(isUpdatingShippingOption) === true;
        }
    );

    return memoizeOne((
        state: ConsignmentState = DEFAULT_STATE,
        cart: CartSelector
    ): ConsignmentSelector => {
        return {
            getConsignments: getConsignments(state),
            getConsignmentById: getConsignmentById(state),
            getConsignmentByAddress: getConsignmentByAddress(state),
            getShippingOption: getShippingOption(state),
            getLoadError: getLoadError(state),
            getCreateError: getCreateError(state),
            getLoadShippingOptionsError: getLoadShippingOptionsError(state),
            getUnassignedItems: getUnassignedItems(state, { cart }),
            getUpdateError: getUpdateError(state),
            getDeleteError: getDeleteError(state),
            getItemAssignmentError: getItemAssignmentError(state),
            getUpdateShippingOptionError: getUpdateShippingOptionError(state),
            isLoading: isLoading(state),
            isLoadingShippingOptions: isLoadingShippingOptions(state),
            isCreating: isCreating(state),
            isUpdating: isUpdating(state),
            isDeleting: isDeleting(state),
            isAssigningItems: isAssigningItems(state),
            isUpdatingShippingOption: isUpdatingShippingOption(state),
        };
    });
}
