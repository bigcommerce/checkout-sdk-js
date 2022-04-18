import { cond, constant, stubTrue } from 'lodash';

import { Registry } from '../../../common/registry';
import { PPSDKPaymentMethod } from '../../ppsdk-payment-method';

import { isCard, isNone } from './initialization-strategies';
import { SubStrategy } from './ppsdk-sub-strategy';
import { SubStrategyType } from './ppsdk-sub-strategy-type';

const getToken = cond([
    [isCard, constant(SubStrategyType.CARD)],
    [isNone, constant(SubStrategyType.NONE)],
    [stubTrue, constant(SubStrategyType.UNSUPPORTED)],
]);

export class SubStrategyRegistry extends Registry<SubStrategy | undefined, SubStrategyType> {
    getByMethod(paymentMethod: PPSDKPaymentMethod): SubStrategy | undefined {
        const token = getToken(paymentMethod.initializationStrategy);

        return this.get(token);
    }
}
