import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { arrayReplace, objectMerge, objectSet } from '../common/utility';
import { CouponAction, CouponActionType } from '../coupon';
import { CustomerAction, CustomerActionType } from '../customer';

import Consignment from './consignment';
import { ConsignmentAction, ConsignmentActionType } from './consignment-actions';
import ConsignmentState, { ConsignmentErrorsState, ConsignmentStatusesState, DEFAULT_STATE } from './consignment-state';

export default function consignmentReducer(
    state: ConsignmentState = DEFAULT_STATE,
    action: Action
): ConsignmentState {
    const reducer = combineReducers<ConsignmentState, ConsignmentAction | CheckoutAction>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Consignment[] | undefined,
    action: ConsignmentAction | CheckoutAction | CouponAction | CustomerAction
): Consignment[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
        return arrayReplace(data, action.payload && action.payload.consignments);

    case CustomerActionType.SignOutCustomerSucceeded:
        return arrayReplace(data, []);

    default:
        return data;
    }
}

function errorsReducer(
    errors: ConsignmentErrorsState = DEFAULT_STATE.errors,
    action: ConsignmentAction | CheckoutAction
): ConsignmentErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.LoadShippingOptionsRequested:
        return objectSet(errors, 'loadError', undefined);

    case CheckoutActionType.LoadCheckoutFailed:
    case ConsignmentActionType.LoadShippingOptionsFailed:
        return objectSet(errors, 'loadError', action.payload);

    case ConsignmentActionType.CreateConsignmentsRequested:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
        return objectSet(errors, 'createError', undefined);

    case ConsignmentActionType.CreateConsignmentsFailed:
        return objectSet(errors, 'createError', action.payload);

    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentRequested:
        if (action.meta) {
            return objectMerge(errors, {
                updateError: {
                    [action.meta.id]: undefined,
                },
            });
        }

        return errors;

    case ConsignmentActionType.UpdateConsignmentFailed:
        if (action.meta) {
            return objectMerge(errors, {
                updateError: {
                    [action.meta.id]: action.payload,
                },
            });
        }

        return errors;

    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentRequested:
        if (action.meta) {
            return objectMerge(errors, {
                deleteError: {
                    [action.meta.id]: undefined,
                },
            });
        }

        return errors;

    case ConsignmentActionType.DeleteConsignmentFailed:
        if (action.meta) {
            return objectMerge(errors, {
                deleteError: {
                    [action.meta.id]: action.payload,
                },
            });
        }

        return errors;

    case ConsignmentActionType.UpdateShippingOptionRequested:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
        if (action.meta) {
            return objectMerge(errors, {
                updateShippingOptionError: {
                    [action.meta.id]: undefined,
                },
            });
        }

        return errors;

    case ConsignmentActionType.UpdateShippingOptionFailed:
        if (action.meta) {
            return objectMerge(errors, {
                updateShippingOptionError: {
                    [action.meta.id]: action.payload,
                },
            });
        }

        return errors;

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: ConsignmentStatusesState = DEFAULT_STATE.statuses,
    action: ConsignmentAction | CheckoutAction
): ConsignmentStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return objectSet(statuses, 'isLoading', true);

    case ConsignmentActionType.LoadShippingOptionsRequested:
        return objectSet(statuses, 'isLoadingShippingOptions', true);

    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.LoadCheckoutFailed:
        return objectSet(statuses, 'isLoading', false);

    case ConsignmentActionType.LoadShippingOptionsSucceeded:
    case ConsignmentActionType.LoadShippingOptionsFailed:
        return objectSet(statuses, 'isLoadingShippingOptions', false);

    case ConsignmentActionType.CreateConsignmentsRequested:
        return objectSet(statuses, 'isCreating', true);

    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.CreateConsignmentsFailed:
        return objectSet(statuses, 'isCreating', false);

    case ConsignmentActionType.UpdateConsignmentRequested:
        if (action.meta) {
            return objectMerge(statuses, {
                isUpdating: {
                    [action.meta.id]: true,
                },
            });
        }

        return statuses;

    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentFailed:
        if (action.meta) {
            return objectMerge(statuses, {
                isUpdating: {
                    [action.meta.id]: false,
                },
            });
        }

        return statuses;

    case ConsignmentActionType.DeleteConsignmentRequested:
        if (action.meta) {
            return objectMerge(statuses, {
                isDeleting: {
                    [action.meta.id]: true,
                },
            });
        }

        return statuses;

    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentFailed:
        if (action.meta) {
            return objectMerge(statuses, {
                isDeleting: {
                    [action.meta.id]: false,
                },
            });
        }

        return statuses;

    case ConsignmentActionType.UpdateShippingOptionRequested:
        if (action.meta) {
            return objectMerge(statuses, {
                isUpdatingShippingOption: {
                    [action.meta.id]: true,
                },
            });
        }

        return statuses;

    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case ConsignmentActionType.UpdateShippingOptionFailed:
        if (action.meta) {
            return objectMerge(statuses, {
                isUpdatingShippingOption: {
                    [action.meta.id]: false,
                },
            });
        }

        return statuses;

    default:
        return statuses;
    }
}
