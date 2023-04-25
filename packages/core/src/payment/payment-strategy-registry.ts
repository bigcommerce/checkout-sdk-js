import { ReadableDataStore } from '@bigcommerce/data-store';

import { InternalCheckoutSelectors } from '../checkout';
import { InvalidArgumentError } from '../common/error/errors';
import { Registry, RegistryOptions } from '../common/registry';

import PaymentMethod from './payment-method';
import * as paymentMethodTypes from './payment-method-types';
import PaymentStrategyType from './payment-strategy-type';
import { isPPSDKPaymentMethod } from './ppsdk-payment-method';
import { PaymentStrategy } from './strategies';

const checkoutcomStrategies: {
    [key: string]: PaymentStrategyType;
} = {
    card: PaymentStrategyType.CHECKOUTCOM,
    credit_card: PaymentStrategyType.CHECKOUTCOM,
    sepa: PaymentStrategyType.CHECKOUTCOM_SEPA,
    ideal: PaymentStrategyType.CHECKOUTCOM_IDEAL,
    fawry: PaymentStrategyType.CHECKOUTCOM_FAWRY,
};

export default class PaymentStrategyRegistry extends Registry<
    PaymentStrategy,
    PaymentStrategyType
> {
    constructor(
        private _store: ReadableDataStore<InternalCheckoutSelectors>,
        options?: PaymentStrategyRegistryOptions,
    ) {
        super(options);
    }

    getByMethod(paymentMethod?: PaymentMethod): PaymentStrategy {
        if (!paymentMethod) {
            return this.get();
        }

        const token = this._getToken(paymentMethod);

        const cacheToken = [paymentMethod.gateway, paymentMethod.id]
            .filter((value) => value !== undefined && value !== null)
            .join('-');

        return this.get(token, cacheToken);
    }

    private _getToken(paymentMethod: PaymentMethod): PaymentStrategyType {
        const features = this._store.getState().config.getStoreConfig()?.checkoutSettings.features;

        if (
            paymentMethod.id === 'squarev2' &&
            features &&
            features['PROJECT-4113.squarev2_web_payments_sdk']
        ) {
            throw new Error('SquareV2 requires using registryV2');
        }

        if (isPPSDKPaymentMethod(paymentMethod)) {
            return PaymentStrategyType.PPSDK;
        }

        if (paymentMethod.gateway === 'klarna') {
            return PaymentStrategyType.KLARNAV2;
        }

        if (paymentMethod.gateway === PaymentStrategyType.CHECKOUTCOM) {
            return paymentMethod.id in checkoutcomStrategies
                ? checkoutcomStrategies[paymentMethod.id]
                : PaymentStrategyType.CHECKOUTCOM_APM;
        }

        const methodId = paymentMethod.gateway || paymentMethod.id;

        if (this._hasFactoryForMethod(methodId)) {
            return methodId;
        }

        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return PaymentStrategyType.OFFLINE;
        }

        throw new InvalidArgumentError(`'${methodId}' is not registered.`);
    }

    private _hasFactoryForMethod(methodId: string): methodId is PaymentStrategyType {
        return this._hasFactory(methodId);
    }
}

export interface PaymentStrategyRegistryOptions extends RegistryOptions {
    clientSidePaymentProviders?: string[];
}
