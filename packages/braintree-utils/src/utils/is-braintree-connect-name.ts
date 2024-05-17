import { BraintreeConnectName, BraintreeFastlaneName } from '../braintree';

export default function isBraintreeConnectName(
    braintreeConnectName: BraintreeConnectName | BraintreeFastlaneName | undefined,
): braintreeConnectName is BraintreeConnectName {
    if (!braintreeConnectName) {
        return false;
    }

    return (
        braintreeConnectName.hasOwnProperty('given_name') &&
        braintreeConnectName.hasOwnProperty('surname')
    );
}
