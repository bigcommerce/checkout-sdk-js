import { RequestSender } from '@bigcommerce/request-sender';

import { NonePaymentProcessor } from './payment-processors';
import { PaymentProcessorRegistry } from './ppsdk-payment-processor-registry';
import { PaymentProcessorType } from './ppsdk-payment-processor-type';
import { StepHandler } from './step-handler';

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
