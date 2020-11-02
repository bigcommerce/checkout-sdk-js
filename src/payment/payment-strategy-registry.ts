import { ReadableDataStore } from '@bigcommerce/data-store';
import { some } from 'lodash';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { Registry, RegistryOptions } from '../common/registry';

import PaymentMethod from './payment-method';
import * as paymentMethodTypes from './payment-method-types';
import PaymentStrategyType from './payment-strategy-type';
import { PaymentStrategy } from './strategies';

export default class PaymentStrategyRegistry extends Registry<PaymentStrategy, PaymentStrategyType> {
    constructor(
        private _store: ReadableDataStore<InternalCheckoutSelectors>,
        options?: PaymentStrategyRegistryOptions
    ) {
        super(options);
    }

    getByMethod(paymentMethod?: PaymentMethod): PaymentStrategy {
        if (!paymentMethod) {
            return this.get();
        }

        const token = this._getToken(paymentMethod);

        const cacheToken = [paymentMethod.gateway, paymentMethod.id]
            .filter(value => value !== undefined && value !== null)
            .join('-');

        return this.get(token, cacheToken);
    }

    private _getToken(paymentMethod: PaymentMethod): PaymentStrategyType {
        if (paymentMethod.gateway === 'klarna') {
            return PaymentStrategyType.KLARNAV2;
        }

        if (paymentMethod.id === PaymentStrategyType.PAYPAL_COMMERCE_CREDIT ||
            paymentMethod.gateway === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS) {
            return PaymentStrategyType.PAYPAL_COMMERCE;
        }

        const methodId = paymentMethod.gateway || paymentMethod.id;

        if (this._hasFactoryForMethod(methodId)) {
            return methodId;
        }

        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return PaymentStrategyType.OFFLINE;
        }

        if (this._isLegacyMethod(paymentMethod)) {
            return PaymentStrategyType.LEGACY;
        }

        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return PaymentStrategyType.OFFSITE;
        }

        return PaymentStrategyType.CREDIT_CARD;
    }

    private _hasFactoryForMethod(
        methodId: string
    ): methodId is PaymentStrategyType {
        return this._hasFactory(methodId);
    }

    private _isLegacyMethod(paymentMethod: PaymentMethod): boolean {
        const config = this._store.getState().config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const { clientSidePaymentProviders } = config.paymentSettings;

        if (!clientSidePaymentProviders || paymentMethod.gateway === 'adyen' || paymentMethod.gateway === 'barclaycard') {
            return false;
        }

        return !some(clientSidePaymentProviders, id =>
            paymentMethod.id === id || paymentMethod.gateway === id
        );
    }
}

export interface PaymentStrategyRegistryOptions extends RegistryOptions {
    clientSidePaymentProviders?: string[];
}
