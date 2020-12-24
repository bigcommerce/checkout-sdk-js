import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import { PaymentStrategyType } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { ApproveDataOptions,
    ButtonsOptions,
    PaypalCommerceCreditCardPaymentInitializeOptions,
    PaypalCommerceFundingKeyResolver,
    PaypalCommerceInitializationData,
    PaypalCommercePaymentInitializeOptions,
    PaypalCommercePaymentProcessor,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptParams } from './index';

const APPROVED = 'approved';

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _paypalCommerceFundingKeyResolver: PaypalCommerceFundingKeyResolver,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _pollingInterval?: any
    ) {}

    async initialize({ gatewayId, methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { paymentMethods: { getPaymentMethodOrThrow }, cart: { getCartOrThrow } } = this._store.getState();
        const { initializationData } = getPaymentMethodOrThrow(methodId, gatewayId);
        const { orderId, buttonStyle } = initializationData;

        if (orderId) {
            this._orderId = orderId;

            return this._store.getState();
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument is not provided.');
        }

        if (!this._isPaypalCommerceOptionsPayments(paypalcommerce)) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.paypalcommerce" argument should contain "container", "onRenderButton", "submitForm".');
        }

        const { container, onRenderButton, submitForm, onValidate } = paypalcommerce;
        const { id: cartId, currency: { code: currencyCode } } = getCartOrThrow();

        const paramsScript = this._getOptionsScript(initializationData, currencyCode);
        const buttonParams: ButtonsOptions = {
            style: buttonStyle,
            onApprove: data => this._tokenizePayment(data, submitForm),
            onClick: async (_, actions) => {
                this.setPollingMechanism(gatewayId, submitForm);

                return  onValidate(actions.resolve, actions.reject);
            },
            onCancel: () => clearInterval(this._pollingInterval),
        };

        await this._paypalCommercePaymentProcessor.initialize(paramsScript);

        this._paypalCommercePaymentProcessor.renderButtons(cartId, container, buttonParams, {
            onRenderButton,
            fundingKey: this._paypalCommerceFundingKeyResolver.resolve(methodId, gatewayId),
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
                method_id: payment.methodId,
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
        clearInterval(this._pollingInterval);
        this._orderId = undefined;
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private setPollingMechanism(gatewayId: string | undefined, submitForm: any) {
        this._pollingInterval = setInterval(async () =>  {
            try {
                if (gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS) {
                    const res = await this._paypalCommerceRequestSender.getOrderStatus();
                    if (res.status.toLowerCase() === APPROVED) {
                        clearInterval(this._pollingInterval);
                        this._tokenizePayment({orderID: this._paypalCommercePaymentProcessor.getOrderId()}, submitForm);
                    }
                }
            } catch (e) {
                clearInterval(this._pollingInterval);
            }
        }, 3000);
    }

    private _isPaypalCommerceOptionsPayments(options: PaypalCommercePaymentInitializeOptions | PaypalCommerceCreditCardPaymentInitializeOptions): options is PaypalCommercePaymentInitializeOptions {
        return !!(options as PaypalCommercePaymentInitializeOptions).container;
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions, submitForm: () => void) {
        this._orderId = orderID;
        submitForm();
    }

    private _getOptionsScript(initializationData: PaypalCommerceInitializationData, currencyCode: Cart['currency']['code']): PaypalCommerceScriptParams {
        const { clientId, intent, merchantId, buyerCountry, isDeveloperModeApplicable } = initializationData;
        const returnObject = {
            'client-id': clientId,
            'merchant-id': merchantId,
            commit: true,
            currency: currencyCode,
            intent,
        };

        return isDeveloperModeApplicable ? { ...returnObject, 'buyer-country': buyerCountry } : returnObject;
    }
}
