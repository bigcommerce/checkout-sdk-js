import { Cart } from '../../../cart';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, TimeoutError } from '../../../common/error/errors';
import { LoadingIndicator } from '../../../common/loading-indicator';
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

const ORDER_STATUS_APPROVED = 'APPROVED';
const ORDER_STATUS_CREATED = 'CREATED';
const POLLING_INTERVAL = 3000;
const POLLING_MAX_TIME = 600000;
const LOADING_INDICATOR_STYLES = {
    backgroundColor: 'black',
};

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;
    private _loadingIndicator?: LoadingIndicator;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _paypalCommerceFundingKeyResolver: PaypalCommerceFundingKeyResolver,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _pollingInterval?: number,
        private _pollingTimer = 0
    ) {}

    async initialize({ gatewayId, methodId, paypalcommerce }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { paymentMethods: { getPaymentMethodOrThrow }, cart: { getCartOrThrow } } = this._store.getState();
        const { initializationData } = getPaymentMethodOrThrow(methodId, gatewayId);
        const { orderId, buttonStyle } = initializationData ?? {};
        this._loadingIndicator = new LoadingIndicator({styles: LOADING_INDICATOR_STYLES});
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
        const loadingIndicatorContainerId = container.split('#')[1];

        const paramsScript = this._getOptionsScript(initializationData, currencyCode);
        const buttonParams: ButtonsOptions = {
            style: buttonStyle,
            onApprove: data => {
                this._deinitializePollingTimer(gatewayId);
                this._tokenizePayment(data, submitForm);
                this._loadingIndicator?.hide();

            },
            onClick: async (_, actions) => {
                this._initializePollingMechanism(submitForm, gatewayId, methodId, paypalcommerce);
                this._loadingIndicator?.show(loadingIndicatorContainerId);

                return onValidate(actions.resolve, actions.reject);
            },
            onCancel: () => {
                this._deinitializePollingTimer(gatewayId);
                this._loadingIndicator?.hide();
            },
            onError: (e: Error) => {
                this._deinitializePollingTimer(gatewayId);
                this._loadingIndicator?.hide();
                paypalcommerce.onError?.(e);
            },
        };

        await this._paypalCommercePaymentProcessor.initialize(paramsScript, undefined, gatewayId);

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

    async deinitialize({gatewayId}: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._deinitializePollingTimer(gatewayId);
        this._orderId = undefined;
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _initializePollingMechanism(submitForm: () => void, gatewayId?: string, methodId?: any, paypalcommerce?: any ) {
        if (gatewayId !== PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS)  {
            this._loadingIndicator?.hide();

            return;
        }

        this._pollingInterval = window.setTimeout(async () => {
            try {
                this._pollingTimer += POLLING_INTERVAL;

                const { status } = await this._paypalCommerceRequestSender.getOrderStatus();

                if (status === ORDER_STATUS_APPROVED) {
                    this._deinitializePollingTimer(gatewayId);
                    this._tokenizePayment({ orderID: this._paypalCommercePaymentProcessor.getOrderId() }, submitForm);
                } else if (status === ORDER_STATUS_CREATED  && this._pollingTimer < POLLING_MAX_TIME) {
                    this._initializePollingMechanism(submitForm, gatewayId, methodId, paypalcommerce);
                } else {
                    this._reinitializeButtons({ gatewayId, methodId, paypalcommerce });
                    this._loadingIndicator?.hide();
                    throw new TimeoutError();
                }
            } catch (e) {
                this._deinitializePollingTimer(gatewayId);
                paypalcommerce.onError?.(e);
            }
        }, POLLING_INTERVAL);
    }

    private _reinitializeButtons({ gatewayId, methodId, paypalcommerce }: PaymentInitializeOptions) {
        this.deinitialize({methodId, gatewayId});
        this.initialize({ gatewayId, methodId, paypalcommerce });
    }

    private _deinitializePollingTimer(gatewayId?: string) {
        if (gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS) {
            clearTimeout(this._pollingInterval);
            this._pollingTimer = 0;
        }
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
