import { isHostedInstrumentLike, Payment } from '../..';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { StripeElement, StripeElements, StripeElementsOptions, StripeUPEClient } from './stripe-upe';
import StripeUPEPaymentInitializeOptions from './stripe-upe-initialize-options';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

export default class StripeUPEPaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: StripeUPEPaymentInitializeOptions;
    private _stripeUPEClient?: StripeUPEClient;
    private _stripeElements?: StripeElements;
    private _stripeElement?: StripeElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeUPEScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _locale: string
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { stripeupe, methodId, gatewayId } = options;

        if (!gatewayId) {
            throw new InvalidArgumentError('Unable to initialize payment because "gatewayId" argument is not provided.');
        }

        this._initializeOptions = stripeupe;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(`${gatewayId}?method=${methodId}`));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData: { stripePublishableKey, stripeConnectedAccount } } = paymentMethod;

        this._stripeUPEClient = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);
        this._stripeElement = await this._mountCardFields(paymentMethod.clientToken);

        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        let formattedPayload: { [key: string]: unknown };

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentData, methodId } = payment;
        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(paymentData) ? paymentData : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        const { isStoreCreditApplied : useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        try {
            const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
            const { clientToken } = paymentMethod;
            if (!clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }
            const elements = this._getStripeElements();

            const { paymentIntent, error } = await this._getStripeJs().confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                if (error.type === 'card_error' || error.type === 'invalid_request_error' || error.type === 'validation_error') {
                    throw new Error(error.message);
                }
                throw new RequestError();
            }

            const { id: token } = paymentIntent ??  { id: '' };

            formattedPayload = {
                credit_card_token: { token },
                vault_payment_instrument: shouldSaveInstrument,
                confirm: false,
            };

            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            const paymentPayload = this._buildPaymentPayload(methodId, formattedPayload, shouldSetAsDefaultInstrument);

            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            throw error;
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._unmountElement();

        return Promise.resolve(this._store.getState());
    }

    private _buildPaymentPayload(methodId: string, formattedPayload: { [key: string]: unknown }, shouldSetAsDefaultInstrument: boolean | undefined): Payment {
        const paymentData = shouldSetAsDefaultInstrument
            ? { formattedPayload, shouldSetAsDefaultInstrument }
            : { formattedPayload };

        return { methodId, paymentData };
    }

    private _getInitializeOptions(): StripeUPEPaymentInitializeOptions {
        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._initializeOptions;
    }

    private _getStripeElements(): StripeElements {
        if (!this._stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeElements;
    }

    private _getStripeJs(): StripeUPEClient {
        if (!this._stripeUPEClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeUPEClient;
    }

    private async _loadStripeJs(stripePublishableKey: string, stripeConnectedAccount: string): Promise<StripeUPEClient> {
        if (this._stripeUPEClient) { return Promise.resolve(this._stripeUPEClient); }

        return await this._stripeScriptLoader.load(
            stripePublishableKey,
            stripeConnectedAccount,
            this._locale
        );
    }

    private _mountCardFields(clientToken: string = ''): Promise<StripeElement> {
        const { containerId } = this._getInitializeOptions();

        let stripeElement: StripeElement;

        const elementOptions: StripeElementsOptions = {
            clientSecret: clientToken,
        };

        return new Promise((resolve, reject) => {
            if (!this._stripeElements) {
                this._stripeElements = this._getStripeJs().elements(elementOptions);
            }

            stripeElement = this._stripeElements.getElement('payment') || this._stripeElements.create('payment');
            try {
                stripeElement.mount(`#${containerId}`);
            } catch (error) {
                reject(new InvalidArgumentError('Unable to mount Stripe component without valid container ID.'));
            }

            resolve(stripeElement);
        });
    }

    private _unmountElement(): void {
        if (this._stripeElement) {
            this._stripeElement.unmount();
            this._stripeElement = undefined;
        }
    }
}
