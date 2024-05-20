import { BraintreeConnectPhone } from '../';

export default function isBraintreeConnectPhone(
    braintreeConnectPhone: BraintreeConnectPhone | string | undefined,
): braintreeConnectPhone is BraintreeConnectPhone {
    if (!braintreeConnectPhone) {
        return false;
    }

    return (
        braintreeConnectPhone.hasOwnProperty('country_code') &&
        braintreeConnectPhone.hasOwnProperty('national_number')
    );
}
