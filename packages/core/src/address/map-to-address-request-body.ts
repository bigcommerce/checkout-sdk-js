import { CustomerAddress } from '../customer';

import Address, { AddressRequestBody } from './address';

type AddressWithB2BMetadata = Partial<Address> & Pick<Partial<CustomerAddress>, 'b2b'>;

/**
 * Strips the `CustomerAddress`-only `b2b` metadata object from an address-like
 * object so it can be sent to the API, hoisting its `extraFields` to the top
 * level of the payload where the API accepts them. Every other field —
 * including `id`, `type`, `country` and `shouldSaveAddress` — is preserved,
 * so this is a behaviour-safe replacement for callers that previously
 * forwarded a selected `CustomerAddress` straight to an update call.
 */
export default function mapToAddressRequestBody(
    address: AddressRequestBody & AddressWithB2BMetadata,
): AddressRequestBody;

export default function mapToAddressRequestBody(
    address: AddressWithB2BMetadata,
): Partial<AddressRequestBody>;

export default function mapToAddressRequestBody(
    address: AddressWithB2BMetadata,
): Partial<AddressRequestBody> {
    const { b2b, ...requestBody } = address;

    if (!b2b) {
        return requestBody;
    }

    return {
        ...requestBody,
        extraFields: requestBody.extraFields ?? b2b.extraFields,
    };
}
