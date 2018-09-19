import {Subject} from 'rxjs/Subject';

import CheckoutStore from '../../../checkout/checkout-store';
import { CheckoutActionCreator } from '../../../checkout/index';
import InternalCheckoutSelectors from '../../../checkout/internal-checkout-selectors';
import {
    InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedErrorType,
    StandardError
} from '../../../common/error/errors/index';
import NotInitializedError from '../../../common/error/errors/not-initialized-error';
import { bindDecorator as bind } from '../../../common/utility';
import { OrderActionCreator, OrderRequestBody } from '../../../order/index';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../../index';
import Payment from '../../payment';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    BraintreeGooglePayPaymentInitializeOptions,
    GooglePaymentsError,
    GooglePaymentData,
    GooglePayBraintreePaymentDataRequest,
    GooglePayBraintreeSDK,
    GooglePayClient,
    GooglePayIsReadyToPayResponse,
    GooglePayPaymentDataRequest,
    GooglePayPaymentOptions,
    GooglePaySDK,
    GATEWAY,
    PaymentSuccessPayload,
    TokenizePayload
} from './googlepay';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglepayPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _methodId!: string;
    private _googlePayOptions!: BraintreeGooglePayPaymentInitializeOptions;
    private _walletButton?: HTMLElement;
    private _googlePaymentInstance!: GooglePayBraintreeSDK;
    private _googlePaymentsClient!: GooglePayClient;

    constructor(
        store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        if (!options.googlepay) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
        }

        this._googlePayOptions = options.googlepay;

        const walletButton = options.googlepay.walletButton && document.getElementById(options.googlepay.walletButton); // document.getElementById('GooglePayContainer');

        if (walletButton) {
            this._walletButton = walletButton;
            this._walletButton.addEventListener('click', this._handleWalletButtonClick);
        }

        return this._configureWallet(options.googlepay)
            .then(() => super.initialize(options));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {

        if (this._walletButton) {
            this._walletButton.removeEventListener('click', this._handleWalletButtonClick);
        }

        this._walletButton = undefined;

        return this._googlePayPaymentProcessor.teardown() // TODO: teardown google pay js
            .then(() => super.deinitialize(options));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData || !this._paymentMethod.initializationData.nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { nonce } = this._paymentMethod.initializationData;

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData: { nonce } }))
            )
            .catch((error: Error) => this._handleError(error));
    }

    private _configureWallet(options: BraintreeGooglePayPaymentInitializeOptions): Promise<void> {
        if (!this._methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
                const storeConfig = state.config.getStoreConfig();

                if (!paymentMethod || !paymentMethod.clientToken || !paymentMethod.initializationData.gateway) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                this._paymentMethod = paymentMethod;
                const gateway = paymentMethod.initializationData.gateway;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayPaymentProcessor.initialize(paymentMethod.clientToken, gateway), // TODO: Create googlePayCreateProcessor to support multiple gateway (approach TBD)
                ])
                    .then(([googlePay, googlePaymentInstance]) => {
                        this._googlePaymentsClient = this._getGooglePaymentsClient(googlePay);
                        this._googlePaymentInstance = googlePaymentInstance;
                        // const paymentsClient = this._getGooglePaymentsClient(googlePay);
                        // const button = document.querySelector('#GooglePayContainer') as Element;

                        // if (GATEWAY.braintree === gateway) {
                        //     this._braintreeGooglePayInitializer(this._googlePaymentsClient, this._googlePaymentInstance, options, this._walletButton);
                        // }
                    })
                    .catch((error: Error) => {
                        this._handleError(error);
                    });
            });
    }

    @bind
    private _handleWalletButtonClick(event: Event): void {

        event.preventDefault();

        this._displayWallet();

    }

    private _displayWallet() {
        if (!this._paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (GATEWAY.braintree === this._paymentMethod.initializationData.gateway) {
            if (this._googlePaymentInstance === undefined && this._googlePaymentsClient === undefined) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._googlePaymentsClient.isReadyToPay({
                allowedPaymentMethods: this._googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods,
            }).then( (response: GooglePayIsReadyToPayResponse) => {
                if (response) {
                    const paymentDataRequest: GooglePayBraintreePaymentDataRequest = this._googlePaymentInstance.createPaymentDataRequest(this._getGooglePayPaymentRequest()) as GooglePayBraintreePaymentDataRequest;

                    this._googlePaymentsClient.loadPaymentData(paymentDataRequest)
                        .then((paymentData: GooglePaymentData) => {
                            this._setExternalCheckoutData(paymentData);
                        }).catch((err: GooglePaymentsError) => {
                        this._handleError(new Error(err.statusCode));
                    });
                }
            });
        }
    }

    private _createOrder(payment: Payment, useStoreCredit?: boolean, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit }, options))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(payment)));
    }

    private _getGooglePayPaymentRequest(): GooglePayPaymentDataRequest {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }
        const googlePaymentDataRequest: GooglePayPaymentDataRequest = {
            merchantInfo: {
                merchantId: 'your-merchant-id-from-google',
            },
            transactionInfo: {
                currencyCode: checkout.cart.currency.code,
                totalPriceStatus: 'FINAL',
                totalPrice: checkout.grandTotal.toString(),
            },
            cardRequirements: {
                // We recommend collecting billing address information, at minimum
                // billing postal code, and passing that billing postal code with all
                // Google Pay transactions as a best practice.
                billingAddressRequired: true,
                billingAddressFormat: 'FULL',
            },
            shippingAddressRequired: true,
            emailRequired: true,
            phoneNumberRequired: true,
        };

        return googlePaymentDataRequest;
    }

    private _getGooglePaymentsClient(google: GooglePaySDK): GooglePayClient {
        const options: GooglePayPaymentOptions = { environment: 'TEST' };
        return new google.payments.api.PaymentsClient(options) as GooglePayClient;
    }

    private _setExternalCheckoutData(paymentData: GooglePaymentData) {
        this._googlePaymentInstance.parseResponse(paymentData)
            .then((tokenizePayload: TokenizePayload) => {
                const paymentSuccessPayload: PaymentSuccessPayload = {
                    tokenizePayload,
                    billingAddress: paymentData.cardInfo.billingAddress,
                    shippingAddress: paymentData.shippingAddress,
                    email: paymentData.email,
                };

                const {
                    onError = () => {},
                    onPaymentSelect = () => {},
                } = this._googlePayOptions;

                this._paymentInstrumentSelected(paymentSuccessPayload)
                    .then(() => onPaymentSelect())
                    .catch(error => onError(error));
            });
    }

    private _paymentInstrumentSelected(paymentSuccessPayload: PaymentSuccessPayload) {
        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }

        const { id: methodId } = this._paymentMethod;

        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            return this._googlePayPaymentProcessor.handleSuccess(paymentSuccessPayload)
                .then(() => Promise.all([
                    this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                    this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
                ]));
        }, { methodId }), { queueId: 'widgetInteraction' });
    }

    private _handleError(error: Error): never {
        throw new StandardError(error.message);
    }
}
