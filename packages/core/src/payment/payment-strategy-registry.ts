import { ReadableDataStore } from '@bigcommerce/data-store';

import { InternalCheckoutSelectors } from '../checkout';
import { InvalidArgumentError } from '../common/error/errors';
import { Registry, RegistryOptions } from '../common/registry';

import PaymentMethod from './payment-method';
import * as paymentMethodTypes from './payment-method-types';
import PaymentStrategyType from './payment-strategy-type';
import { isPPSDKPaymentMethod } from './ppsdk-payment-method';
import { PaymentStrategy } from './strategies';

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

        if (features) {
            switch (true) {
                case paymentMethod.id === 'squarev2' &&
                    features['PROJECT-4113.squarev2_web_payments_sdk']:
                case paymentMethod.id === 'googlepayauthorizenet' &&
                    features['INT-7676.authorizenet_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepaybnz' &&
                    features['INT-7676.bnz_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepaycheckoutcom' &&
                    features['INT-7676.checkoutcom_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepaycybersourcev2' &&
                    features['INT-7676.cybersourcev2_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepayorbital' &&
                    features['INT-7676.orbital_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepaystripe' &&
                    features['INT-7676.stripe_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepaystripeupe' &&
                    features['INT-7676.stripeupe_use_new_googlepay_payment_strategy']:
                case paymentMethod.id === 'googlepayworldpayaccess' &&
                    features['INT-7676.worldpayaccess_use_new_googlepay_payment_strategy']:
                    throw new Error(`${paymentMethod.id} requires using registryV2`);
            }
        }

        if (isPPSDKPaymentMethod(paymentMethod)) {
            return PaymentStrategyType.PPSDK;
        }

        if (paymentMethod.gateway === 'klarna') {
            return PaymentStrategyType.KLARNAV2;
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
