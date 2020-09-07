import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { validateStyleParams, ButtonsOptions, PaypalCommerceButtons, PaypalCommerceInitializationData, PaypalCommercePaymentInitializeOptions, PaypalCommerceRequestSender, PaypalCommerceScriptOptions } from './index';
import PaypalCommerceScriptLoader from './paypal-commerce-script-loader';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;
    private _paymentMethod?: PaymentMethod;
    private _paypalButtons?: PaypalCommerceButtons;
    private _isPaypalButton: boolean = false;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _credit: boolean = false
    ) {}

    async initialize({ methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        this._paymentMethod = paymentMethod;

        if (paymentMethod.initializationData.orderId) {
            this._orderId = paymentMethod.initializationData.orderId;

            return this._store.getState();
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument is not provided.');
        }

        this._isPaypalButton = true;
        const cart = state.cart.getCartOrThrow();
        await this._renderSmartButton(paypalcommerce, cart);

        return this._store.getState();
    }

    async execute(payload: OrderRequestBody, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
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

            if (this._paypalButtons) {
                this._paypalButtons.close();
            }

            await this._store.dispatch(this._paymentStrategyActionCreator.disableEmbeddedSubmitButton(this._paymentMethod.id));
        }

        this._paymentMethod = undefined;
        this._orderId = undefined;
        this._paypalButtons = undefined;
        this._isPaypalButton = false;

        return Promise.resolve(this._store.getState());
    }

     private async _renderSmartButton({ container, submitForm, style }: PaypalCommercePaymentInitializeOptions, cart: Cart): Promise<void> {
        if (!this._paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!container) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce.container" argument is not provided.');
        }
        if (!submitForm) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce.submitForm" argument is not provided.');
        }

        const { initializationData, id: methodId } = this._paymentMethod;
        const paramsScript = { options: this._getOptionsScript(initializationData, cart) };
        const paypal = await this._paypalScriptLoader.loadPaypalCommerce(paramsScript, true);

        const buttonParams: ButtonsOptions = {
            fundingSource: this._credit ? paypal.FUNDING.CREDIT : paypal.FUNDING.PAYPAL,
            createOrder: () => this._setupPayment(cart.id),
            onApprove: () => submitForm(),
        };

        if (style) {
            buttonParams.style = validateStyleParams(style);
        }

        await this._store.dispatch(this._paymentStrategyActionCreator.enableEmbeddedSubmitButton(methodId));

        this._paypalButtons = paypal.Buttons(buttonParams);

        if (this._credit && !this._paypalButtons.isEligible()) {
            throw new NotImplementedError('PayPal Credit is not available for your region. Please use PayPal Checkout instead.');
        }

        return this._paypalButtons.render(container);
    }

    private async _setupPayment(cartId: string): Promise<string> {
        const { orderId } = await this._paypalCommerceRequestSender.setupPayment(cartId, { isCredit: this._credit, isCheckout: true });
        this._orderId = orderId;

        return orderId;
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
