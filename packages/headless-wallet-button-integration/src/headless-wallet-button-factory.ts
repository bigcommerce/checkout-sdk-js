import { CheckoutButtonStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';

import DefaultHeadlessWalletButtonIntegrationService from './default-headless-wallet-button-integration-service';

type HeadlessWalletButtonStrategyFactory<TStrategy extends CheckoutButtonStrategy> = (
    headlessIntegrationService: DefaultHeadlessWalletButtonIntegrationService,
) => TStrategy;

export default HeadlessWalletButtonStrategyFactory;
