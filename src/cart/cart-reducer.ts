import { combineReducers, Action } from '@bigcommerce/data-store';

import { BillingAddressAction, BillingAddressActionTypes } from '../billing/billing-address-actions';
import { CheckoutAction, CheckoutActionType } from '../checkout';
import { CouponAction, CouponActionType } from '../coupon/coupon-actions';
import { GiftCertificateAction, GiftCertificateActionType } from '../coupon/gift-certificate-actions';
import { CustomerAction, CustomerActionType } from '../customer';
import { ConsignmentAction, ConsignmentActionTypes } from '../shipping/consignment-actions';

import Cart from './cart';
import CartState, { CartErrorsState, CartStatusesState } from './cart-state';
import InternalCart from './internal-cart';
import mapToInternalCart from './map-to-internal-cart';

const DEFAULT_STATE: CartState = {
    errors: {},
    statuses: {},
};

export default function cartReducer(
    state: CartState = DEFAULT_STATE,
    action: Action
): CartState {
    const reducer = combineReducers<CartState>({
        data: dataReducer,
        externalData: externalDataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: InternalCart | undefined,
    action: BillingAddressAction | CheckoutAction | ConsignmentAction | CouponAction | GiftCertificateAction | CustomerAction
): InternalCart | undefined {
    switch (action.type) {
    case BillingAddressActionTypes.UpdateBillingAddressSucceeded:
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return action.payload ? { ...data, ...mapToInternalCart(action.payload) } : data;

    case CustomerActionType.SignInCustomerSucceeded:
    case CustomerActionType.SignOutCustomerSucceeded:
        return action.payload ? { ...data, ...action.payload.cart } : data;

    default:
        return data;
    }
}

function externalDataReducer(data: Cart | undefined, action: Action): Cart | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...data, ...action.payload.cart };

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
        return { ...statuses, isLoading: true };

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return { ...statuses, isLoading: false };

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
        return { ...errors, loadError: undefined };

    case CheckoutActionType.LoadCheckoutFailed:
        return { ...errors, loadError: action.payload };

    default:
        return errors;
    }
}
