import { BraintreeFastlaneWindow } from '../types';

export default function isBraintreeFastlaneWindow(
    window: Window,
): window is BraintreeFastlaneWindow {
    return Boolean(window.hasOwnProperty('braintreeFastlane'));
}
