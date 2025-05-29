import {
    CheckoutButtonStrategy,
    CheckoutButtonStrategyResolveId,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ResolveIdRegistry } from '../common/registry';

type WalletButtonRegistry = ResolveIdRegistry<
    CheckoutButtonStrategy,
    CheckoutButtonStrategyResolveId
>;

export default WalletButtonRegistry;
