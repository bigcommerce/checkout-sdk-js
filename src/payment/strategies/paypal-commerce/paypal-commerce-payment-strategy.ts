import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { ApproveDataOptions, ButtonsOptions, PaypalCommerceCreditCardPaymentInitializeOptions, PaypalCommerceInitializationData, PaypalCommercePaymentInitializeOptions, PaypalCommercePaymentProcessor, PaypalCommerceScriptParams } from './index';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _credit: boolean = false
    ) {}

    async initialize({ methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { paymentMethods: { getPaymentMethodOrThrow }, cart: { getCartOrThrow } } = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const { initializationData } = getPaymentMethodOrThrow(methodId);

        if (initializationData.orderId) {
            this._orderId = initializationData.orderId;

            return this._store.getState();
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument is not provided.');
        }

        if (!this._isPaypalCommerceOptionsPayments(paypalcommerce)) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument should contain "container", "onRenderButton", "submitForm".');
        }

        const { container, onRenderButton, submitForm, style } = paypalcommerce;
        const { id: cartId, currency: { code: currencyCode } } = getCartOrThrow();

        const paramsScript = this._getOptionsScript(initializationData, currencyCode);
        const buttonParams: ButtonsOptions = { style, onApprove: data => this._tokenizePayment(data, submitForm) };

        await this._paypalCommercePaymentProcessor.initialize(paramsScript);

        this._paypalCommercePaymentProcessor.renderButtons(cartId, container, buttonParams, {
            onRenderButton,
            fundingKey: this._credit ? 'PAYLATER' : 'PAYPAL',
            paramsForProvider: {isCheckout: true},
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
        this._orderId = undefined;
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _isPaypalCommerceOptionsPayments(options: PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions): options is PaypalCommercePaymentInitializeOptions {
        return !!(options as PaypalCommercePaymentInitializeOptions).container;
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions, submitForm: () => void) {
        this._orderId = orderID;
        submitForm();
    }

    private _getOptionsScript(initializationData: PaypalCommerceInitializationData, currencyCode: Cart['currency']['code']): PaypalCommerceScriptParams {
        const { clientId, intent, merchantId } = initializationData;

        return {
            'client-id': clientId,
            'merchant-id': merchantId,
            commit: true,
            currency: currencyCode,
            intent,
        };
    }
}
