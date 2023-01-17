import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import isHostedInstrumentLike from '../../is-hosted-intrument-like';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { HostedInstrument, PaymentInstrument, VaultedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    PaypalCommerceCreditCardPaymentInitializeOptions,
    PaypalCommerceHostedForm,
    PaypalCommercePaymentInitializeOptions,
} from './index';

export default class PaypalCommerceCreditCardPaymentStrategy implements PaymentStrategy {
    private executionPaymentData: PaymentInstrument | undefined;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paypalCommerceHostedForm: PaypalCommerceHostedForm,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
    ) {}

    async initialize({
        methodId,
        paypalcommerce,
    }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!paypalcommerce || !this._isPaypalCommerceOptionsPayments(paypalcommerce)) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.paypalcommerce.form" argument is not provided.',
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const cart = state.cart.getCartOrThrow();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        await this._paypalCommerceHostedForm.initialize(
            paypalcommerce.form,
            cart,
            paymentMethod,
            this._getInstrumentParams.bind(this),
        );

        return this._store.getState();
    }

    async execute(
        payload: OrderRequestBody,
        options: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this._paypalCommerceHostedForm.validate();

        this.executionPaymentData = payload.payment?.paymentData;

        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId),
        );
        const { orderId } = await this._paypalCommerceHostedForm.submit(
            getPaymentMethodOrThrow(payment.methodId).config.is3dsEnabled,
        );

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const paymentData = {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        return this._store.dispatch(
            this._paymentActionCreator.submitPayment({ ...payment, paymentData }),
        );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paypalCommerceHostedForm.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _getInstrumentParams(): HostedInstrument | VaultedInstrument {
        if (!this.executionPaymentData) {
            return {};
        }

        if (isHostedInstrumentLike(this.executionPaymentData)) {
            const { shouldSaveInstrument, shouldSetAsDefaultInstrument } =
                this.executionPaymentData;

            return {
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument,
            };
        }

        if (isVaultedInstrument(this.executionPaymentData)) {
            const { instrumentId } = this.executionPaymentData;

            return {
                instrumentId,
            };
        }

        return {};
    }

    private _isPaypalCommerceOptionsPayments(
        options:
            | PaypalCommercePaymentInitializeOptions
            | PaypalCommerceCreditCardPaymentInitializeOptions,
    ): options is PaypalCommerceCreditCardPaymentInitializeOptions {
        return !!(options as PaypalCommerceCreditCardPaymentInitializeOptions).form;
    }
}
