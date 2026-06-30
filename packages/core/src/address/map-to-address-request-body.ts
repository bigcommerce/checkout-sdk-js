import { omit } from 'lodash';

import { CustomerAddress } from '../customer';

import Address from './address';

const CUSTOMER_ADDRESS_METADATA_FIELDS: Array<keyof CustomerAddress> = [
    'isShipping',
    'isBilling',
    'isDefaultShipping',
    'isDefaultBilling',
];

/**
 * Strips `CustomerAddress`-only boolean flags (`isShipping`, `isBilling`,
 * `isDefaultShipping`, `isDefaultBilling`) from an address-like object so it can be
 * sent to the API. Every other field — including `id`, `type`, `country` and
 * `shouldSaveAddress` — is preserved, so this is a behaviour-safe replacement for
 * callers that previously forwarded a selected `CustomerAddress` straight to an
 * update call.
 */
export default function mapToAddressRequestBody<T extends Partial<Address>>(address: T): T {
    return omit(address, CUSTOMER_ADDRESS_METADATA_FIELDS) as T;
}
