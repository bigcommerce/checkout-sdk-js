import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import { AdyenPaymentMethodType } from '../adyenv2';
import PaymentStrategy from '../payment-strategy';

import { GooglePaymentData, PaymentMethodData } from './googlepay';
import GooglePayAdyenV2PaymentProcessor from './googlepay-adyenv2-payment-processor';
import GooglePayPaymentInitializeOptions from './googlepay-initialize-options';
import GooglePayPaymentProcessor from './googlepay-payment-processor';

export default class GooglePayPaymentStrategy implements PaymentStrategy {
    private _googlePayOptions?: GooglePayPaymentInitializeOptions;
    private _walletButton?: HTMLElement;
    private _paymentMethod?: PaymentMethod;
    private _buttonClickEventHandler?: (event: Event ) => Promise<InternalCheckoutSelectors>;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _googlePayAdyenV2PaymentProcessor?: GooglePayAdyenV2PaymentProcessor
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        this._googlePayOptions = this._getGooglePayOptions(options);

        this._buttonClickEventHandler = this._handleButtonClickedEvent(methodId);

        if (this._paymentMethod.initializationData.nonce) {
            return Promise.resolve(this._store.getState());
        }

        await this._googlePayPaymentProcessor.initialize(methodId);

        if (!this._googlePayOptions.walletButton) {
            throw new InvalidArgumentError('walletButton argument is missing');
        }

        const walletButton = document.getElementById(this._googlePayOptions.walletButton);

        if (!walletButton) {
            throw new InvalidArgumentError('Unable to create wallet, walletButton ID could not be found');
        }

        this._walletButton = walletButton;
        this._walletButton.addEventListener('click', this._buttonClickEventHandler);

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._buttonClickEventHandler) {
            this._walletButton.removeEventListener('click', this._buttonClickEventHandler);
        }

        this._buttonClickEventHandler = undefined;
        this._walletButton = undefined;

        return this._googlePayPaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._googlePayOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
        }

        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payload.payment;

        if (this._paymentMethod?.initializationData.nonce !== '') {
            const state = this._store.getState();
            this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        }

        let payment = await this._getPayment(methodId);

        if (!payment.paymentData.nonce || !payment.paymentData.cardInformation) {
            const {
                onError = () => {},
                onPaymentSelect = () => {},
            } = this._googlePayOptions;
            await this._displayWallet(methodId, onPaymentSelect, onError);
            payment = await this._getPayment(methodId, true);
        }

        if (!payment.paymentData.nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        try {
            await this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit: payload.useStoreCredit }, options));

            return await this._store.dispatch(this._paymentActionCreator.submitPayment(payment));
        } catch (error) {
            return this._googlePayAdyenV2PaymentProcessor?.processAdditionalAction(error) || Promise.reject(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _getGooglePayOptions(options: PaymentInitializeOptions): GooglePayPaymentInitializeOptions {
        if (options.methodId === 'googlepayadyenv2' && options.googlepayadyenv2) {
            if (!this._googlePayAdyenV2PaymentProcessor) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._googlePayAdyenV2PaymentProcessor.initialize(options);

            return options.googlepayadyenv2;
        }

        if (options.methodId === 'googlepayauthorizenet' && options.googlepayauthorizenet) {
            return options.googlepayauthorizenet;
        }

        if (options.methodId === 'googlepaycheckoutcom' && options.googlepaycheckoutcom) {
            return options.googlepaycheckoutcom;
        }

        if (options.methodId === 'googlepaycybersourcev2' && options.googlepaycybersourcev2) {
            return options.googlepaycybersourcev2;
        }

        if (options.methodId === 'googlepayorbital' && options.googlepayorbital) {
            return options.googlepayorbital;
        }

        if (options.methodId === 'googlepaybraintree' && options.googlepaybraintree) {
            return options.googlepaybraintree;
        }

        if (options.methodId === 'googlepaystripe' && options.googlepaystripe) {
            return options.googlepaystripe;
        }

        throw new InvalidArgumentError('Unable to initialize payment because "options.googlepay" argument is not provided.');
    }

    private async _getPayment(methodId: string, requireRenewNonce = false): Promise<PaymentMethodData> {
        if (!methodId || !this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const card_information = this._paymentMethod?.initializationData.card_information;
        let nonce = this._paymentMethod?.initializationData.nonce;

        if (nonce) {
            this._paymentMethod = { ...this._paymentMethod,  initializationData: { nonce: ''} };
        }

        if (requireRenewNonce) {
            const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
            this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
            nonce = this._paymentMethod?.initializationData.nonce;
        }

        return {
            methodId,
            paymentData: {
                method: methodId,
                cardInformation: card_information,
                nonce: await this._encodeNonce(methodId, nonce),
            },
        };
    }

    private async _encodeNonce(methodId: string, nonce: string) {
        if (methodId === 'googlepayadyenv2') {
            return JSON.stringify({
                type: AdyenPaymentMethodType.GooglePay,
                googlePayToken: nonce,
                browser_info: getBrowserInfo(),
            });
        }

        return nonce;
    }

    private async _paymentInstrumentSelected(paymentData: GooglePaymentData, methodId: string) {
        if (!methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        // TODO: Revisit how we deal with GooglePaymentData after receiving it from Google
        await this._googlePayPaymentProcessor.handleSuccess(paymentData);

        const state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (this._paymentMethod.initializationData.nonce) {
            return await Promise.all([
                this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                this._store.getState(),
            ]);
        }

        return await Promise.all([
            this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
            this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
        ]);
    }

    private _handleButtonClickedEvent(methodId: string): (event?: Event) => Promise<InternalCheckoutSelectors> {

        return (event?: Event) => {
            event?.preventDefault();

            if (!methodId || !this._googlePayOptions) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const {
                onError = () => {},
                onPaymentSelect = () => {},
            } = this._googlePayOptions;

            return this._store.dispatch(
                this._paymentStrategyActionCreator.widgetInteraction(
                    async () => await this._displayWallet(methodId, onPaymentSelect, onError),
                        { methodId }
                ),
                { queueId: 'widgetInteraction' }
            );
        };
    }

    private async _displayWallet(methodId: string, onPaymentSelect: () => void, onError: (onError: Error) => void ): Promise<void> {
        try {
            const paymentData = await this._googlePayPaymentProcessor.displayWallet();
            await this._paymentInstrumentSelected(paymentData, methodId);

            return onPaymentSelect();
        } catch (error) {
            if (error.statusCode === 'CANCELED') {
                throw new Error('CANCELED');
            }
            onError(error);
        }
    }
}
