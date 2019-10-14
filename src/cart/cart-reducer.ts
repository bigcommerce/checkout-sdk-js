import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { BillingAddressAction, BillingAddressActionType } from '../billing';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';
import { CouponAction, CouponActionType, GiftCertificateAction, GiftCertificateActionType } from '../coupon';
import { ConsignmentAction, ConsignmentActionType } from '../shipping';

import Cart from './cart';
import CartState, { CartErrorsState, CartStatusesState, DEFAULT_STATE } from './cart-state';

export default function cartReducer(
    state: CartState = DEFAULT_STATE,
    action: Action
): CartState {
    const reducer = combineReducers<CartState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Cart | undefined,
    action: BillingAddressAction | CheckoutAction | ConsignmentAction | CouponAction | GiftCertificateAction
): Cart | undefined {
    switch (action.type) {
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return objectMerge(data, action.payload && action.payload.cart);

    default:
        return data;
    }
}

function statusesReducer(
    statuses: CartStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction
): CartStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return objectSet(statuses, 'isLoading', true);

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectSet(statuses, 'isLoading', false);

    default:
        return statuses;
    }
}

function errorsReducer(
    errors: CartErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction
): CartErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case CheckoutActionType.LoadCheckoutFailed:
        return objectSet(errors, 'loadError', action.payload);

    default:
        return errors;
    }
}
