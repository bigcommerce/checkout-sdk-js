import { isEqual } from 'lodash';

import { PPSDKPaymentMethod } from '../../../ppsdk-payment-method';

interface None {
    type: 'NONE';
}

export const isNone = (strategy: PPSDKPaymentMethod['initializationStrategy']): strategy is None =>
    isEqual(strategy, { type: 'NONE' });
