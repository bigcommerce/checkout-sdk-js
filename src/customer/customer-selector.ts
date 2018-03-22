import CustomerState from './customer-state';
import InternalCustomer from './internal-customer';

export default class CustomerSelector {
    constructor(
        private _customer: CustomerState
    ) {}

    getCustomer(): InternalCustomer | undefined {
        return this._customer.data;
    }
}
