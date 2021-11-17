import { RequestSender } from '@bigcommerce/request-sender';

import { PaymentProcessorRegistry } from './ppsdk-sub-strategy-registry';
import { PaymentProcessorType } from './ppsdk-sub-strategy-type';
import { StepHandler } from './step-handler';
import { NonePaymentProcessor } from './sub-strategies';

export const createPaymentProcessorRegistry = (requestSender: RequestSender, stepHandler: StepHandler) => {
    const registry = new PaymentProcessorRegistry();

    registry.register(
        PaymentProcessorType.NONE,
        () => new NonePaymentProcessor(requestSender, stepHandler)
    );

    registry.register(
        PaymentProcessorType.UNSUPPORTED,
        () => undefined
    );

    return registry;
};
