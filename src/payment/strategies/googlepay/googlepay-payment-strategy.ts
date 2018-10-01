import { RequestSender } from '@bigcommerce/request-sender';
import Response from '@bigcommerce/request-sender/lib/response';

import { BillingAddressActionCreator } from '../../../billing';
import { BillingAddressUpdateRequestBody } from '../../../billing';
import CheckoutStore from '../../../checkout/checkout-store';
import { CheckoutActionCreator } from '../../../checkout/index';
import InternalCheckoutSelectors from '../../../checkout/internal-checkout-selectors';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedErrorType,
    StandardError
} from '../../../common/error/errors/index';
import NotInitializedError from '../../../common/error/errors/not-initialized-error';
import { toFormUrlEncoded } from '../../../common/http-request';
import { bindDecorator as bind } from '../../../common/utility';
import {
    OrderActionCreator,
    OrderRequestBody
} from '../../../order/index';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import ConsignmentActionCreator from '../../../shipping/consignment-action-creator';
import {
    PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentStrategyActionCreator
} from '../../index';
import Payment from '../../payment';
import PaymentMethod from '../../payment-method';
import {
    PaymentInitializeOptions,
    PaymentRequestOptions
} from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    default as mapGooglePayAddressToRequestAddress,
    ButtonColor,
    ButtonType,
    EnvironmentType,
    GooglePaymentsError,
    GooglePaymentData,
    GooglePayAddress,
    GooglePayClient,
    GooglePayInitializer,
    GooglePayIsReadyToPayResponse,
    GooglePayPaymentDataRequestV1,
    GooglePayPaymentOptions, GooglePaySDK,
    PaymentSuccessPayload,
    TokenizePayload
} from './googlepay';
import GooglePayPaymentInitializeOptions from './googlepay-initialize-options';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglePayPaymentStrategy extends PaymentStrategy {
    private _googlePaymentsClient!: GooglePayClient;
    private _googlePayOptions!: GooglePayPaymentInitializeOptions;
    private _methodId!: string;
    private _paymentMethod?: PaymentMethod;
    private _walletButton?: HTMLElement;
    private _googlePaymentDataRequest!: GooglePayPaymentDataRequestV1;

    constructor(
        store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayInitializer: GooglePayInitializer, // || GooglePayStripeInitializer
        private _requestSender: RequestSender,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        if (!options.googlepay) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
        }

        this._googlePayOptions = options.googlepay;

        const walletButton = options.googlepay.walletButton && document.getElementById(options.googlepay.walletButton);

        if (walletButton) {
            this._walletButton = walletButton;
            this._walletButton.addEventListener('click', this._handleWalletButtonClick);
        }

        return this._configureWallet()
            .then(() => super.initialize(options));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {

        if (this._walletButton) {
            this._walletButton.removeEventListener('click', this._handleWalletButtonClick);
        }

        this._walletButton = undefined;

        return this._googlePayInitializer.teardown()
            .then(() => super.deinitialize(options));
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._getPayment()
            .catch((error: MissingDataError) => {
                if (error.subtype === MissingDataErrorType.MissingPayment) {
                    return this._displayWallet()
                        .then(() => this._getPayment());
                }

                throw error;
            })
            .then(payment => {
                return this._createOrder(payment, payload.useStoreCredit, options);
            });
    }

    createButton(): HTMLElement {
        return this._googlePaymentsClient.createButton({
            buttonColor: ButtonColor.default,
            buttonType: ButtonType.short,
            onClick: this._handleWalletButtonClick,
        });
    }

    private _configureWallet(): Promise<void> {
        if (!this._methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
                const storeConfig = state.config.getStoreConfig();
                const checkout = state.checkout.getCheckout();
                const hasShippingAddress = !!state.shippingAddress.getShippingAddress();

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                this._paymentMethod = paymentMethod;
                const testMode = paymentMethod.config.testMode;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayInitializer.initialize(checkout, paymentMethod, hasShippingAddress),
                ])
                    .then(([googlePay, googlePayPaymentDataRequest]) => {
                        this._googlePaymentsClient = this._getGooglePaymentsClient(googlePay, testMode);
                        this._googlePaymentDataRequest = googlePayPaymentDataRequest;
                    })
                    .catch((error: Error) => {
                        this._handleError(error);
                    });
            });
    }

    private _displayWallet(): Promise<InternalCheckoutSelectors> {
        return new Promise((resolve, reject) => {
            if (!this._paymentMethod) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (!this._googlePaymentsClient && !this._googlePaymentDataRequest) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._googlePaymentsClient.isReadyToPay({
                allowedPaymentMethods: this._googlePaymentDataRequest.allowedPaymentMethods,
            }).then( (response: GooglePayIsReadyToPayResponse) => {
                if (response) {
                    this._googlePaymentsClient.loadPaymentData(this._googlePaymentDataRequest)
                        .then((paymentData: GooglePaymentData) => {
                            return this._setExternalCheckoutData(paymentData);
                        }).catch((err: GooglePaymentsError) => {
                        reject(new Error(err.statusCode));
                    });
                }
            });
        });
    }

    private _createOrder(payment: Payment, useStoreCredit?: boolean, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit }, options))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(payment)));
    }

    private _getGooglePaymentsClient(google: GooglePaySDK, testMode: boolean | undefined): GooglePayClient {
        let environment: EnvironmentType;
        testMode = true; // TODO: remove when push this code to final review
        if (testMode === undefined) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!testMode) {
            environment = 'PRODUCTION';
        } else {
            environment = 'TEST';
        }

        const options: GooglePayPaymentOptions = { environment };

        return new google.payments.api.PaymentsClient(options) as GooglePayClient;
    }

    private _setExternalCheckoutData(paymentData: GooglePaymentData): Promise<void> {
        return this._googlePayInitializer.parseResponse(paymentData)
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

                this._updateShippingAndBillingAddress(paymentSuccessPayload).then(() => {
                    return this._paymentInstrumentSelected(paymentSuccessPayload)
                        .then(() => onPaymentSelect())
                        .catch(error => onError(error));
                });
            });
    }

    private _paymentInstrumentSelected(paymentSuccessPayload: PaymentSuccessPayload): Promise<InternalCheckoutSelectors> {
        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }

        const { id: methodId } = this._paymentMethod;

        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            return this._postForm(paymentSuccessPayload)
                .then(() => Promise.all([
                    this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                    this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
                ]));
        }, { methodId }), { queueId: 'widgetInteraction' });
    }

    private _postForm(paymentData: PaymentSuccessPayload): Promise<Response<any>> {
        const cardInformation = paymentData.tokenizePayload.details;

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: toFormUrlEncoded({
                payment_type: paymentData.tokenizePayload.type,
                nonce: paymentData.tokenizePayload.nonce,
                provider: 'googlepay',
                action: 'set_external_checkout',
                card_information: this._getCardInformation(cardInformation),
            }),
        });
    }

    private _getCardInformation(cardInformation: { cardType: string, lastFour: string }) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastFour,
        };
    }

    private _handleError(error: Error): never {
        throw new StandardError(error.message);
    }

    private _getPayment() {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(() => {
                const state = this._store.getState();
                const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!paymentMethod.initializationData.nonce) {
                    throw new MissingDataError(MissingDataErrorType.MissingPayment);
                }

                const paymentData = {
                    method: this._methodId,
                    nonce: paymentMethod.initializationData.nonce,
                    cardInformation: paymentMethod.initializationData.card_information,
                };

                this._paymentMethod = paymentMethod;

                return {
                    methodId: this._methodId,
                    paymentData,
                };
            });
    }

    private _updateShippingAndBillingAddress(paymentSucessPayload: PaymentSuccessPayload): Promise<void> {
        return Promise.all([
                this._synchronizeShippingAddress(paymentSucessPayload.shippingAddress),
                this._synchronizeBillingAddress(paymentSucessPayload.billingAddress),
            ]).then(() => Promise.resolve());
    }

    private _synchronizeShippingAddress(shippingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors | void> {
        if (!this._methodId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        if (!shippingAddress) {
            return Promise.resolve();
        }

        return this._store.dispatch(
            this._consignmentActionCreator.updateAddress(mapGooglePayAddressToRequestAddress(shippingAddress))
        ).then(() => this._store.getState());
    }

    private _synchronizeBillingAddress(billingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        if (!this._methodId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(state => {
                const remoteBillingAddress = state.billingAddress.getBillingAddress();
                let googlePayAddressMapped: BillingAddressUpdateRequestBody;

                if (!remoteBillingAddress) {
                    googlePayAddressMapped = mapGooglePayAddressToRequestAddress(billingAddress) as BillingAddressUpdateRequestBody;
                } else {
                    googlePayAddressMapped = mapGooglePayAddressToRequestAddress(billingAddress, remoteBillingAddress.id) as BillingAddressUpdateRequestBody;
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(googlePayAddressMapped)
                );
            });
    }

    @bind
    private _handleWalletButtonClick(event: Event): void {
        event.preventDefault();

        this._displayWallet();
    }
}
