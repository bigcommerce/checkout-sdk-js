import { RequestSender, Response } from '@bigcommerce/request-sender';
import { get, isEmpty, noop, omit } from 'lodash';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    TimeoutError,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { SDK_VERSION_HEADERS } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';
import { NonceInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import SquarePaymentForm, {
    CardData,
    Contact,
    DeferredPromise,
    DigitalWalletType,
    SquareFormOptions,
    SquareIntent,
    SquarePaymentRequest,
    SquareVerificationError,
    SquareVerificationResult,
    VerificationDetails,
} from './square-form';
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
        private _scriptLoader: SquareScriptLoader,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, gatewayId, square: squareOptions } = options;

        if (!squareOptions) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.square" argument is not provided.',
            );
        }

        this._squareOptions = squareOptions;

        this._syncPaymentMethod(methodId);

        /* eslint-disable */
        return new Promise(async (resolve, reject) => {
            const state = this._store.getState();
            const { config: { testMode } } = state.paymentMethods.getPaymentMethodOrThrow(methodId, gatewayId);
            try {
                const createSquareForm = await this._scriptLoader.load(testMode);

                this._paymentForm = createSquareForm(
                    this._getFormOptions({ resolve, reject })
                );

                this._getPaymentForm().build();
            } catch (e: unknown) {
                reject(new PaymentMethodClientUnavailableError());
            }
        }).then(() => this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;
        if (!payment || !payment.methodId) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment.methodId" argument is not provided.');
        }

        this._syncPaymentMethod(payment.methodId);

        const paymentData = await this._getNonceInstrument(payment.methodId);

        await this._store.dispatch(this._orderActionCreator.submitOrder(omit(orderRequest, 'payment'), options));
        await this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData}));

        return this._store.getState();
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _syncPaymentMethod(methodId: string): void {
        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!this._paymentMethod.initializationData) {
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

    private _getNonceInstrument(methodId: string): Promise<NonceInstrument | undefined> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (paymentMethod) {
            const { initializationData } = paymentMethod;
            if (initializationData && initializationData.paymentData.nonce) {
                return Promise.resolve({ nonce: paymentMethod.initializationData.paymentData.nonce });
            }
        }

        return new Promise<NonceInstrument | undefined>((resolve, reject?) => {
            if (this._deferredRequestNonce) {
                this._deferredRequestNonce.reject(new TimeoutError());
            }

            this._deferredRequestNonce = { resolve, reject };
            this._getPaymentForm().requestCardNonce();
        });
    }

    private _getFormOptions(deferred: DeferredPromise): SquareFormOptions {
        return {
            ...this._getInitializeOptions(),
            ...this._paymentMethod?.initializationData,
            callbacks: {
                cardNonceResponseReceived: (errors, nonce, cardData, billingContact, shippingContact) => {
                    const deferredRequest = this._getDeferredRequestNonce();
                    const { onError = noop } = this._getInitializeOptions();

                    if (!nonce) {
                        onError(errors);

                        return deferredRequest.reject(get(errors, '0', {}));
                    }

                    if (cardData && cardData.digital_wallet_type !== DigitalWalletType.none && nonce) {
                        this._handleWalletNonceResponse(nonce, cardData, billingContact, shippingContact);
                    } else {
                        if (this._is3DSExperimentOn()) {
                            this._getPaymentForm().verifyBuyer(
                                nonce,
                                this._getVerificationDetails(),
                                (error: SquareVerificationError, verificationResults: SquareVerificationResult) => {

                                    if (!isEmpty(error)) {
                                        onError(error);

                                        return deferredRequest.reject(get(error, '0', {}));
                                    }

                                    deferredRequest.resolve({ nonce: JSON.stringify({ nonce, token: verificationResults.token }) });
                                }
                            );
                        } else {
                            deferredRequest.resolve({ nonce });
                        }
                    }
                },
                createPaymentRequest: this._paymentRequestPayload.bind(this),
                paymentFormLoaded: () => {
                    deferred.resolve();
                    this._setPostalCode();
                },
                unsupportedBrowserDetected: () => deferred.reject(new UnsupportedBrowserError()),
            },
        };
    }

    private _getInitializeOptions(): SquarePaymentInitializeOptions {
        if (!this._squareOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._squareOptions;
    }

    private _handleWalletNonceResponse(
        nonce?: string,
        cardData?: CardData,
        billingContact?: Contact,
        shippingContact?: Contact
    ): void {
        const { onError = noop, onPaymentSelect = noop } = this._getInitializeOptions();

        if (nonce && this._paymentMethod) {
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
        const storeConfig = state.config.getStoreConfigOrThrow();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
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
                ...SDK_VERSION_HEADERS,
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

        if (billingAddress && billingAddress.postalCode) {
            this._getPaymentForm().setPostalCode(billingAddress.postalCode);
        }
    }

    private _getBillingContact(): Contact {
        const state = this._store.getState();
        const billingAddress = state.billingAddress.getBillingAddressOrThrow();

        return {
            givenName: billingAddress.firstName,
            familyName: billingAddress.lastName,
            email: billingAddress.email || '',
            country: billingAddress.countryCode,
            countryName: billingAddress.country,
            region: '',
            city: billingAddress.city,
            postalCode: billingAddress.postalCode,
            addressLines: [ billingAddress.address1, billingAddress.address2],
            phone: billingAddress.phone,
        };
    }

    private _getAmountAndCurrencyCode(): string[] {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const checkout = state.checkout.getCheckoutOrThrow();

        return [String(checkout.grandTotal), cart.currency.code];
    }

    private _getVerificationDetails(): VerificationDetails {
        const billingContact = this._getBillingContact();
        const [ amount, currencyCode ] = this._getAmountAndCurrencyCode();

        return  {
            intent: SquareIntent.CHARGE,
            currencyCode,
            amount,
            billingContact,
        };
    }

    private _getDeferredRequestNonce(): DeferredPromise {
        if (!this._deferredRequestNonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._deferredRequestNonce;
    }

    private _getPaymentForm(): SquarePaymentForm {
        if (!this._paymentForm) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._paymentForm;
    }

    private _is3DSExperimentOn(): boolean {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfigOrThrow();

        return storeConfig.checkoutSettings.features['PROJECT-3828.add_3ds_support_on_squarev2'] === true;
    }
}
