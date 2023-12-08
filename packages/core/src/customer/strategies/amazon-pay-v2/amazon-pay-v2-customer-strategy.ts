import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, NotImplementedError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import {
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
} from '../../../payment/strategies/amazon-pay-v2';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class AmazonPayV2CustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, amazonpay } = options;

        if (!methodId || !amazonpay?.container) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" or "containerId" argument is not provided.',
            );
        }

        if (amazonpay.onClick && typeof amazonpay.onClick !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.amazonpay.onClick" argument is not a function.',
            );
        }

        let state = this._store.getState();
        let paymentMethod: PaymentMethod<any>;

        try {
            paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        } catch (_e) {
            state = await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(methodId),
            );
            paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        }

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);

        this._amazonPayV2PaymentProcessor.renderAmazonPayButton({
            checkoutState: this._store.getState(),
            containerId: amazonpay.container,
            methodId,
            placement: AmazonPayV2Placement.Checkout,
            ...(amazonpay.onClick && { onClick: amazonpay.onClick }),
        });

        return this._store.getState();
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        await this._amazonPayV2PaymentProcessor.deinitialize();

        return this._store.getState();
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Amazon, the shopper must click on "Amazon Pay" button.',
        );
    }

    async signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        await this._amazonPayV2PaymentProcessor.signout();

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options),
        );
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }
}
