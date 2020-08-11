import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { DisableFundingType, PaypalCommerceHostedForm, PaypalCommerceInitializationData, PaypalCommerceScriptLoader, PaypalCommerceScriptOptions } from './index';

export default class PaypalCommerceCreditCardPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paypalCommerceHostedForm: PaypalCommerceHostedForm,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId));
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        const cart = state.cart.getCartOrThrow();
        const paramsScript = {
            options: this._getOptionsScript(initializationData, cart),
            attr: { clientToken: initializationData.clientToken },
        };

        const paypal = await this._paypalScriptLoader.loadPaypalCommerce(paramsScript, true);

        if (options.paypalcommerce?.form) {
            await this._paypalCommerceHostedForm.initialize(options.paypalcommerce.form, cart.id, paypal);
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const { orderId } = await this._paypalCommerceHostedForm.submit();

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
        return Promise.resolve(this._store.getState());
    }

    private _getOptionsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptOptions {
        const { clientId, intent, isPayPalCreditAvailable, merchantId } = initializationData;
        const disableFunding: DisableFundingType = [ 'card' ];

        if (!isPayPalCreditAvailable) {
            disableFunding.push('credit');
        }

        return {
            clientId,
            components: ['hosted-fields'],
            merchantId,
            currency: cart.currency.code,
            intent,
        };
    }
}
