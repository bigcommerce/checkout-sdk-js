import { RequestSender } from '@bigcommerce/request-sender';

import { CheckoutStore } from '../../../checkout';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator } from '../../../order';

import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';
import { SubStrategyType } from './ppsdk-sub-strategy-type';
import { StepHandler } from './step-handler';
import { CardSubStrategy, NoneSubStrategy } from './sub-strategies';

export const createSubStrategyRegistry = (
    store: CheckoutStore,
    orderActionCreator: OrderActionCreator,
    requestSender: RequestSender,
    stepHandler: StepHandler,
    hostedFormFactory: HostedFormFactory,
) => {
    const registry = new SubStrategyRegistry();

    registry.register(
        SubStrategyType.CARD,
        () => new CardSubStrategy(store, orderActionCreator, hostedFormFactory, stepHandler),
    );

    registry.register(SubStrategyType.NONE, () => new NoneSubStrategy(requestSender, stepHandler));

    registry.register(SubStrategyType.UNSUPPORTED, () => undefined);

    return registry;
};
