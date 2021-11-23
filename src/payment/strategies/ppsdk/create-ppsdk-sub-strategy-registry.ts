import { RequestSender } from '@bigcommerce/request-sender';

import { SubStrategyRegistry } from './ppsdk-sub-strategy-registry';
import { SubStrategyType } from './ppsdk-sub-strategy-type';
import { StepHandler } from './step-handler';
import { NoneSubStrategy } from './sub-strategies';

export const createSubStrategyRegistry = (requestSender: RequestSender, stepHandler: StepHandler) => {
    const registry = new SubStrategyRegistry();

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
