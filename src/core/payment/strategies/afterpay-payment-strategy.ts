/// <reference path="../../remote-checkout/methods/afterpay/afterpay-sdk.d.ts" />

import { omit } from 'lodash';
import { ReadableDataStore } from '@bigcommerce/data-store';
import { CheckoutSelectors } from '../../checkout';
import { RemoteCheckoutService } from '../../remote-checkout';
import { NotInitializedError } from '../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../order';
import { PaymentMethodUninitializedError, PaymentMethodMissingDataError } from '../errors';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';
import PaymentMethod from '../payment-method';
import PaymentStrategy, { InitializeOptions } from './payment-strategy';

export default class AfterpayPaymentStrategy extends PaymentStrategy {
    private _afterpaySdk?: Afterpay.Sdk;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: PlaceOrderService,
        private _remoteCheckoutService: RemoteCheckoutService,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {
        super(store, placeOrderService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._afterpayScriptLoader.load(options.paymentMethod)
            .then((afterpaySdk) => {
                this._afterpaySdk = afterpaySdk;

                return super.initialize(options);
            });
    }

    deinitialize(options: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return super.deinitialize(options);
    }

    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        const paymentId = payload.payment.gateway;
        const useStoreCredit = !!payload.useStoreCredit;
        const customerMessage = payload.customerMessage ? payload.customerMessage : '';

        if (!paymentId) {
            throw new PaymentMethodMissingDataError('gateway');
        }

        return this._remoteCheckoutService.initializePayment(paymentId, { useStoreCredit, customerMessage })
            .then(() => this._placeOrderService.verifyCart())
            .then(() => this._placeOrderService.loadPaymentMethod(paymentId))
            .then((resp: any) => this._displayModal(resp.checkout.getPaymentMethod(paymentId).clientToken))
            // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
            .then(() => this._resolveBeforeUnload())
            .then(() => this._store.getState());
    }

    finalize(options: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const { useStoreCredit, customerMessage } = checkout.getCustomer().remote;
        const order = checkout.getOrder();

        const payload = {
            payment: {
                name: order.payment.id,
                paymentData: { nonce: options.nonce },
            },
        };

        return this._placeOrderService.submitOrder({ useStoreCredit, customerMessage }, true, options)
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, useStoreCredit, omit(options, 'nonce'))
            );
    }

    /**
     * @param token the token returned by afterpay API
     */
    private _displayModal(token: string): void {
        if (!this._afterpaySdk || !token) {
            throw new PaymentMethodUninitializedError('afterpay');
        }

        this._afterpaySdk.init();
        this._afterpaySdk.display({ token });
    }

    private _resolveBeforeUnload(): Promise<void> {
        return new Promise((resolve) => {
            const handleUnload = () => {
                window.removeEventListener('unload', handleUnload);
                resolve();
            };

            window.addEventListener('unload', handleUnload);
        });
    }
}
