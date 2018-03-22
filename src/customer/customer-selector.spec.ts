import CustomerSelector from './customer-selector';
import { getCustomerState } from './internal-customers.mock';

describe('CustomerSelector', () => {
    let selector: CustomerSelector;
    let state;

    beforeEach(() => {
        state = {
            customer: getCustomerState(),
        };
    });

    describe('#getCustomer()', () => {
        it('returns current customer', () => {
            selector = new CustomerSelector(state.customer);

            expect(selector.getCustomer()).toEqual(state.customer.data);
        });

        it('returns undefined if customer is unavailable', () => {
            selector = new CustomerSelector({});

            expect(selector.getCustomer()).toEqual(undefined);
        });
    });
});
