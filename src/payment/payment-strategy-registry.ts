import { ReadableDataStore } from '@bigcommerce/data-store';
import { some } from 'lodash';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { Registry } from '../common/registry';
import { RegistryOptions } from '../common/registry/registry';

import PaymentMethod from './payment-method';
import * as paymentMethodTypes from './payment-method-types';
import PaymentStrategy from './strategies/payment-strategy';

export default class PaymentStrategyRegistry extends Registry<PaymentStrategy> {
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
        const cacheToken = paymentMethod.gateway || paymentMethod.id;

        return this.get(token, cacheToken);
    }

    private _getToken(paymentMethod: PaymentMethod): string {
        const methodId = paymentMethod.gateway || paymentMethod.id;

        if (this._hasFactory(methodId)) {
            return methodId;
        }

        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return 'offline';
        }

        if (this._isLegacyMethod(paymentMethod)) {
            return 'legacy';
        }

        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return 'offsite';
        }

        return 'creditcard';
    }

    private _isLegacyMethod(paymentMethod: PaymentMethod): boolean {
        const config = this._store.getState().config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const { clientSidePaymentProviders } = config.paymentSettings;

        if (!clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
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
