import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { ApproveDataOptions, ButtonsOptions, PaypalCommerceInitializationData, PaypalCommercePaymentProcessor, PaypalCommerceScriptOptions } from './index';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;
    private _paymentMethod?: PaymentMethod;
    private _isPaypalButton: boolean = false;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _credit: boolean = false
    ) {}

    async initialize({ methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData } = this._paymentMethod;

        if (initializationData.orderId) {
            this._orderId = initializationData.orderId;

            return this._store.getState();
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument is not provided.');
        }

        const { container, submitForm, style } = paypalcommerce;

        if (!container) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce.container" argument is not provided.');
        } else if (!submitForm) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce.submitForm" argument is not provided.');
        }

        this._isPaypalButton = true;
        const cart = state.cart.getCartOrThrow();

        const paramsScript = { options: this._getOptionsScript(initializationData, cart) };
        const buttonParams: ButtonsOptions = { style, onApprove: data => this._tokenizePayment(data, submitForm) };

        await this._paypalCommercePaymentProcessor.initialize(paramsScript);

        await this._store.dispatch(this._paymentStrategyActionCreator.enableEmbeddedSubmitButton(methodId));

        this._paypalCommercePaymentProcessor.renderButtons(cart.id, container, buttonParams, {
            fundingKey: this._credit ? 'CREDIT' : 'PAYPAL',
            paramsForProvider: { isCheckout: true },
        });

        return this._store.getState();
    }

    async execute(payload: OrderRequestBody, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._orderId) {
            throw new PaymentMethodInvalidError();
        }

        const paymentData =  {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                paypal_account: {
                    order_id: this._orderId,
                },
            },
        };

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        return this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._isPaypalButton) {
            if (!this._paymentMethod) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            await this._store.dispatch(this._paymentStrategyActionCreator.disableEmbeddedSubmitButton(this._paymentMethod.id));
        }

        this._paymentMethod = undefined;
        this._orderId = undefined;
        this._isPaypalButton = false;

        return Promise.resolve(this._store.getState());
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions, submitForm: () => void) {
        this._orderId = orderID;
        submitForm();
    }

    private _getOptionsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptOptions {
        const { clientId, intent, merchantId } = initializationData;

        return {
            clientId,
            merchantId,
            commit: true,
            currency: cart.currency.code,
            intent,
        };
    }
}
