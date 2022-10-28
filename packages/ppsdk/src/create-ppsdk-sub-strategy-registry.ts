import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';

import { HostedFormFactory } from 'packages/core/src/hosted-form';

import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';
import { SubStrategyType } from './ppsdk-sub-strategy-type';
import { StepHandler } from './step-handler';
import { CardSubStrategy, NoneSubStrategy } from './sub-strategies';

export const createSubStrategyRegistry = (
    paymentIntegrationService: PaymentIntegrationService,
    requestSender: RequestSender,
    stepHandler: StepHandler,
    hostedFormFactory: HostedFormFactory
) => {
    const registry = new SubStrategyRegistry();

    registry.register(
        SubStrategyType.CARD,
        () => new CardSubStrategy(paymentIntegrationService, hostedFormFactory, stepHandler)
    );

    registry.register(
        SubStrategyType.NONE,
        () => new NoneSubStrategy(requestSender, stepHandler)
    );

    registry.register(
        SubStrategyType.UNSUPPORTED,
        () => undefined
    );

    return registry;
};
