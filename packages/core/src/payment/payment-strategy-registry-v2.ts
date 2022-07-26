import { PaymentStrategyResolveId, PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration';
import { ResolveIdRegistry } from '../common/registry';

type PaymentStrategyRegistry = ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId>;

export default PaymentStrategyRegistry;
