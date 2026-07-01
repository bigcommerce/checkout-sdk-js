import { omit } from 'lodash';

import { CustomerAddress } from '../customer';

import Address, { AddressRequestBody } from './address';

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
export default function mapToAddressRequestBody(address: Partial<Address>): AddressRequestBody {
    return omit(address, CUSTOMER_ADDRESS_METADATA_FIELDS) as AddressRequestBody;
}
