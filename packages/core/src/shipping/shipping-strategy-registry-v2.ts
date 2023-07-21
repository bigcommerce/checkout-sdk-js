import {
    ShippingStrategy,
    ShippingStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

type ShippingStrategyRegistry = ResolveIdRegistry<ShippingStrategy, ShippingStrategyResolveId>;

export default ShippingStrategyRegistry;
