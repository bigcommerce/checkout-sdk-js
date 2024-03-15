import { BraintreeFastlaneWindow } from '../braintree';

export default function isBraintreeFastlaneWindow(
    window: Window,
): window is BraintreeFastlaneWindow {
    return Boolean(window.hasOwnProperty('braintreeFastlane'));
}
