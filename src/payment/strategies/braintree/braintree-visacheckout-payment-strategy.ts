import {
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentRequestOptions,
    PaymentStrategyActionCreator,
} from '../..';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, StandardError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentStrategy from '../payment-strategy';

import { BraintreeVisaCheckoutPaymentProcessor, VisaCheckoutScriptLoader } from '.';
import { VisaCheckoutPaymentSuccessPayload } from './visacheckout';

export default class BraintreeVisaCheckoutPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor,
        private _visaCheckoutScriptLoader: VisaCheckoutScriptLoader
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreevisacheckout: visaCheckoutOptions, methodId } = options;

        if (!visaCheckoutOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.braintreevisacheckout" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const checkout = state.checkout.getCheckout();
                const storeConfig = state.config.getStoreConfig();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const {
                    onError = () => {},
                    onPaymentSelect = () => {},
                } = visaCheckoutOptions;

                const initOptions = {
                    locale: storeConfig.storeProfile.storeLanguage,
                    collectShipping: false,
                    subtotal: checkout.subtotal,
                    currencyCode: storeConfig.currency.code,
                };

                return Promise.all([
                    this._visaCheckoutScriptLoader.load(this._paymentMethod.config.testMode),
                    this._braintreeVisaCheckoutPaymentProcessor.initialize(this._paymentMethod.clientToken, initOptions),
                ])
                .then(([visaCheckout, visaInitOptions]) => {
                    visaCheckout.init(visaInitOptions);
                    visaCheckout.on('payment.success', (paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) =>
                        this._paymentInstrumentSelected(paymentSuccessPayload)
                            .then(() => onPaymentSelect())
                            .catch(error => onError(error))
                    );
                    visaCheckout.on('payment.error', (payment, error) => onError(error));
                });
            })
            .then(() => super.initialize(options));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData || !this._paymentMethod.initializationData.nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { nonce } = this._paymentMethod.initializationData;

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData: { nonce } }))
            )
            .catch((error: Error) => this._handleError(error));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._braintreeVisaCheckoutPaymentProcessor.deinitialize()
            .then(() => super.deinitialize(options));
    }

    private _paymentInstrumentSelected(paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) {
        const state = this._store.getState();

        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }

        const { id: methodId } = this._paymentMethod;

        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            return this._braintreeVisaCheckoutPaymentProcessor.handleSuccess(
                paymentSuccessPayload,
                state.shippingAddress.getShippingAddress(),
                state.billingAddress.getBillingAddress()
            )
            .then(() => Promise.all([
                this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
            ]));
        }, { methodId }), { queueId: 'widgetInteraction' });
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new StandardError(error.message);
        }

        throw error;
    }
}

/**
 * A set of options that are required to initialize the Visa Checkout payment
 * method provided by Braintree.
 *
 * If the customer chooses to pay with Visa Checkout, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 */
export interface BraintreeVisaCheckoutPaymentInitializeOptions {
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
