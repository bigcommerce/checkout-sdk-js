import {createAction, createErrorAction} from '@bigcommerce/data-store';

import {BillingAddressActionCreator} from '../../../billing';
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
import {RemoteCheckoutActionCreator} from '../../../remote-checkout';
import {RemoteCheckoutSynchronizationError} from '../../../remote-checkout/errors';
import ConsignmentActionCreator from '../../../shipping/consignment-action-creator';
import {ShippingStrategyActionType} from '../../../shipping/shipping-strategy-actions';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../../index';
import Payment from '../../payment';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    default as mapGooglePayAddressToRequestAddress,
    BraintreeGooglePayPaymentInitializeOptions,
    EnvironmentType,
    GooglePaymentsError,
    GooglePaymentData,
    GooglePayAddress,
    GooglePayBraintreePaymentDataRequest,
    GooglePayBraintreeSDK,
    GooglePayClient,
    GooglePayIsReadyToPayResponse,
    GooglePayPaymentDataRequest,
    GooglePayPaymentOptions, GooglePaySDK, GATEWAY, PaymentSuccessPayload, TokenizePayload
} from './googlepay';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayScriptLoader from './googlepay-script-loader';
import {isInternalAddressEqual, mapFromInternalAddress, mapToInternalAddress} from "../../../address";

export default class GooglePayPaymentStrategy extends PaymentStrategy {
    private _googlePaymentsClient!: GooglePayClient;
    private _googlePaymentInstance!: GooglePayBraintreeSDK;
    private _googlePayOptions!: BraintreeGooglePayPaymentInitializeOptions;
    private _methodId!: string;
    private _paymentMethod?: PaymentMethod;
    private _walletButton?: HTMLElement;

    constructor(
        store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
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

        return this._googlePayPaymentProcessor.teardown() // TODO: teardown google pay js
            .then(() => super.deinitialize(options));
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._getPayment()
            .catch(error => {
                if (error.subtype === MissingDataErrorType.MissingPayment) {
                    return this._displayWallet()
                        .then(() => this._getPayment());
                }

                throw error;
            })
            .then(payment =>
                this._createOrder(payment, payload.useStoreCredit, options)
            );
    }

    private _configureWallet(): Promise<void> {
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
                const testMode = paymentMethod.config.testMode;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayPaymentProcessor.initialize(paymentMethod.clientToken, gateway), // TODO: Create googlePayCreateProcessor to support multiple gateway (approach TBD)
                ])
                    .then(([googlePay, googlePaymentInstance]) => {
                        this._googlePaymentsClient = this._getGooglePaymentsClient(googlePay, testMode);
                        this._googlePaymentInstance = googlePaymentInstance;
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

            if (GATEWAY.braintree === this._paymentMethod.initializationData.gateway) {
                if (!this._googlePaymentInstance && !this._googlePaymentsClient) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                this._googlePaymentsClient.isReadyToPay({
                    allowedPaymentMethods: this._googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods,
                }).then( (response: GooglePayIsReadyToPayResponse) => {
                    if (response) {
                        const paymentDataRequest: GooglePayBraintreePaymentDataRequest = this._googlePaymentInstance.createPaymentDataRequest(this._getGooglePayPaymentRequest()) as GooglePayBraintreePaymentDataRequest;

                        this._googlePaymentsClient.loadPaymentData(paymentDataRequest)
                            .then((paymentData: GooglePaymentData) => {
                                return this._setExternalCheckoutData(paymentData);
                            }).catch((err: GooglePaymentsError) => {
                            reject(new Error(err.statusCode));
                        });
                    }
                });
            }
        });
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
                merchantId: '01234567890123456789',
                // merchantName: 'BIGCOMMERCE',
                // authJwt: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudE9yaWdpbiI6Ind3dy5iaWdjb21tZXJjZS5jb20iLCJtZXJjaGFudElkIjoiMTIzNDUiLCJpYXQiOjE1Mzc1MDE0Mjh9.YjA2YTg5MmQ0MWI3Mjk4ZTdlNzI2ZmYzYzIyYzZkMTY0ZTU4OTlmNTljYmVkNjZkNWEwOGI2MjE3ZmZlNTc1Mg',
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

    private _getGooglePaymentsClient(google: GooglePaySDK, testMode: boolean | undefined): GooglePayClient {
        let environment: EnvironmentType;
        testMode = true;
        if (testMode === undefined) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        } else {
            if (!testMode) {
                environment = 'PRODUCTION';
            } else {
                environment = 'TEST';
            }
        }

        const options: GooglePayPaymentOptions = { environment };

        return new google.payments.api.PaymentsClient(options) as GooglePayClient;
    }

    private _setExternalCheckoutData(paymentData: GooglePaymentData): Promise<void> {
        return this._googlePaymentInstance.parseResponse(paymentData)
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

    private _synchronizeShippingAddress(shippingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {

        if (!this._methodId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._store.dispatch(
            createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: this._methodId })
        )
            .then(() => {
                return this._store.dispatch(
                        this._consignmentActionCreator.updateAddress(mapGooglePayAddressToRequestAddress(shippingAddress))
                    );
            })
            .then(() => this._store.dispatch(
                createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: this._methodId })
            ))
            .catch(error => this._store.dispatch(
                createErrorAction(ShippingStrategyActionType.UpdateAddressFailed, error, { methodId: this._methodId })
            ));
    }

    private _synchronizeBillingAddress(billingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        if (!this._methodId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.initializeBilling(this._methodId, { referenceId: '' })
        )
            .then(state => {
                const remoteBillingAddress = state.billingAddress.getBillingAddress();

                if (!remoteBillingAddress) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                return this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress(mapGooglePayAddressToRequestAddress(billingAddress, remoteBillingAddress.id))
                );
            });
    }

    @bind
    private _handleWalletButtonClick(event: Event): void {

        event.preventDefault();

        this._displayWallet();

    }
}
