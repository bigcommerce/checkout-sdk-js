import { CustomerStrategy, CustomerStrategyResolveId } from '@bigcommerce/checkout-sdk/payment-integration';
import { ResolveIdRegistry } from '../common/registry';

type CustomerStrategyRegistry = ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId>;

export default CustomerStrategyRegistry;
