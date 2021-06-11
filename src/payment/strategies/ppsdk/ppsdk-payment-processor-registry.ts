import { cond, constant, stubTrue } from 'lodash';

import { Registry } from '../../../common/registry';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

import { isNone } from './initialization-strategies';
import { PaymentProcessor } from './ppsdk-payment-processor';
import { PaymentProcessorType } from './ppsdk-payment-processor-type';

const getToken = cond([
    [isNone, constant(PaymentProcessorType.NONE)],
    [stubTrue, constant(PaymentProcessorType.UNSUPPORTED)],
]);

export class PaymentProcessorRegistry extends Registry<PaymentProcessor | undefined, PaymentProcessorType> {
    constructor() {
        super();
    }

    getByMethod(paymentMethod: PPSDKPaymentMethod): PaymentProcessor | undefined {
        const token = getToken(paymentMethod.initializationStrategy);

        return this.get(token);
    }
}
