import { createErrorAction } from '@bigcommerce/data-store';

import { CreateCustomerAction, CreateCustomerAddressAction, CustomerActionType } from './customer-actions';
import customerReducer from './customer-reducer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

describe('customerReducer()', () => {
    let initialState: CustomerState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('return is creating status true when requested', () => {
        const action: CreateCustomerAction = {
            type: CustomerActionType.CreateCustomerRequested,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreating: true,
            },
        }));
    });

    it('returns is creating status false when succeeded', () => {
        const action: CreateCustomerAction = {
            type: CustomerActionType.CreateCustomerSucceeded,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreating: false,
            },
        }));
    });

    it('returns is creating customer error', () => {
        const action = createErrorAction(CustomerActionType.CreateCustomerFailed, new Error());

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isCreating: false },
            errors: { createError: action.payload },
        }));
    });

    it('return is creating address status true when requested', () => {
        const action: CreateCustomerAddressAction = {
            type: CustomerActionType.CreateCustomerAddressRequested,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreatingAddress: true,
            },
        }));
    });

    it('returns is creating address status false when succeeded', () => {
        const action: CreateCustomerAddressAction = {
            type: CustomerActionType.CreateCustomerAddressSucceeded,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreatingAddress: false,
            },
        }));
    });

    it('returns is creating address error', () => {
        const action = createErrorAction(CustomerActionType.CreateCustomerAddressFailed, new Error());

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isCreatingAddress: false },
            errors: { createAddressError: action.payload },
        }));
    });
});
