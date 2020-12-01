import { createErrorAction } from '@bigcommerce/data-store';

import { CreateCustomerAction, CustomerActionType } from './customer-actions';
import customerReducer from './customer-reducer';
import CustomerState, { DEFAULT_STATE } from './customer-state';

describe('customerReducer()', () => {
    let initialState: CustomerState;

    beforeEach(() => {
        initialState = DEFAULT_STATE;
    });

    it('return is creating status', () => {
        const action: CreateCustomerAction = {
            type: CustomerActionType.CreateCustomerRequested,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreating: true,
            },
        }));
    });

    it('returns new state with customer data when checkout is loaded successfully', () => {
        const action: CreateCustomerAction = {
            type: CustomerActionType.CreateCustomerSucceeded,
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: {
                isCreating: false,
            },
        }));
    });

    it('returns new state with customer data when continue as guest is successful', () => {
        const action = createErrorAction(CustomerActionType.CreateCustomerFailed, new Error());

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isCreating: false },
            errors: { createError: action.payload },
        }));
    });
});
