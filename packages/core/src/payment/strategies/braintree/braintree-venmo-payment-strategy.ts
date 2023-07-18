import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import Payment, { FormattedPayload, PaypalInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BraintreeError, BraintreeTokenizePayload, BraintreeVenmoCheckout } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import isBraintreeError from './is-braintree-error';

export default class BraintreeVenmoPaymentStrategy implements PaymentStrategy {
    private _braintreeVenmoCheckout?: BraintreeVenmoCheckout;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );

        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        await this._initializeBraintreeVenmo(paymentMethod);

        return this._store.getState();
    }

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        try {
            const paymentData = await this._preparePaymentData(payment);

            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment(paymentData),
            );
        } catch (error) {
            this._handleError(error);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        await this._braintreePaymentProcessor.deinitialize();

        return this._store.getState();
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

    private async _initializeBraintreeVenmo(paymentMethod: PaymentMethod): Promise<void> {
        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(clientToken, initializationData);
            this._braintreeVenmoCheckout = await this._braintreePaymentProcessor.getVenmoCheckout();
        } catch (error) {
            this._handleError(error);
        }
    }

    private async _preparePaymentData(payment: OrderPaymentRequestBody): Promise<Payment> {
        const { nonce } = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(payment.methodId);

        if (nonce) {
            return { ...payment, paymentData: this._formattedPayload(nonce) };
        }

        const tokenizeResult = await this._braintreeVenmoTokenize();
        const sessionId = await this._braintreePaymentProcessor.getSessionId();

        return {
            ...payment,
            paymentData: this._formattedPayload(
                tokenizeResult.nonce,
                tokenizeResult.details.email,
                sessionId,
            ),
        };
    }

    private _formattedPayload(
        token: string,
        email?: string,
        sessionId?: string,
    ): FormattedPayload<PaypalInstrument> {
        return {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: sessionId || null,
                paypal_account: {
                    token,
                    email: email || null,
                },
            },
        };
    }

    private _braintreeVenmoTokenize(): Promise<BraintreeTokenizePayload> {
        return new Promise((resolve, reject) => {
            this._braintreeVenmoCheckout?.tokenize(
                (error: BraintreeError, payload: BraintreeTokenizePayload) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(payload);
                },
            );
        });
    }
}
