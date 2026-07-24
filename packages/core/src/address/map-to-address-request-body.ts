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

    // The API currently defaults shouldSaveAddress to true. We decided to handle this on the FE
    // by consistently sending false as the default on 24 July 2026.
    const requestBodyWithSaveFlag = {
        ...requestBody,
        shouldSaveAddress: requestBody.shouldSaveAddress ?? false,
    };

    if (!b2b) {
        return requestBodyWithSaveFlag;
    }

    return {
        ...requestBodyWithSaveFlag,
        extraFields: requestBodyWithSaveFlag.extraFields ?? b2b.extraFields,
    };
}
