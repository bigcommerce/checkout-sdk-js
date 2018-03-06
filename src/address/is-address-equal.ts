import { isEqual } from 'lodash';
import { omitPrivate } from '../common/utility';
import Address from './address';

export default function isAddressEqual(addressA: Address, addressB: Address): boolean {
    return isEqual(normalize(addressA), normalize(addressB));
}

function normalize(address: Address): Partial<Address> {
    const ignoredKeys = ['id', 'provinceCode'];

    return (Object.keys(omitPrivate(address) || {}) as Array<keyof Address>)
        .reduce(
            (result, key) => ignoredKeys.indexOf(key) === -1 && address[key] ?
                { ...result, [key]: address[key] } :
                result,
            {}
        );
}
