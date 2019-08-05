import Customer from './customer';

export default interface CustomerState {
    data?: Customer;
}

export const DEFAULT_STATE: CustomerState = {};
