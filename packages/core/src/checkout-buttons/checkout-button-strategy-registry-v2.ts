import { CheckoutButtonStrategy, CheckoutButtonStrategyResolveId } from '@bigcommerce/checkout-sdk/payment-integration';

import { ResolveIdRegistry } from '../common/registry';

type CheckoutButtonRegistry = ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId>;

export default CheckoutButtonRegistry;
