/// <reference path="../../remote-checkout/methods/afterpay/afterpay-sdk.d.ts" />

import { omit } from 'lodash';
import PaymentStrategy from './payment-strategy';
import PaymentMethod from '../payment-method';
import { RemoteCheckoutService } from '../../remote-checkout';
import { ReadableDataStore } from '../../../data-store';
import { CheckoutSelectors } from '../../checkout';
import { OrderRequestBody, PlaceOrderService } from '../../order';
import { PaymentMethodUninitializedError, PaymentMethodMissingDataError } from '../errors';
import AfterpayScriptLoader from '../../remote-checkout/methods/afterpay';

/** Class that provides utility methods for checking out using Afterpay SDK */
export default class AfterpayPaymentStrategy extends PaymentStrategy {
    private _afterpaySdk?: Afterpay.Sdk;

    constructor(
        paymentMethod: PaymentMethod,
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: PlaceOrderService,
        private _remoteCheckoutService: RemoteCheckoutService,
        private _afterpayScriptLoader: AfterpayScriptLoader
    ) {
        super(paymentMethod, store, placeOrderService);
    }

    /**
     * @inheritDoc
     */
    initialize(options: any): Promise<CheckoutSelectors> {
        return this._afterpayScriptLoader.load(this._paymentMethod)
            .then((afterpaySdk) => {
                this._afterpaySdk = afterpaySdk;
                return super.initialize(options);
            });
    }

    /**
     * @inheritDoc
     */
    deinitialize(options: any): Promise<CheckoutSelectors> {
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }

        return super.deinitialize(options);
    }

    /**
     * @inheritDoc
     */
    execute(payload: OrderRequestBody, options: any): Promise<any> {
        const paymentId = payload.payment.gateway;
        const useStoreCredit = !!payload.useStoreCredit;

        if (!paymentId) {
            throw new PaymentMethodMissingDataError('gateway');
        }

        return this._remoteCheckoutService.initializePayment(paymentId, { useStoreCredit })
            .then(() => this._placeOrderService.loadPaymentMethod(paymentId))
            .then((resp: any) => this._displayModal(resp.checkout.getPaymentMethod(paymentId).clientToken))
            // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
            .then(() => this._resolveBeforeUnload());
    }

    /**
     * @inheritDoc
     */
    finalize(options: any): Promise<CheckoutSelectors> {
        const payload = {
            payment: {
                name: this._paymentMethod.id,
                paymentData: { nonce: options.nonce },
            },
        };

        return this._placeOrderService.submitOrder(omit(payload, 'payment'), true, options)
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, false, omit(options, 'nonce'))
            );
    }

    /**
     * Displays an Afterpay modal box.
     * @param token the token returned by afterpay API
     */
    private _displayModal(token: string): void {
        if (!this._afterpaySdk || !token) {
            throw new PaymentMethodUninitializedError(this._paymentMethod.gateway!);
        }

        this._afterpaySdk.init();
        this._afterpaySdk.display({ token });
    }

    /**
     * Returns a promise that resolves when the window unloads.
     */
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
