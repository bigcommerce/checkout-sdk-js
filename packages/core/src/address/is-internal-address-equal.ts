import { isEqual } from 'lodash';

import { omitPrivate } from '../common/utility';

import InternalAddress from './internal-address';

export default function isInternalAddressEqual(
    addressA: Partial<InternalAddress>,
    addressB: Partial<InternalAddress>,
): boolean {
    return isEqual(normalize(addressA), normalize(addressB));
}

function normalize(address: Partial<InternalAddress>): Partial<InternalAddress> {
    const ignoredKeys = ['id', 'provinceCode'];

    return (Object.keys(omitPrivate(address) || {}) as Array<keyof InternalAddress>).reduce(
        (result, key) =>
            !ignoredKeys.includes(key) && address[key]
                ? { ...result, [key]: address[key] }
                : result,
        {},
    );
}
