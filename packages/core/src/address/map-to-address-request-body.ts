import { CustomerAddress } from '../customer';

import Address, { AddressRequestBody } from './address';

type AddressWithB2BFields = Partial<Address> &
    Pick<
        Partial<CustomerAddress>,
        'isShipping' | 'isBilling' | 'isDefaultShipping' | 'isDefaultBilling'
    >;

/**
 * Strips the `CustomerAddress`-only B2B fields (`isShipping`, `isBilling`,
 * `isDefaultShipping`, `isDefaultBilling`) from an address-like object so it
 * can be sent to the API. Every other field — including `id`, `type`,
 * `country`, `label`, `extraFields` and `shouldSaveAddress` — is preserved,
 * so this is a behaviour-safe replacement for callers that previously
 * forwarded a selected `CustomerAddress` straight to an update call.
 */
export default function mapToAddressRequestBody(
    address: AddressRequestBody & AddressWithB2BFields,
): AddressRequestBody;

export default function mapToAddressRequestBody(
    address: AddressWithB2BFields,
): Partial<AddressRequestBody>;

export default function mapToAddressRequestBody(
    address: AddressWithB2BFields,
): Partial<AddressRequestBody> {
    const { isShipping, isBilling, isDefaultShipping, isDefaultBilling, ...requestBody } = address;

    // The API currently defaults shouldSaveAddress to true. We decided to handle this on the FE
    // by consistently sending false as the default on 24 July 2026.
    return {
        ...requestBody,
        shouldSaveAddress: requestBody.shouldSaveAddress ?? false,
    };
}
