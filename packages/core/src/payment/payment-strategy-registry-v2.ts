import {
    PaymentStrategy,
    PaymentStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

type PaymentStrategyRegistry = ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId>;

export default PaymentStrategyRegistry;
