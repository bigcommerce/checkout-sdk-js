import { RequestSender, Response } from '@bigcommerce/request-sender';
import { omit } from 'lodash';
import { noop } from 'rxjs';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, TimeoutError, UnsupportedBrowserError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import SquarePaymentForm, { CardData, Contact, DigitalWalletType, NonceGenerationError, SquareFormElement, SquareFormOptions, SquarePaymentRequest } from './square-form';
import SquarePaymentInitializeOptions from './square-payment-initialize-options';
import SquareScriptLoader from './square-script-loader';

export default class SquarePaymentStrategy implements PaymentStrategy {
    private _deferredRequestNonce?: DeferredPromise;
    private _paymentForm?: SquarePaymentForm;
    private _paymentMethod?: PaymentMethod;
    private _squareOptions?: SquarePaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _requestSender: RequestSender,
        private _scriptLoader: SquareScriptLoader
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        this._syncPaymentMethod(methodId);

        return this._scriptLoader.load()
            .then(createSquareForm =>
                new Promise((resolve, reject) => {
                    this._paymentForm = createSquareForm(
                        this._getFormOptions(options, { resolve, reject })
                    );
                    this._paymentForm.build();
                }))
            .then(() => this._store.getState());
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;

        if (!payment || !payment.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment.methodId" argument is not provided.');
        }

        this._syncPaymentMethod(payment.methodId);

        return this._getNonceInstrument(payment.methodId)
            .then(paymentData =>
                this._store.dispatch(this._orderActionCreator.submitOrder(omit(orderRequest, 'payment'), options))
                .then(() =>
                    this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
                ));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _syncPaymentMethod(methodId: string): void {
        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
    }

    private _getCountryCode(countryName: string) {
        switch (countryName.toUpperCase()) {
            case 'NEW ZELAND':
                return 'NZ';
            case 'AUSTRALIA':
                return 'AU';
            default:
                return 'US';
        }
    }

    private _getNonceInstrument(methodId: string): Promise<NonceInstrument> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (paymentMethod) {
            const { initializationData } = paymentMethod;
            if (initializationData && initializationData.paymentData.nonce) {
                return Promise.resolve({ nonce: paymentMethod.initializationData.paymentData.nonce });
            }
        }

        return new Promise<NonceInstrument>((resolve, reject) => {
            if (!this._paymentForm) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            if (this._deferredRequestNonce) {
                this._deferredRequestNonce.reject(new TimeoutError());
            }

            this._deferredRequestNonce = { resolve, reject };
            this._paymentForm.requestCardNonce();
        });
    }

    private _getFormOptions(options: PaymentInitializeOptions, deferred: DeferredPromise): SquareFormOptions {
        const { square: squareOptions } = options;

        if (!squareOptions || !this._paymentMethod) {
            throw new InvalidArgumentError('Unable to proceed because "options.square" argument is not provided.');
        }

        this._squareOptions = squareOptions;

        return {
            ...this._squareOptions,
            ...this._paymentMethod.initializationData,
            callbacks: {
                cardNonceResponseReceived: (errors, nonce, cardData, billingContact, shippingContact) => {
                    if (cardData && cardData.digital_wallet_type !== DigitalWalletType.none) {
                        this._handleWalletNonceResponse(errors, nonce, cardData, billingContact, shippingContact);
                    } else {
                        this._handleCardNonceResponse(errors, nonce);
                    }
                },
                createPaymentRequest: () => this._paymentRequestPayload(),
                methodsSupported: methods => {
                    const { masterpass } = squareOptions;

                    if (masterpass) {
                        this._showPaymentMethods(methods, masterpass);
                    }
                },
                paymentFormLoaded: () => {
                    deferred.resolve();
                    this._setPostalCode();
                },
                unsupportedBrowserDetected: () => deferred.reject(new UnsupportedBrowserError()),
            },
        };
    }

    private _handleWalletNonceResponse(
        errors?: NonceGenerationError[],
        nonce?: string,
        cardData?: CardData,
        billingContact?: Contact,
        shippingContact?: Contact
    ): void {
        const onError = this._squareOptions && this._squareOptions.onError || noop;
        const onPaymentSelect = this._squareOptions && this._squareOptions.onPaymentSelect || noop;

        if (errors) {
            onError(errors);
        } else if (nonce && this._paymentMethod) {
            this._paymentInstrumentSelected(
                this._paymentMethod.id,
                nonce,
                cardData,
                billingContact,
                shippingContact
            )
                .then(onPaymentSelect)
                .catch(onError);
        }
    }

    private _handleCardNonceResponse(errors?: NonceGenerationError[], nonce?: string): void {
        if (!this._deferredRequestNonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (nonce && !errors) {
            this._deferredRequestNonce.resolve({ nonce });

            return;
        }

        const onError = this._squareOptions && this._squareOptions.onError || noop;

        onError(errors);

        this._deferredRequestNonce.reject(errors);
    }

    private _paymentInstrumentSelected(
        methodId: string,
        nonce?: string,
        cardData?: CardData,
        billingContact?: Contact,
        shippingContact?: Contact): Promise<InternalCheckoutSelectors> {

        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            return this._setExternalCheckoutData(nonce, cardData, billingContact, shippingContact)
            .then(() =>
                Promise.all([
                this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
            ]));
        }, { methodId }), { queueId: 'widgetInteraction' });
    }

    private _paymentRequestPayload(): SquarePaymentRequest {
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
            countryCode: this._getCountryCode(storeConfig.storeProfile.storeCountry),
            total: {
                label: storeConfig.storeProfile.storeName,
                amount: String(checkout.subtotal),
                pending: false,
            },
        };
    }

    private _setExternalCheckoutData(nonce?: string, cardData?: CardData, billingContact?: Contact, shippingContact?: Contact): Promise<Response<any>> {
        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                nonce,
                provider: 'squarev2',
                action: 'set_external_checkout',
                cardData: JSON.stringify(cardData),
                billingContact: JSON.stringify(billingContact),
                shippingContact: JSON.stringify(shippingContact),
            },
        });
    }

    private _setPostalCode(): void {
        const state = this._store.getState();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!this._paymentForm) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (billingAddress && billingAddress.postalCode) {
            this._paymentForm.setPostalCode(billingAddress.postalCode);
        }
    }

    private _showPaymentMethods(methods: { [key: string]: boolean }, element: SquareFormElement): void {
        const masterpassBtn = document.getElementById(element.elementId);

        if (masterpassBtn && methods.masterpass) {
            masterpassBtn.style.display = 'inline-block';
        }
    }
}

export interface DeferredPromise {
    resolve(resolution?: NonceInstrument): void;
    reject(reason?: any): void;
}
