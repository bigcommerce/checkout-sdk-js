import { BraintreeConnectWindow } from '../braintree';

export default function isBraintreeConnectWindow(window: Window): window is BraintreeConnectWindow {
    return Boolean(window.hasOwnProperty('braintreeConnect'));
}
