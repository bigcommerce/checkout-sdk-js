import { merge } from 'lodash';

import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import ConsignmentSelector from './consignment-selector';
import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import { getShippingAddress } from './shipping-addresses.mock';

describe('ConsignmentSelector', () => {
    const emptyState: ConsignmentState = {
        statuses: { isUpdating: {}, isUpdatingShippingOption: {} },
        errors: { updateError: {}, updateShippingOptionError: {} },
    };

    const existingAddress = getShippingAddress();
    const unexistingAddress = { ...getShippingAddress(), address1: 'foo' };

    let selector: ConsignmentSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        state = getCheckoutStoreState();
    });

    describe('#getConsignmentByAddress()', () => {
        it('returns first matched consignment when address matches', () => {
            selector = new ConsignmentSelector(state.consignments);

            expect(selector.getConsignmentByAddress(existingAddress))
                // tslint:disable-next-line:no-non-null-assertion
                .toEqual(getConsignmentsState().data![0]);
        });

        it('returns undefined if no address matches a consignment', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getConsignmentByAddress(unexistingAddress))
                .toEqual(undefined);
        });
    });

    describe('#getConsignments()', () => {
        it('returns consignments', () => {
            selector = new ConsignmentSelector(state.consignments);

            expect(selector.getConsignments()).toEqual(getConsignmentsState().data);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getConsignments()).toEqual(undefined);
        });
    });

    describe('#getShippingOption()', () => {
        it('returns selected shipping option for default consignment', () => {
            selector = new ConsignmentSelector(state.consignments);

            expect(selector.getShippingOption()).toEqual(getConsignment().selectedShippingOption);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getConsignments()).toEqual(undefined);
        });
    });

    describe('#getLoadError()', () => {
        it('returns load error', () => {
            const loadError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { loadError },
            }));

            expect(selector.getLoadError()).toEqual(loadError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getLoadError()).toEqual(undefined);
        });
    });

    describe('#getCreateError()', () => {
        it('returns create error', () => {
            const createError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { createError },
            }));

            expect(selector.getCreateError()).toEqual(createError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getCreateError()).toEqual(undefined);
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns shipping options load error', () => {
            const loadShippingOptionsError = new Error();

            selector = new ConsignmentSelector(merge({}, emptyState, {
                errors: { loadShippingOptionsError },
            }));

            expect(selector.getLoadShippingOptionsError()).toEqual(loadShippingOptionsError);
        });

        it('returns undefined if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.getLoadShippingOptionsError()).toEqual(undefined);
        });
    });

    describe('#getUpdateShippingOptionError()', () => {
        it('returns undefined if none errored', () => {
            selector = new ConsignmentSelector(merge({}, emptyState));
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
                }));
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
            selector = new ConsignmentSelector(merge({}, emptyState));
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
                }));
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

    describe('#getUpdateErrorByAddress()', () => {
        const error = new Error();

        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                errors: {
                    updateError: {
                        '55c96cda6f04c': error,
                    },
                },
            }));
        });

        it('returns first encountered error for consignment with matching address', () => {
            expect(selector.getUpdateErrorByAddress(existingAddress)).toEqual(error);
        });

        it('returns undefined if address doesnt match existing consignments', () => {
            expect(selector.getUpdateErrorByAddress(unexistingAddress)).toEqual(undefined);
        });
    });

    describe('#getUpdateShippingOptionErrorByAddress()', () => {
        const error = new Error();

        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                errors: {
                    updateShippingOptionError: {
                        '55c96cda6f04c': error,
                    },
                },
            }));
        });

        it('returns first encountered error for consignment with matching address', () => {
            expect(selector.getUpdateShippingOptionErrorByAddress(existingAddress)).toEqual(error);
        });

        it('returns undefined if address doesnt match existing consignments', () => {
            expect(selector.getUpdateShippingOptionErrorByAddress(unexistingAddress)).toEqual(undefined);
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isLoading: true },
            }));

            expect(selector.isLoading()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.isLoading()).toEqual(false);
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isLoadingShippingOptions: true },
            }));

            expect(selector.isLoadingShippingOptions()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.isLoadingShippingOptions()).toEqual(false);
        });
    });

    describe('#isCreating()', () => {
        it('returns true if creating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState, {
                statuses: { isCreating: true },
            }));

            expect(selector.isCreating()).toEqual(true);
        });

        it('returns false if unavailable', () => {
            selector = new ConsignmentSelector(emptyState);

            expect(selector.isCreating()).toEqual(false);
        });
    });

    describe('#isUpdating()', () => {
        it('returns false if none is updating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState));
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
                }));
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

    describe('#isUpdatingAddress()', () => {
        const error = new Error();

        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                statuses: {
                    isUpdating: {
                        '55c96cda6f04c': true,
                    },
                },
            }));
        });

        it('returns true if updating consignment with given address', () => {
            expect(selector.isUpdatingAddress(existingAddress)).toEqual(true);
        });

        it('returns false if no consignment is found matching given address', () => {
            expect(selector.isUpdatingAddress(unexistingAddress)).toEqual(false);
        });
    });

    describe('#isUpdatingShippingOption()', () => {
        it('returns false if none is updating', () => {
            selector = new ConsignmentSelector(merge({}, emptyState));
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
                }));
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

    describe('#isUpdatingAddressShippingOption()', () => {
        const error = new Error();

        beforeEach(() => {
            selector = new ConsignmentSelector(merge(state.consignments, {
                statuses: {
                    isUpdatingShippingOption: {
                        '55c96cda6f04c': true,
                    },
                },
            }));
        });

        it('returns true if updating shipping option for consignment with given address', () => {
            expect(selector.isUpdatingAddressShippingOption(existingAddress)).toEqual(true);
        });

        it('returns false if no consignment is found matching given address', () => {
            expect(selector.isUpdatingAddressShippingOption(unexistingAddress)).toEqual(false);
        });
    });
});
