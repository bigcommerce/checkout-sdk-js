import { MollieHostWindow } from './mollie';

export default function isMollieWindow(window: Window): window is MollieHostWindow {
    return 'Mollie' in window;
}
