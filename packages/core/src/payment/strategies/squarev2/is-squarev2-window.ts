import { PaymentMethodClientUnavailableError } from '../../errors';

import type { Square } from './types';

export interface SquareV2HostWindow extends Window {
    Square: Square;
}

export default function isSquareV2Window(window: Window): window is SquareV2HostWindow {
    return 'Square' in window;
}

export function assertSquareV2Window(window: Window): asserts window is SquareV2HostWindow {
    if (!isSquareV2Window(window)) {
        throw new PaymentMethodClientUnavailableError();
    }
}
