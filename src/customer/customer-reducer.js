import { combineReducers } from '@bigcommerce/data-store';
import { CheckoutActionType } from '../checkout';
import { CustomerStrategyActionType } from './customer-strategy-actions';
import * as customerActionTypes from '../customer/customer-action-types';
import * as orderActionTypes from '../order/order-action-types';
import * as quoteActionTypes from '../quote/quote-action-types';
import mapToInternalCustomer from './map-to-internal-customer';

/**
 * @param {CustomerState} state
 * @param {Action} action
 * @return {CustomerState}
 */
export default function customerReducer(state = {}, action) {
    const reducer = combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

/**
 * @private
 * @param {?Customer} data
 * @param {Action} action
 * @return {?Customer}
 */
function dataReducer(data, action) {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...mapToInternalCustomer(action.payload, data) };

    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case orderActionTypes.LOAD_ORDER_SUCCEEDED:
    case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
    case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
    case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
        return action.payload ? { ...data, ...action.payload.customer } : data;

    default:
        return data;
    }
}

/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
function errorsReducer(errors = {}, action) {
    switch (action.type) {
    case CustomerStrategyActionType.SignInRequested:
    case CustomerStrategyActionType.SignInSucceeded:
    case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        return {
            ...errors,
            signInError: undefined,
            signInMethod: undefined,
        };

    case CustomerStrategyActionType.SignInFailed:
    case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
        return {
            ...errors,
            signInError: action.payload,
            signInMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignOutRequested:
    case CustomerStrategyActionType.SignOutSucceeded:
    case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        return {
            ...errors,
            signOutError: undefined,
            signOutMethod: undefined,
        };

    case CustomerStrategyActionType.SignOutFailed:
    case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
        return {
            ...errors,
            signOutError: action.payload,
            signOutMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.InitializeRequested:
    case CustomerStrategyActionType.InitializeSucceeded:
        return {
            ...errors,
            initializeError: undefined,
            initializeMethod: undefined,
        };

    case CustomerStrategyActionType.InitializeFailed:
        return {
            ...errors,
            initializeError: action.payload,
            initializeMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.DeinitializeRequested:
    case CustomerStrategyActionType.DeinitializeSucceeded:
        return {
            ...errors,
            deinitializeError: undefined,
            deinitializeMethod: undefined,
        };

    case CustomerStrategyActionType.DeinitializeFailed:
        return {
            ...errors,
            deinitializeError: action.payload,
            deinitializeMethod: action.meta && action.meta.methodId,
        };

    default:
        return errors;
    }
}

/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
function statusesReducer(statuses = {}, action) {
    switch (action.type) {
    case CustomerStrategyActionType.SignInRequested:
    case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
        return {
            ...statuses,
            signingInMethod: action.meta && action.meta.methodId,
            isSigningIn: true,
        };

    case CustomerStrategyActionType.SignInSucceeded:
    case CustomerStrategyActionType.SignInFailed:
    case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
        return {
            ...statuses,
            signingInMethod: undefined,
            isSigningIn: false,
        };

    case CustomerStrategyActionType.SignOutRequested:
    case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
        return {
            ...statuses,
            isSigningOut: true,
            signingOutMethod: action.meta && action.meta.methodId,
        };

    case CustomerStrategyActionType.SignOutSucceeded:
    case CustomerStrategyActionType.SignOutFailed:
    case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
    case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
        return {
            ...statuses,
            isSigningOut: false,
            signingOutMethod: undefined,
        };

    case CustomerStrategyActionType.InitializeRequested:
        return {
            ...statuses,
            initializingMethod: action.meta && action.meta.methodId,
            isInitializing: true,
        };

    case CustomerStrategyActionType.InitializeSucceeded:
    case CustomerStrategyActionType.InitializeFailed:
        return {
            ...statuses,
            initializingMethod: undefined,
            isInitializing: false,
        };

    case CustomerStrategyActionType.DeinitializeRequested:
        return {
            ...statuses,
            deinitializingMethod: action.meta && action.meta.methodId,
            isDeinitializing: true,
        };

    case CustomerStrategyActionType.DeinitializeSucceeded:
    case CustomerStrategyActionType.DeinitializeFailed:
        return {
            ...statuses,
            deinitializingMethod: undefined,
            isDeinitializing: false,
        };

    default:
        return statuses;
    }
}
