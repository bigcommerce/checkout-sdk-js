import CheckoutStore from '../../../checkout/checkout-store';
import { CheckoutActionCreator } from '../../../checkout/index';
import InternalCheckoutSelectors from '../../../checkout/internal-checkout-selectors';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, StandardError } from '../../../common/error/errors/index';
import { OrderActionCreator, OrderRequestBody } from '../../../order/index';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../../index';
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
        const { methodId, googlepay: googlePayOptions } = options;

        if (!googlePayOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {

                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.clientToken || !this._paymentMethod.initializationData.gateway) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const gateway = this._paymentMethod.initializationData.gateway;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayPaymentProcessor.initialize(this._paymentMethod.clientToken, gateway), // TODO: Create googlePayCreateProcessor to support multiple gateway (new approach)
                ])
                .then(([googlePay, googlePaymentInstance]) => {
                    const paymentsClient = this._getGooglePaymentsClient(googlePay);
                    const button = document.querySelector('#GooglePayContainer') as Element;

                    if (GATEWAY.braintree === gateway) {
                        this._braintreeGooglePayInitializer(paymentsClient, googlePaymentInstance, button, googlePayOptions);
                    }
                })
                .catch((error: Error) => {
                    this._handleError(error);
                });
            }).then(() => super.initialize(options));
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

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._googlePayPaymentProcessor.teardown()
            .then(() => super.deinitialize(options));
    }

    private _braintreeGooglePayInitializer(paymentsClient: GooglePayClient, googlePaymentInstance: GooglePayBraintreeSDK, button: Element, googlePayOptions: BraintreeGooglePayPaymentInitializeOptions): void {
        paymentsClient.isReadyToPay(
            {
                allowedPaymentMethods: googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods,
            }).then( (response: GooglePayIsReadyToPayResponse) => {
            if (response.result) {
                if (button) {
                    button.addEventListener('click', (event: any) => {
                        event.preventDefault();

                        const paymentDataRequest: GooglePayBraintreePaymentDataRequest = googlePaymentInstance.createPaymentDataRequest(this._getGooglePayPaymentRequest()) as GooglePayBraintreePaymentDataRequest;

                        paymentsClient.loadPaymentData(paymentDataRequest)
                            .then((paymentData: GooglePaymentData) => {
                                return this._setExternalCheckoutData(paymentData, googlePaymentInstance, googlePayOptions);
                            }).catch((err: GooglePaymentsError) => {
                                this._handleError(new Error(err.statusCode));
                            });
                    });
                } else {
                    this._handleError(new Error('GooglePay button is not ready'));
                }
            } else {
                this._handleError(new Error('GooglePay is not ready to pay'));
            }
        });
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

    private _setExternalCheckoutData(paymentData: GooglePaymentData, googlePaymentInstance: GooglePayBraintreeSDK, googlePayOptions: BraintreeGooglePayPaymentInitializeOptions) {
        googlePaymentInstance.parseResponse(paymentData)
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
                } = googlePayOptions;

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
