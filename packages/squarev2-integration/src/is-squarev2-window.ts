import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import type { Square } from './types';

interface SquareV2HostWindow extends Window {
    Square: Square;
}

function isSquareV2Window(window: Window): window is SquareV2HostWindow {
    return 'Square' in window;
}

export default function assertSquareV2Window(window: Window): asserts window is SquareV2HostWindow {
    if (!isSquareV2Window(window)) {
        throw new PaymentMethodClientUnavailableError();
    }
}
