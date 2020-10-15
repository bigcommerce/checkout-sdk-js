import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { PaypalCommerceCreditCardPaymentInitializeOptions, PaypalCommerceHostedForm, PaypalCommerceInitializationData, PaypalCommercePaymentInitializeOptions, PaypalCommerceScriptParams } from './index';

export default class PaypalCommerceCreditCardPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paypalCommerceHostedForm: PaypalCommerceHostedForm,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize({ methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!paypalcommerce || !this._isPaypalCommerceOptionsPayments(paypalcommerce)) {
            throw new InvalidArgumentError('Unable to proceed because "options.paypalcommerce.form" argument is not provided.');
        }

        const { paymentMethods: { getPaymentMethodOrThrow }, cart: { getCartOrThrow } } = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const { clientToken, initializationData } = getPaymentMethodOrThrow(methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { id: cartId, currency: { code: currencyCode } } = getCartOrThrow();
        const paramsScript = this._getOptionsScript(initializationData, currencyCode, clientToken);

        await this._paypalCommerceHostedForm.initialize(paypalcommerce.form, cartId, paramsScript);

        return this._store.getState();
    }

    async execute(payload: OrderRequestBody, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        this._paypalCommerceHostedForm.validate();

        const { paymentMethods: { getPaymentMethodOrThrow } } = await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        const { orderId } = await this._paypalCommerceHostedForm.submit(getPaymentMethodOrThrow(payment.methodId).config.is3dsEnabled);

        const paymentData =  {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        return this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paypalCommerceHostedForm.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _isPaypalCommerceOptionsPayments(options: PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions): options is PaypalCommerceCreditCardPaymentInitializeOptions {
        return !!(options as PaypalCommerceCreditCardPaymentInitializeOptions).form;
    }

    private _getOptionsScript(initializationData: PaypalCommerceInitializationData, currencyCode: Cart['currency']['code'], clientToken: string): PaypalCommerceScriptParams {
        const { clientId, intent, merchantId } = initializationData;

        return {
            'client-id': clientId,
            'merchant-id': merchantId,
            'data-client-token': clientToken,
            components: ['hosted-fields'],
            commit: true,
            currency: currencyCode,
            intent,
        };
    }
}
