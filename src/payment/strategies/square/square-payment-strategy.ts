import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    StandardError,
    TimeoutError,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { toFormUrlEncoded } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentMethod, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../../index';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import SquarePaymentForm, { CardData, Contact, Error, SquareFormElement, SquareFormOptions } from './square-form';
import SquareScriptLoader from './square-script-loader';

export default class SquarePaymentStrategy extends PaymentStrategy {
    private _paymentForm?: SquarePaymentForm;
    private _deferredRequestNonce?: DeferredPromise;

    constructor(
        store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _requestSender: RequestSender,
        private _scriptLoader: SquareScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
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

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment || !payment.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment.methodId" argument is not provided.');
        }

        const paymentName = payment.methodId;

        return new Promise<NonceInstrument>((resolve, reject) => {
            if (!this._paymentForm) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (this._deferredRequestNonce) {
                this._deferredRequestNonce.reject(new TimeoutError());
            }

            this._deferredRequestNonce = { resolve, reject };
            this._paymentForm.requestCardNonce();
        })
        .then(paymentData => {
            const paymentPayload = {
                methodId: paymentName,
                paymentData,
            };

            return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                .then(() =>
                    this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload))
                );
        });
    }

    private _getFormOptions(options: PaymentInitializeOptions, deferred: DeferredPromise): SquareFormOptions {
        const { square: squareOptions, methodId } = options;
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!squareOptions || !paymentMethod) {
            throw new InvalidArgumentError('Unable to proceed because "options.square" argument is not provided.');
        }

        return {
            ...squareOptions,
            ...paymentMethod.initializationData,
            callbacks: {
                paymentFormLoaded: () => {
                    deferred.resolve();
                    const state = this._store.getState();
                    const billingAddress = state.billingAddress.getBillingAddress();

                    if (!this._paymentForm) {
                        throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                    }

                    if (billingAddress && billingAddress.postalCode) {
                        this._paymentForm.setPostalCode(billingAddress.postalCode);
                    }
                },
                unsupportedBrowserDetected: () => {
                    deferred.reject(new UnsupportedBrowserError());
                },
                cardNonceResponseReceived: (errors: Error[], nonce: string, cardData: CardData,
                                            billingContact: Contact, shippingContact: Contact) => {
                    if (cardData.digital_wallet_type !== 'NONE') {
                        this._setExternalCheckoutData(cardData, nonce)
                        .then(() => {
                            this._paymentInstrumentSelected(nonce, cardData)
                            .then(() => {
                                if (squareOptions.onPaymentSelect) {
                                    squareOptions.onPaymentSelect();
                                }
                            });
                        });
                    } else {
                        this._cardNonceResponseReceived(errors, nonce);
                    }
                },
                methodsSupported: () => {},

                /*
                 * callback function: createPaymentRequest
                 * Triggered when: a digital wallet payment button is clicked.
                */
                createPaymentRequest: () => {
                    const state = this._store.getState();
                    const checkout = state.checkout.getCheckout();
                    const storeConfig = state.config.getStoreConfig();

                    if (!checkout) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                    }

                    if (!storeConfig) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                    }

                    return {
                        requestShippingAddress: true,
                        requestBillingInfo: true,
                        currencyCode: storeConfig.currency.code,
                        countryCode: 'US',
                        total: {
                            label: storeConfig.storeProfile.storeName,
                            amount: checkout.subtotal.toString(),
                            pending: false,
                        },
                    };
                },
            },
        };
    }

    private _paymentInstrumentSelected(nonce: string, cardData: CardData) {
        const state = this._store.getState();
        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
                return Promise.all([
                    this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                    this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod('squarev2')),
                ]);
        }, { methodId: 'squarev2' }), { queueId: 'widgetInteraction' });
    }

    private _cardNonceResponseReceived(errors: Error[], nonce: string): void {
        if (!this._deferredRequestNonce) {
            throw new StandardError();
        }

        if (errors) {
            this._deferredRequestNonce.reject(errors);
        } else {
            this._deferredRequestNonce.resolve({ nonce });
        }
    }

    private _setExternalCheckoutData(cardData: CardData, nonce: string): Promise<Response> {
        const url = `checkout.php?provider=squarev2&action=set_external_checkout`;
        const options = {
          headers: {
            Accept: 'text/html',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: toFormUrlEncoded({
              nonce: { nonce },
              cardData: JSON.stringify(cardData),
          }),
        };

        return this._requestSender.post(url, options);
      }
}

export interface DeferredPromise {
    resolve(resolution?: NonceInstrument): void;
    reject(reason?: any): void;
}

/**
 * A set of options that are required to initialize the Square payment method.
 *
 * Once Square payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 */
export interface SquarePaymentInitializeOptions {
    /**
     * The location to insert the credit card number form field.
     */
    cardNumber: SquareFormElement;

    /**
     * The location to insert the CVV form field.
     */
    cvv: SquareFormElement;

    /**
     * The location to insert the expiration date form field.
     */
    expirationDate: SquareFormElement;

    /**
     * The location to insert the postal code form field.
     */
    postalCode: SquareFormElement;

    /**
     * The CSS class to apply to all form fields.
     */
    inputClass?: string;

    /**
     * The set of CSS styles to apply to all form fields.
     */
    inputStyles?: Array<{ [key: string]: string }>;

    // Initialize Masterpass placeholder ID
    masterpass?: SquareFormElement;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
