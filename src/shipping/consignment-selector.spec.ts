import { merge } from 'lodash';

import { createCartSelectorFactory, CartSelector } from '../cart';
import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import ConsignmentSelector from './consignment-selector';
import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import { getShippingAddress } from './shipping-addresses.mock';

describe('ConsignmentSelector', () => {
    const emptyState: ConsignmentState = {
        statuses: {
            isUpdating: {},
            isUpdatingShippingOption: {},
            isDeleting: {},
        },
        errors: {
            updateError: {},
            updateShippingOptionError: {},
            deleteError: {},
        },
    };

    const existingAddress = getShippingAddress();
    const nonexistentAddress = { ...getShippingAddress(), address1: 'foo' };

    let selector: ConsignmentSelector;
    let state: CheckoutStoreState;
    let cartSelector: CartSelector;

    beforeEach(() => {
        state = getCheckoutStoreState();
        cartSelector = createCartSelectorFactory()(state.cart);
    });

    describe('#getConsignmentByAddress()', () => {
        it('returns first matched consignment when address matches', () => {
            selector = new ConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignmentByAddress(existingAddress))
                // tslint:disable-next-line:no-non-null-assertion
                .toEqual(getConsignmentsState().data![0]);
        });

        it('returns undefined if no address matches a consignment', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignmentByAddress(nonexistentAddress))
                .toEqual(undefined);
        });
    });

    describe('#getConsignmentById()', () => {
        it('returns consignment that matches id', () => {
            selector = new ConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignmentById('55c96cda6f04c'))
                // tslint:disable-next-line:no-non-null-assertion
                .toEqual(getConsignmentsState().data![0]);
        });

        it('returns undefined if no id matches a consignment', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignmentById('none'))
                .toEqual(undefined);
        });
    });

    describe('#getConsignments()', () => {
        it('returns consignments', () => {
            selector = new ConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getConsignments()).toEqual(getConsignmentsState().data);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignments()).toEqual(undefined);
        });
    });

    describe('#getShippingOption()', () => {
        it('returns selected shipping option for default consignment', () => {
            selector = new ConsignmentSelector(state.consignments, cartSelector);

            expect(selector.getShippingOption()).toEqual(getConsignment().selectedShippingOption);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getConsignments()).toEqual(undefined);
        });
    });

    describe('#getLoadError()', () => {
        it('returns load error', () => {
            const loadError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { loadError },
            }), cartSelector);

            expect(selector.getLoadError()).toEqual(loadError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getLoadError()).toEqual(undefined);
        });
    });

    describe('#getCreateError()', () => {
        it('returns create error', () => {
            const createError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { createError },
            }), cartSelector);

            expect(selector.getCreateError()).toEqual(createError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getCreateError()).toEqual(undefined);
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns shipping options load error', () => {
            const loadShippingOptionsError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { loadShippingOptionsError },
            }), cartSelector);

            expect(selector.getLoadShippingOptionsError()).toEqual(loadShippingOptionsError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.getLoadShippingOptionsError()).toEqual(undefined);
        });
    });

    describe('#getUpdateShippingOptionError()', () => {
        it('returns undefined if none errored', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.getUpdateShippingOptionError()).toEqual(undefined);
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    errors: {
                        updateShippingOptionError: {
                            foo: error,
                        },
                    },
                }), cartSelector);
            });

            it('returns first encountered error', () => {
                expect(selector.getUpdateShippingOptionError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getUpdateShippingOptionError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getUpdateShippingOptionError('bar')).toEqual(undefined);
            });
        });
    });

    describe('#getUpdateError()', () => {
        it('returns undefined if none errored', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.getUpdateError()).toEqual(undefined);
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    errors: {
                        updateError: {
                            foo: error,
                        },
                    },
                }), cartSelector);
            });

            it('returns first encountered error', () => {
                expect(selector.getUpdateError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getUpdateError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getUpdateError('bar')).toEqual(undefined);
            });
        });
    });

    describe('#getDeleteError()', () => {
        it('returns undefined if none errored', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.getDeleteError()).toEqual(undefined);
        });

        describe('when only one consignment errored', () => {
            const error = new Error();

            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    errors: {
                        deleteError: {
                            foo: error,
                        },
                    },
                }), cartSelector);
            });

            it('returns first encountered error', () => {
                expect(selector.getDeleteError()).toEqual(error);
            });

            it('returns error if requested id errored', () => {
                expect(selector.getDeleteError('foo')).toEqual(error);
            });

            it('returns undefined if requested id did not error', () => {
                expect(selector.getDeleteError('bar')).toEqual(undefined);
            });
        });
    });

    describe('#getItemAssignmentError()', () => {
        const updateError = new Error();
        const createError = new Error();

        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                errors: {
                    updateError: {
                        '55c96cda6f04c': updateError,
                    },
                    createError,
                },
            }), cartSelector);
        });

        it('returns first encountered error for consignment with matching address', () => {
            expect(selector.getItemAssignmentError(existingAddress)).toEqual(updateError);
        });

        it('returns create error when address does not match any consignment', () => {
            expect(selector.getItemAssignmentError(nonexistentAddress)).toEqual(createError);
        });
    });

    describe('#getUnassignedItems()', () => {
        beforeEach(() => {
            selector = new ConsignmentSelector(state.consignments, cartSelector);
        });

        it('returns unassigned items', () => {
            expect(selector.getUnassignedItems()).toEqual([
                // tslint:disable-next-line:no-non-null-assertion
                state.cart.data!.lineItems.physicalItems[0],
            ]);
        });

        it('returns empty array if all items are assigned', () => {
            jest.spyOn(cartSelector, 'getCart').mockReturnValue({
                ...state.cart,
                lineItems: {
                    physicalItems: [{
                        // tslint:disable-next-line:no-non-null-assertion
                        ...state.cart.data!.lineItems.physicalItems[0],
                        id: '12e11c8f-7dce-4da3-9413-b649533f8bad',
                    }],
                },
            });
            expect(selector.getUnassignedItems()).toEqual([]);
        });

        it('returns empty array if there are no phyisical items', () => {
            jest.spyOn(cartSelector, 'getCart').mockReturnValue({
                ...state.cart,
                lineItems: { physicalItems: null },
            });
            expect(selector.getUnassignedItems()).toEqual([]);
        });

        it('returns empty array if there is no cart', () => {
            jest.spyOn(cartSelector, 'getCart').mockReturnValue(null);
            expect(selector.getUnassignedItems()).toEqual([]);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isLoading: true },
            }), cartSelector);

            expect(selector.isLoading()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.isLoading()).toEqual(false);
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isLoadingShippingOptions: true },
            }), cartSelector);

            expect(selector.isLoadingShippingOptions()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.isLoadingShippingOptions()).toEqual(false);
        });
    });

    describe('#isCreating()', () => {
        it('returns true if creating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isCreating: true },
            }), cartSelector);

            expect(selector.isCreating()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState, cartSelector);

            expect(selector.isCreating()).toEqual(false);
        });
    });

    describe('#isUpdating()', () => {
        it('returns false if none is updating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.isUpdating()).toEqual(false);
        });

        describe('when only one consignment is being updated', () => {
            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    statuses: {
                        isUpdating: {
                            foo: true,
                            bar: false,
                        },
                    },
                }), cartSelector);
            });

            it('returns true if updating any', () => {
                expect(selector.isUpdating()).toEqual(true);
            });

            it('returns true if requested id is being updated', () => {
                expect(selector.isUpdating('foo')).toEqual(true);
            });

            it('returns false if requested id is not being updated', () => {
                expect(selector.isUpdating('bar')).toEqual(false);
            });
        });
    });

    describe('#isDeleting()', () => {
        it('returns false if none is deleting', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.isDeleting()).toEqual(false);
        });

        describe('when only one consignment is being deleted', () => {
            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    statuses: {
                        isDeleting: {
                            foo: true,
                            bar: false,
                        },
                    },
                }), cartSelector);
            });

            it('returns true if deleting any', () => {
                expect(selector.isDeleting()).toEqual(true);
            });

            it('returns true if requested id is being deleted', () => {
                expect(selector.isDeleting('foo')).toEqual(true);
            });

            it('returns false if requested id is not being deleted', () => {
                expect(selector.isDeleting('bar')).toEqual(false);
            });
        });
    });

    describe('#isAssigningItems()', () => {
        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                statuses: {
                    isUpdating: {
                        '55c96cda6f04c': true,
                    },
                    isCreating: false,
                },
            }), cartSelector);
        });

        it('returns isUpdating state for consignment that matches given address', () => {
            expect(selector.isAssigningItems(existingAddress)).toEqual(true);
        });

        it('returns isCreating state when no consignment matches address', () => {
            expect(selector.isAssigningItems(nonexistentAddress)).toEqual(false);
        });
    });

    describe('#isUpdatingShippingOption()', () => {
        it('returns false if none is updating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState), cartSelector);
            expect(selector.isUpdatingShippingOption()).toEqual(false);
        });

        describe('when only one consignment is being updated', () => {
            beforeEach(() => {
                selector = new ConsignmentSelector(merge({}, emptyState, {
                    statuses: {
                        isUpdatingShippingOption: {
                            foo: true,
                            bar: false,
                        },
                    },
                }), cartSelector);
            });

            it('returns true if updating any', () => {
                expect(selector.isUpdatingShippingOption()).toEqual(true);
            });

            it('returns true if requested id is being updated', () => {
                expect(selector.isUpdatingShippingOption('foo')).toEqual(true);
            });

            it('returns false if requested id is not being updated', () => {
                expect(selector.isUpdatingShippingOption('bar')).toEqual(false);
            });
        });
    });
});
