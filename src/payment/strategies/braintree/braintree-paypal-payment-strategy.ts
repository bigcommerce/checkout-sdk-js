import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError, PaymentMethodFailedError } from '../../errors';
import isVaultedInstrument, { isHostedVaultedInstrument } from '../../is-vaulted-instrument';
import Payment, { FormattedPayload, PaypalInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import { BraintreePaymentInitializeOptions } from '../../strategies/braintree';
import PaymentStrategy from '../payment-strategy';

import { BraintreeError } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import isBraintreeError from './is-braintree-error';
import mapToBraintreeShippingAddressOverride from './map-to-braintree-shipping-address-override';

export default class BraintreePaypalPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
        private _credit: boolean = false
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintree: braintreeOptions, methodId } = options;

        if (!this._paymentMethod || !this._paymentMethod.nonce) {
            this._paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
        }

        if (this._paymentMethod.clientToken) {
            return this._loadPaypal(braintreeOptions);
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._loadPaypal(braintreeOptions);
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return (payment ? this._preparePaymentData(payment, order.useStoreCredit) : Promise.resolve(payment))
            .then(payment => Promise.all([payment, this._store.dispatch(this._orderActionCreator.submitOrder(order, options))]))
            .then(([payment]) => this._store.dispatch(this._paymentActionCreator.submitPayment(payment)))
            .catch((error: Error) => this._handleError(error));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    private _handleError(error: BraintreeError | Error): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        if (error.code === 'PAYPAL_POPUP_CLOSED') {
            throw new PaymentMethodCancelledError(error.message);
        }

        throw new PaymentMethodFailedError(error.message);
    }

    private async _preparePaymentData(payment: OrderPaymentRequestBody, useStoreCredit?: boolean): Promise<Payment> {
        const state = this._store.getState();

        const grandTotal = state.checkout.getOutstandingBalance(useStoreCredit);
        const config = state.config.getStoreConfig();

        if (!grandTotal) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { currency, storeProfile: { storeLanguage } } = config;
        const { nonce, config: { isVaultingEnabled } } = this._paymentMethod;
        const { methodId, paymentData = {} } = payment;

        if (nonce) {
            const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
            this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

            return Promise.resolve({ ...payment, paymentData: this._formattedPayload(nonce) });
        }

        if (isVaultedInstrument(paymentData) || isHostedVaultedInstrument(paymentData)) {
            if (!isVaultingEnabled) {
                throw new InvalidArgumentError('Vaulting is disabled but a vaulted instrument was being used for this transaction');
            }

            return Promise.resolve(payment);
        }

        if (paymentData.shouldSaveInstrument && !isVaultingEnabled) {
            throw new InvalidArgumentError('Vaulting is disabled but shouldSaveInstrument is set to true');
        }

        const shippingAddress = state.shippingAddress.getShippingAddress();

        const shippingAddressOverride = shippingAddress ? mapToBraintreeShippingAddressOverride(shippingAddress) : undefined;

        return Promise.all([
            this._braintreePaymentProcessor.paypal({
                amount: grandTotal,
                locale: storeLanguage,
                currency: currency.code,
                offerCredit: this._credit,
                shippingAddressOverride,
                shouldSaveInstrument: paymentData.shouldSaveInstrument || false,
            }),
            this._braintreePaymentProcessor.getSessionId(),
        ]).then(([
            { nonce, details } = {} as any,
            sessionId,
        ]) => ({
            ...payment,
            paymentData: this._formattedPayload(nonce, details && details.email, sessionId, paymentData.shouldSaveInstrument, paymentData.shouldSetAsDefaultInstrument),
        }));
    }

    private _formattedPayload(token: string, email?: string, sessionId?: string, vaultPaymentInstrument?: boolean, shouldSetAsDefaultInstrument?: boolean): FormattedPayload<PaypalInstrument> {
        return {
            formattedPayload: {
                vault_payment_instrument: vaultPaymentInstrument || null,
                set_as_default_stored_instrument: shouldSetAsDefaultInstrument || null,
                device_info: sessionId || null,
                paypal_account: {
                    token,
                    email: email || null,
                },
            },
        };
    }

    private _loadPaypal(braintreeOptions?: BraintreePaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!this._paymentMethod || !this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(this._paymentMethod.clientToken, braintreeOptions);

            this._braintreePaymentProcessor.preloadPaypal();
        } catch (error) {
            this._handleError(error);
        }

        return Promise.resolve(this._store.getState());
    }
}
