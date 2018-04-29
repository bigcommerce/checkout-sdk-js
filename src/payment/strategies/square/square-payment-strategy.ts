/// <reference path="./square-form.d.ts" />
import { CheckoutSelectors, CheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    StandardError,
    TimeoutError,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { TokenizedCreditCard } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import SquareScriptLoader from './square-script-loader';

export default class SquarePaymentStrategy extends PaymentStrategy {
    private _paymentForm?: Square.PaymentForm;
    private _deferredRequestNonce?: DeferredPromise;

    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _scriptLoader: SquareScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<CheckoutSelectors> {
        return this._scriptLoader.load()
            .then(createSquareForm =>
                new Promise((resolve, reject) => {
                    this._paymentForm = createSquareForm(
                        this._getFormOptions(options, { resolve, reject })
                    );

                    this._paymentForm.build();
                }))
            .then(() => super.initialize(options));
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<CheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment || !payment.name) {
            throw new MissingDataError('Unable to submit payment because "payload.payment.name" argument is not provided.');
        }

        const paymentName = payment.name;

        return new Promise<TokenizedCreditCard>((resolve, reject) => {
            if (!this._paymentForm) {
                throw new NotInitializedError('Unable to submit payment because the choosen payment method has not been initialized.');
            }

            if (this._deferredRequestNonce) {
                this._deferredRequestNonce.reject(new TimeoutError());
            }

            this._deferredRequestNonce = { resolve, reject };
            this._paymentForm.requestCardNonce();
        })
        .then(paymentData => {
            const paymentPayload = {
                name: paymentName,
                paymentData,
            };

            return this._store.dispatch(this._orderActionCreator.submitOrder(order, true, options))
                .then(() =>
                    this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload))
                );
        });
    }

    private _getFormOptions(options: PaymentInitializeOptions, deferred: DeferredPromise): Square.FormOptions {
        const { square: squareOptions, methodId } = options;
        const { checkout } = this._store.getState();
        const paymentMethod = checkout.getPaymentMethod(methodId);

        if (!squareOptions || !paymentMethod) {
            throw new InvalidArgumentError('Unable to proceed because "options.square" argument is not provided.');
        }

        return {
            ...squareOptions,
            ...paymentMethod.initializationData,
            callbacks: {
                paymentFormLoaded: () => {
                    deferred.resolve();

                    const { checkout } = this._store.getState();
                    const billingAddress = checkout.getBillingAddress();

                    if (!this._paymentForm) {
                        throw new NotInitializedError();
                    }

                    if (billingAddress && billingAddress.postCode) {
                        this._paymentForm.setPostalCode(billingAddress.postCode);
                    }
                },
                unsupportedBrowserDetected: () => {
                    deferred.reject(new UnsupportedBrowserError());
                },
                cardNonceResponseReceived: (errors, nonce) => {
                    this._cardNonceResponseReceived(errors, nonce);
                },
            },
        };
    }

    private _cardNonceResponseReceived(errors: any, nonce: string): void {
        if (!this._deferredRequestNonce) {
            throw new StandardError();
        }

        if (errors) {
            this._deferredRequestNonce.reject(errors);
        } else {
            this._deferredRequestNonce.resolve({ nonce });
        }
    }
}

export interface DeferredPromise {
    resolve(resolution?: TokenizedCreditCard): void;
    reject(reason?: any): void;
}

export interface SquarePaymentInitializeOptions {
    cardNumber: Square.FormElement;
    cvv: Square.FormElement;
    expirationDate: Square.FormElement;
    postalCode: Square.FormElement;
    inputClass?: string;
    inputStyles?: Array<{ [key: string]: string }>;
}
