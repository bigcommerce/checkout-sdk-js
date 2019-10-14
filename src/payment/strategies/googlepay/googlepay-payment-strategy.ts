import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { GooglePaymentData, PaymentMethodData } from './googlepay';
import GooglePayPaymentInitializeOptions from './googlepay-initialize-options';
import GooglePayPaymentProcessor from './googlepay-payment-processor';

export default class GooglePayPaymentStrategy implements PaymentStrategy {
    private _googlePayOptions?: GooglePayPaymentInitializeOptions;
    private _methodId?: string;
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        return this._googlePayPaymentProcessor.initialize(this._methodId)
            .then(() => {
                this._googlePayOptions = this._getGooglePayOptions(options);

                if (!this._googlePayOptions) {
                    throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
                }

                const walletButton = this._googlePayOptions.walletButton && document.getElementById(this._googlePayOptions.walletButton);

                if (walletButton) {
                    this._walletButton = walletButton;
                    this._walletButton.addEventListener('click', this._handleWalletButtonClick);
                }

                return this._store.getState();
            });
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton) {
            this._walletButton.removeEventListener('click', this._handleWalletButtonClick);
        }

        this._walletButton = undefined;

        return this._googlePayPaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._googlePayOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
        }

        const {
            onError = () => {},
            onPaymentSelect = () => {},
        } = this._googlePayOptions;

        return Promise.resolve(this._getPayment())
            .then(payment => {
                if (!payment.paymentData.nonce || !payment.paymentData.cardInformation) {
                    // TODO: Find a way to share the code with _handleWalletButtonClick method
                    return this._googlePayPaymentProcessor.displayWallet()
                        .then(paymentData => this._paymentInstrumentSelected(paymentData))
                        .then(() => onPaymentSelect())
                        .then(() => this._getPayment())
                        .catch(error => {
                            if (error.statusCode !== 'CANCELED') {
                                onError(error);
                            }
                        });
                }

                return payment;
            })
            .then(() =>
                this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit: payload.useStoreCredit }, options))
                    .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(this._getPayment())))
            );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _paymentInstrumentSelected(paymentData: GooglePaymentData) {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const methodId = this._methodId;

        // TODO: Revisit how we deal with GooglePaymentData after receiving it from Google
        return this._googlePayPaymentProcessor.handleSuccess(paymentData)
            .then(() => Promise.all([
                this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
            ]));
    }

    private _getGooglePayOptions(options: PaymentInitializeOptions): GooglePayPaymentInitializeOptions {
        if (options.methodId === 'googlepaybraintree' && options.googlepaybraintree) {
            return options.googlepaybraintree;
        }

        if (options.methodId === 'googlepaystripe' && options.googlepaystripe) {
            return options.googlepaystripe;
        }

        throw new InvalidArgumentError();
    }

    private _getPayment(): PaymentMethodData {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

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

        return {
            methodId: this._methodId,
            paymentData,
        };
    }

    @bind
    private _handleWalletButtonClick(event: Event): Promise<InternalCheckoutSelectors> {
        event.preventDefault();

        if (!this._methodId || !this._googlePayOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const methodId = this._methodId;

        const {
            onError = () => {},
            onPaymentSelect = () => {},
        } = this._googlePayOptions;

        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            return this._googlePayPaymentProcessor.displayWallet()
                .then(paymentData => this._paymentInstrumentSelected(paymentData))
                .then(() => onPaymentSelect())
                .catch(error => {
                    if (error.statusCode !== 'CANCELED') {
                        onError(error);
                    }
                });
        }, { methodId }), { queueId: 'widgetInteraction' });
    }
}
