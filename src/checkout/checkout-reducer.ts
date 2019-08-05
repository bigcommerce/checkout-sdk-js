import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { BillingAddressAction, BillingAddressActionType } from '../billing';
import { clearErrorReducer } from '../common/error';
import { CouponAction, CouponActionType, GiftCertificateAction, GiftCertificateActionType } from '../coupon';
import { OrderAction, OrderActionType } from '../order';
import { ConsignmentAction, ConsignmentActionType } from '../shipping';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutState, { CheckoutDataState, CheckoutErrorsState, CheckoutStatusesState, DEFAULT_STATE } from './checkout-state';

export default function checkoutReducer(
    state: CheckoutState = DEFAULT_STATE,
    action: Action
): CheckoutState {
    const reducer = combineReducers<CheckoutState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: CheckoutDataState | undefined,
    action: CheckoutAction | BillingAddressAction | ConsignmentAction | CouponAction | GiftCertificateAction | OrderAction
): CheckoutDataState | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.UpdateCheckoutSucceeded:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return action.payload
            ? omit({ ...data, ...action.payload }, ['billingAddress', 'cart', 'consignments', 'customer', 'coupons', 'giftCertifcates'])
            : data;

    case OrderActionType.SubmitOrderSucceeded:
        return action.payload && data
            ? { ...data, orderId: action.payload.order.orderId }
            : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: CheckoutErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | OrderAction
): CheckoutErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return {
            ...errors,
            loadError: undefined,
        };

    case CheckoutActionType.LoadCheckoutFailed:
        return {
            ...errors,
            loadError: action.payload,
        };

    case CheckoutActionType.UpdateCheckoutRequested:
    case CheckoutActionType.UpdateCheckoutSucceeded:
        return {
            ...errors,
            updateError: undefined,
        };

    case CheckoutActionType.UpdateCheckoutFailed:
        return {
            ...errors,
            updateError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CheckoutStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | OrderAction
): CheckoutStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return {
            ...statuses,
            isLoading: true,
        };

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return {
            ...statuses,
            isLoading: false,
        };

    case CheckoutActionType.UpdateCheckoutRequested:
        return {
            ...statuses,
            isUpdating: true,
        };

    case CheckoutActionType.UpdateCheckoutFailed:
    case CheckoutActionType.UpdateCheckoutSucceeded:
        return {
            ...statuses,
            isUpdating: false,
        };

    default:
        return statuses;
    }
}
