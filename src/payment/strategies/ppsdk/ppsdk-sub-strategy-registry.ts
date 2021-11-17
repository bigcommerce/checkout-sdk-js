import { cond, constant, stubTrue } from 'lodash';

import { Registry } from '../../../common/registry';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

import { isNone } from './initialization-strategies';
import { PaymentProcessor } from './ppsdk-sub-strategy';
import { PaymentProcessorType } from './ppsdk-sub-strategy-type';

const getToken = cond([
    [isNone, constant(PaymentProcessorType.NONE)],
    [stubTrue, constant(PaymentProcessorType.UNSUPPORTED)],
]);

export class PaymentProcessorRegistry extends Registry<PaymentProcessor | undefined, PaymentProcessorType> {
    getByMethod(paymentMethod: PPSDKPaymentMethod): PaymentProcessor | undefined {
        const token = getToken(paymentMethod.initializationStrategy);

        return this.get(token);
    }
}
