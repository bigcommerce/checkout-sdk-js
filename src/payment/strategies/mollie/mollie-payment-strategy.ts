import { some } from 'lodash';

import { PaymentActionCreator } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { MollieClient, MollieElement } from './mollie';
import MolliePaymentInitializeOptions from './mollie-initialize-options';
import MollieScriptLoader from './mollie-script-loader';

export default class MolliePaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: MolliePaymentInitializeOptions;
    private _mollieClient?: MollieClient;
    private _cardHolderElement?: MollieElement;
    private _cardNumberElement?: MollieElement;
    private _verificationCodeElement?: MollieElement;
    private _expiryDateElement?: MollieElement;

    constructor(
        private _store: CheckoutStore,
        private _mollieScriptLoader: MollieScriptLoader,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) { }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { mollie, methodId } = options;

        if (!mollie) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.mollie" argument is not provided.');
        }
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        this._initializeOptions = mollie;

        const paymentMethods = state.paymentMethods;
        const paymentMethod = paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { config: { merchantId, testMode } } = paymentMethod;

        if (!merchantId) {
            throw new InvalidArgumentError('Unable to initialize payment because "merchantId" argument is not provided.');
        }

        if (methodId === 'creditcard') {
            this._mollieClient = await this._loadMollieJs(merchantId, storeConfig.storeProfile.storeLanguage, testMode);
            this._mountElements();
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment , ...order} = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError([ 'payment' ]);
        }

        try {
            if (payment.methodId === 'creditcard') {
                await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

                const { token, error } = await this._getMollieClient().createToken();

                if (error) {
                    return Promise.reject(error);
                }

                return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token,
                            },
                            browser_info: getBrowserInfo(),
                        },
                    },
                }));
            } else {
                await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

                return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                }));
            }
        } catch (error) {

            return this._processAdditionalAction(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._cardNumberElement?.unmount();
        this._expiryDateElement?.unmount();
        this._verificationCodeElement?.unmount();
        this._cardHolderElement?.unmount();

        return Promise.resolve(this._store.getState());
    }

    private _processAdditionalAction(error: any): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'additional_action_required'})) {
            return Promise.reject(error);
        }

        const { additional_action_required: { data : { redirect_url } } } = error.body;

        return new Promise(() => window.location.replace(redirect_url));
    }

    private _getInitializeOptions(): MolliePaymentInitializeOptions {
        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._initializeOptions;
    }

    private async _loadMollieJs(merchantId: string, locale: string, testmode: boolean = false) {
        if (this._mollieClient) {
            return Promise.resolve(this._mollieClient);
        }

        return await this._mollieScriptLoader
            .load(merchantId, locale, testmode);
    }

    private _getMollieClient(): MollieClient {
        if (!this._mollieClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._mollieClient;
    }

    private _mountElements() {
        const mollieClient = this._getMollieClient();
        const { cardNumberId, cardCvcId, cardExpiryId, cardHolderId, styles } = this._getInitializeOptions();

        this._cardHolderElement = mollieClient.createComponent('cardHolder', { styles });
        this._cardNumberElement = mollieClient.createComponent('cardNumber', { styles });
        this._verificationCodeElement = mollieClient.createComponent('verificationCode', { styles });
        this._expiryDateElement = mollieClient.createComponent('expiryDate', { styles });

        this._cardNumberElement.mount(`#${cardNumberId}`);
        this._expiryDateElement.mount(`#${cardExpiryId}`);
        this._verificationCodeElement.mount(`#${cardCvcId}`);
        this._cardHolderElement.mount(`#${cardHolderId}`);
    }
}
