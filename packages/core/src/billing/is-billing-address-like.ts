import { Address } from '../address';

import BillingAddress from './billing-address';

export default function isBillingAddressLike(address: Address): address is BillingAddress {
    const billingAddress = address as BillingAddress;

    return typeof billingAddress.id !== 'undefined';
}
