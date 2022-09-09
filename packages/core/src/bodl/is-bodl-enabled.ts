import BodlEventsWindow from './bodl-window';

export function isBodlEnabled(window: Window): window is BodlEventsWindow {
    return 'bodlEvents' in window;
}
