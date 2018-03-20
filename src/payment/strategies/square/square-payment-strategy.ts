/// <reference path="./square-form.d.ts" />

import { ReadableDataStore } from '@bigcommerce/data-store';
import { CheckoutSelectors } from '../../../checkout';
import { TimeoutError, UnsupportedBrowserError } from '../../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../../order';
import { PaymentMethodUninitializedError, PaymentMethodMissingDataError } from '../../errors';
import SquareScriptLoader from './square-script-loader';
import PaymentMethod from '../../payment-method';
import PaymentStrategy from '../payment-strategy';

export default class SquarePaymentStrategy extends PaymentStrategy {
    private _paymentForm?: Square.PaymentForm;
    private _deferredRequestNonce?: DeferredPromise;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        placeOrderService: PlaceOrderService,
        private _scriptLoader: SquareScriptLoader
    ) {
        super(store, placeOrderService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        return this._scriptLoader.load()
            .then((createSquareForm) =>
                new Promise((resolve, reject) => {
                    this._paymentForm = createSquareForm(
                        this._getFormOptions(options, { resolve, reject })
                    );
                    this._paymentForm.build();
                }))
            .then(() => super.initialize(options));
    }

    execute(payload: OrderRequestBody, options?: any): Promise<CheckoutSelectors> {
        return new Promise((resolve, reject) => {
            if (!this._paymentForm) {
                throw new PaymentMethodUninitializedError('Square');
            }

            if (this._deferredRequestNonce) {
                this._deferredRequestNonce.reject(new TimeoutError());
            };

            this._deferredRequestNonce = { resolve, reject };
            this._paymentForm.requestCardNonce();
        })
        .then(paymentData => this._placeOrderService.submitOrder(payload, paymentData));
    }

    private _getFormOptions(options: InitializeOptions, deferred: DeferredPromise): Square.FormOptions {
        const { paymentMethod, widgetConfig } = options;

        if (!widgetConfig) {
            throw new PaymentMethodMissingDataError('widgetConfig');
        }
        
        return {
            ...widgetConfig,
            ...paymentMethod.initializationData,
            callbacks: {
                paymentFormLoaded: () => {
                    deferred.resolve();

                    const state = this._store.getState();

                    const billingAddress = state.checkout.getBillingAddress();

                    if (billingAddress && billingAddress.postCode) {
                        this._paymentForm!.setPostalCode(billingAddress.postCode);
                    }
                },
                unsupportedBrowserDetected: () => {
                    deferred.reject(new UnsupportedBrowserError());
                },
                cardNonceResponseReceived: (errors, nonce) => {
                    this._cardNonceResponseReceived(errors, nonce);
                },
            }
        }
    }

    private _cardNonceResponseReceived(errors: any, nonce: string): void {
        if (errors) {
            this._deferredRequestNonce!.reject(errors);
        } else {
            this._deferredRequestNonce!.resolve({ nonce });
        }
    }
}

export interface DeferredPromise {
    resolve: (resolution?: any) => void;
    reject: (reason?: any) => void;
}

export interface InitializeOptions {
    paymentMethod: PaymentMethod;
    widgetConfig?: Square.FormOptions;
}
