import { LoadingIndicator } from '@bigcommerce/checkout-sdk/ui';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, TimeoutError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodInvalidError } from '../../errors';
import { PaymentStrategyType } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    ApproveCallbackPayload,
    ButtonsOptions,
    NON_INSTANT_PAYMENT_METHODS,
    PaypalCommerceCreditCardPaymentInitializeOptions,
    PaypalCommerceFundingKeyResolver,
    PaypalCommercePaymentInitializeOptions,
    PaypalCommercePaymentProcessor,
    PaypalCommerceRequestSender,
} from './index';

const ORDER_STATUS_APPROVED = 'APPROVED';
const ORDER_STATUS_CREATED = 'CREATED';
const PAYER_ACTION_REQUIRED = 'PAYER_ACTION_REQUIRED';
const POLLING_INTERVAL = 3000;
const POLLING_MAX_TIME = 600000;

export default class PaypalCommercePaymentStrategy implements PaymentStrategy {
    private _orderId?: string;
    private _isAPM?: boolean;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _paypalCommerceFundingKeyResolver: PaypalCommerceFundingKeyResolver,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender,
        private _loadingIndicator: LoadingIndicator,
        private _pollingInterval?: number,
        private _pollingTimer = 0,
    ) {}

    async initialize({
        gatewayId,
        methodId,
        paypalcommerce,
    }: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();

        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId, gatewayId);
        const { initializationData } = paymentMethod;
        const { orderId, buttonStyle, shouldRenderFields } = initializationData ?? {};

        // TODO: this is a part of PayPal APMs payment strategy
        this._isAPM = gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS;

        // We should not to render PayPal smart payment button for cases when the customer:
        // 1) Automatically redirected to the checkout page after clicking on PayPal Smart Payment Button on PDP or Cart page;
        // 2) Started working with PayPal payment button but canceled it to update cart or whatever
        // Backend returns order id if it is available in checkout session. Therefore, it is not necessary to render PayPal button
        if (orderId) {
            this._orderId = orderId;

            return this._store.getState();
        }

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce" argument is not provided.',
            );
        }

        if (!this._isPaypalCommerceOptionsPayments(paypalcommerce)) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommerce" argument should contain "container", "onRenderButton", "submitForm".',
            );
        }

        const {
            container,
            apmFieldsContainer,
            apmFieldsStyles,
            onRenderButton,
            submitForm,
            onValidate,
        } = paypalcommerce;

        const cart = state.cart.getCartOrThrow();
        const cartId = cart.id;
        const currencyCode = cart.currency.code;
        const { firstName, lastName, email } = state.billingAddress.getBillingAddressOrThrow();

        // TODO: should double check the container id
        const loadingIndicatorContainerId = container.split('#')[1];

        const buttonParams: ButtonsOptions = {
            style: buttonStyle,
            onApprove: (data) => {

                // TODO: this is a part of PayPal APMs payment strategy
                this._deinitializePollingTimer(gatewayId);

                this._tokenizePayment(data, submitForm);

                // TODO: should it still be here? Yes, because it showed up after smart payment button click
                this._loadingIndicator.hide();
            },
            onClick: async (_, actions) => {
                // TODO: this is a part of PayPal APMs payment strategy
                // Полінг механізм потрібен для відслідковування статусу пеймента
                this._initializePollingMechanism(submitForm, gatewayId, methodId, paypalcommerce);

                const onValidationPassed = () => {
                    this._loadingIndicator.show(loadingIndicatorContainerId);

                    return actions.resolve();
                };

                return onValidate(onValidationPassed, actions.reject);
            },
            onCancel: () => {
                // TODO: this is a part of PayPal APMs payment strategy
                this._deinitializePollingTimer(gatewayId);
                this._loadingIndicator.hide();
            },
            onError: (e: Error) => {
                // TODO: this is a part of PayPal APMs payment strategy
                this._deinitializePollingTimer(gatewayId);
                this._loadingIndicator.hide();

                paypalcommerce.onError?.(e);
            },
        };

        // TODO: we don't need this method anymore
        await this._paypalCommercePaymentProcessor.initialize(paymentMethod, currencyCode);

        // TODO:
        // Question: Do we really need paypalCommerceFundingKeyResolver?
        // Is there any chance to make it work without extra class?
        const fundingKey = this._paypalCommerceFundingKeyResolver.resolve(methodId, gatewayId);

        // TODO: this is a part of PayPal APMs payment strategy
        if (this._isAPM && shouldRenderFields) {
            const fullName = `${firstName} ${lastName}`;

            if (!apmFieldsContainer) {
                throw new InvalidArgumentError(
                    'Unable to initialize payment because "options.paypalcommerce" argument should contain "apmFieldsContainer".',
                );
            }

            this._paypalCommercePaymentProcessor.renderFields({
                apmFieldsContainer,
                fundingKey,
                apmFieldsStyles,
                fullName,
                email,
            });
        }

        // This one should be done in all payment strategies
        // but not as a method of payment processor, but like another method for that
        this._paypalCommercePaymentProcessor.renderButtons(cartId, container, buttonParams, {
            onRenderButton,
            fundingKey,
            paramsForProvider: { isCheckout: true },
        });

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

        if (!this._orderId) {
            throw new PaymentMethodInvalidError();
        }

        // TODO: this is a part of PayPal APMs payment strategy
        // Не моментальні пеймент методи
        if (NON_INSTANT_PAYMENT_METHODS.indexOf(options.methodId) === -1) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        }

        const paymentData = {
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

        return this._store.dispatch(
            this._paymentActionCreator.submitPayment({ ...payment, paymentData }),
        );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize({ gatewayId }: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        // TODO: this is a part of PayPal APMs payment strategy
        this._deinitializePollingTimer(gatewayId);
        this._orderId = undefined;
        this._paypalCommercePaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    // TODO: this is a part of PayPal APMs payment strategy
    private _initializePollingMechanism(
        submitForm: () => void,
        gatewayId?: string,
        methodId?: any,
        paypalcommerce?: any,
    ) {
        if (!this._isAPM || NON_INSTANT_PAYMENT_METHODS.indexOf(methodId) > -1) {
            this._loadingIndicator.hide();

            return;
        }

        this._pollingInterval = window.setTimeout(async () => {
            try {
                this._pollingTimer += POLLING_INTERVAL;

                const { status } = await this._paypalCommerceRequestSender.getOrderStatus();

                if (status === ORDER_STATUS_APPROVED) {
                    this._deinitializePollingTimer(gatewayId);
                    this._tokenizePayment(
                        { orderID: this._paypalCommercePaymentProcessor.getOrderId() },
                        submitForm,
                    );
                } else if (
                    (status === ORDER_STATUS_CREATED || status === PAYER_ACTION_REQUIRED) &&
                    this._pollingTimer < POLLING_MAX_TIME
                ) {
                    this._initializePollingMechanism(
                        submitForm,
                        gatewayId,
                        methodId,
                        paypalcommerce,
                    );
                } else {
                    this._reinitializeButtons({ gatewayId, methodId, paypalcommerce });
                    this._loadingIndicator.hide();
                    throw new TimeoutError();
                }
            } catch (e) {
                this._deinitializePollingTimer(gatewayId);
                paypalcommerce.onError?.(e);
            }
        }, POLLING_INTERVAL);
    }

    // TODO: this is a part of PayPal APMs payment strategy
    private _reinitializeButtons({
        gatewayId,
        methodId,
        paypalcommerce,
    }: PaymentInitializeOptions) {
        this.deinitialize({ methodId, gatewayId });
        this.initialize({ gatewayId, methodId, paypalcommerce });
    }

    // TODO: this is a part of PayPal APMs payment strategy
    private _deinitializePollingTimer(gatewayId?: string) {
        if (gatewayId === PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS) {
            clearTimeout(this._pollingInterval);
            this._pollingTimer = 0;
        }
    }

    // TODO: this method should be removed when the APMs and other methods will have different strategies
    private _isPaypalCommerceOptionsPayments(
        options:
            | PaypalCommercePaymentInitializeOptions
            | PaypalCommerceCreditCardPaymentInitializeOptions,
    ): options is PaypalCommercePaymentInitializeOptions {
        return !!(options as PaypalCommercePaymentInitializeOptions).container;
    }

    // TODO: ?. Why do we need to contain this order id in a global variable?
    private _tokenizePayment({ orderID }: ApproveCallbackPayload, submitForm: () => void) {
        this._orderId = orderID;
        submitForm();
    }
}
