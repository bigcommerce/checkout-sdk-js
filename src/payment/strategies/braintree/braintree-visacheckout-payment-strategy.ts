import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentMethodFailedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import BraintreeVisaCheckoutPaymentProcessor from './braintree-visacheckout-payment-processor';
import { VisaCheckoutPaymentSuccessPayload } from './visacheckout';
import VisaCheckoutScriptLoader from './visacheckout-script-loader';

export default class BraintreeVisaCheckoutPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor,
        private _visaCheckoutScriptLoader: VisaCheckoutScriptLoader
    ) {}

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
                    visaCheckout.on('payment.error', (_, error) => onError(error));
                });
            })
            .then(() => this._store.getState());
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

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return this._braintreeVisaCheckoutPaymentProcessor.deinitialize()
            .then(() => this._store.getState());
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
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }
}
