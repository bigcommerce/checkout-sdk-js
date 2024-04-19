import {
    CustomerStrategy,
    CustomerStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

type CustomerStrategyRegistry = ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId>;

export default CustomerStrategyRegistry;
