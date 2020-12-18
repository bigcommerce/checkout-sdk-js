import { pick } from 'lodash';

import { Address } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodFailedError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { CreditCardInstrument, NonceInstrument, PaymentInstrument, PaymentInstrumentMeta, VaultedInstrumentWithNonceVerification } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private _is3dsEnabled?: boolean;
    private _isHostedFormInitialized?: boolean;
    private _deviceSessionId?: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(paymentMethod.clientToken, options.braintree);

            if (this._isHostedPaymentFormEnabled(options.methodId, options.gatewayId) && options.braintree?.form) {
                this._isHostedFormInitialized = await this._braintreePaymentProcessor.initializeHostedForm(options.braintree.form);
            }

            this._is3dsEnabled = paymentMethod.config.is3dsEnabled;
            this._deviceSessionId = await this._braintreePaymentProcessor.getSessionId();
        } catch (error) {
            this._handleError(error);
        }

        return this._store.getState();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const state = await this._store.dispatch(
            this._orderActionCreator.submitOrder(order, options)
        );

        const {
            billingAddress: { getBillingAddressOrThrow },
            order: { getOrderOrThrow },
            payment: { isPaymentDataRequired },
        } = state;

        if (!isPaymentDataRequired(order.useStoreCredit)) {
            return state;
        }

        try {
            return this._store.dispatch(this._paymentActionCreator.submitPayment({
                ...payment,
                paymentData: this._isHostedFormInitialized ?
                    await this._prepareHostedPaymentData(
                        payment,
                        getBillingAddressOrThrow(),
                        getOrderOrThrow().orderAmount
                    ) :
                    await this._preparePaymentData(
                        payment,
                        getBillingAddressOrThrow(),
                        getOrderOrThrow().orderAmount
                    ),
            }));
        } catch (error) {
            this._handleError(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        this._isHostedFormInitialized = false;

        await Promise.all([
            this._braintreePaymentProcessor.deinitialize(),
            this._braintreePaymentProcessor.deinitializeHostedForm(),
        ]);

        return this._store.getState();
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }

    private async _preparePaymentData(payment: OrderPaymentRequestBody, billingAddress: Address, orderAmount: number): Promise<PaymentInstrument & PaymentInstrumentMeta> {
        const commonPaymentData = { deviceSessionId: this._deviceSessionId };

        if (this._isSubmittingWithStoredCard(payment) || this._isStoringNewCard(payment)) {
            return {
                ...commonPaymentData,
                ...payment.paymentData,
            };
        }

        if (this._shouldPerform3DSVerification(payment)) {
            return {
                ...commonPaymentData,
                ...this._mapToNonceInstrument({
                    ...payment.paymentData,
                    ...await this._braintreePaymentProcessor.verifyCard(payment, billingAddress, orderAmount),
                }),
            };
        }

        return {
            ...commonPaymentData,
            ...this._mapToNonceInstrument({
                ...payment.paymentData,
                ...await this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress),
            }),
        };
    }

    private async _prepareHostedPaymentData(payment: OrderPaymentRequestBody, billingAddress: Address, orderAmount: number): Promise<PaymentInstrument & PaymentInstrumentMeta> {
        const commonPaymentData = { deviceSessionId: this._deviceSessionId };

        if (this._shouldPerform3DSVerification(payment)) {
            return {
                ...commonPaymentData,
                ...this._mapToNonceInstrument({
                    ...payment.paymentData,
                    ...await this._braintreePaymentProcessor.verifyCardWithHostedForm(billingAddress, orderAmount),
                }),
            };
        }

        if (this._isSubmittingWithStoredCard(payment)) {
            return {
                ...commonPaymentData,
                ...this._mapToVaultedInstrumentWithNonceVerification({
                    ...payment.paymentData,
                    ...await this._braintreePaymentProcessor.tokenizeHostedFormForStoredCardVerification(),
                }),
            };
        }

        return {
            ...commonPaymentData,
            ...this._mapToNonceInstrument({
                ...payment.paymentData,
                ...await this._braintreePaymentProcessor.tokenizeHostedForm(billingAddress),
            }),
        };
    }

    private _mapToNonceInstrument(instrument: PaymentInstrument): NonceInstrument {
        return pick(instrument as NonceInstrument, 'nonce', 'shouldSaveInstrument', 'shouldSetAsDefaultInstrument');
    }

    private _mapToVaultedInstrumentWithNonceVerification(instrument: PaymentInstrument): VaultedInstrumentWithNonceVerification {
        return pick(instrument as VaultedInstrumentWithNonceVerification, 'nonce', 'instrumentId');
    }

    private _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean {
        if (!methodId) {
            return false;
        }

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isSubmittingWithStoredCard(payment: OrderPaymentRequestBody): boolean {
        return !!(payment.paymentData && isVaultedInstrument(payment.paymentData));
    }

    private _isStoringNewCard(payment: OrderPaymentRequestBody): boolean {
        return !!(payment.paymentData && (payment.paymentData as CreditCardInstrument | NonceInstrument)?.shouldSaveInstrument);
    }

    private _shouldPerform3DSVerification(payment: OrderPaymentRequestBody): boolean {
        return !!(this._is3dsEnabled && !this._isSubmittingWithStoredCard(payment));
    }
}
