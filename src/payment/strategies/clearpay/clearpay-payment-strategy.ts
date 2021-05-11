import { CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import ClearpayScriptLoader from './clearpay-script-loader';
import ClearpaySdk from './clearpay-sdk';

export default class ClearpayPaymentStrategy implements PaymentStrategy {
    private _clearpaySdk?: ClearpaySdk;

    constructor(
        private _store: CheckoutStore,
        private _checkoutValidator: CheckoutValidator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _clearpayScriptLoader: ClearpayScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(options.methodId, options.gatewayId);

        this._clearpaySdk = await this._clearpayScriptLoader.load(paymentMethod);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._clearpaySdk = undefined;

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }
        const { gatewayId, methodId } = payload.payment;

        if (!gatewayId || !methodId) {
            throw new PaymentArgumentInvalidError(['payment.gatewayId', 'payment.methodId']);
        }

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();
        let state = this._store.getState();

        if (useStoreCredit !== undefined) {
            state = await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

         // Validate nothing has changed before redirecting to Clearpay checkout page
        await this._checkoutValidator.validate(state.checkout.getCheckout(), options);

        const { countryCode } = this._store.getState().billingAddress.getBillingAddressOrThrow();
        if (!this._validateBillingAddress(countryCode)) {
            throw new InvalidArgumentError('Unable to proceed because billing country is not supported.');
        }

        state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(`${gatewayId}?method=${methodId}`)
        );

        await this._redirectToClearpay(countryCode, state.paymentMethods.getPaymentMethod(methodId));

        // Clearpay will handle the rest of the flow so return a promise that doesn't really resolve
        return new Promise(() => {});
    }

    async finalize(options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();
        const config = state.config.getContextConfig();

        if (!payment) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!config || !config.payment.token) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const paymentPayload = {
            methodId: payment.providerId,
            paymentData: { nonce: config.payment.token },
        };

        await this._store.dispatch(this._orderActionCreator.submitOrder({}, options));

        return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
    }

    private _redirectToClearpay(countryCode: string, paymentMethod?: PaymentMethod): void {
        if (!this._clearpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._clearpaySdk.initialize({countryCode});
        this._clearpaySdk.redirect({ token: paymentMethod.clientToken });
    }

    private _validateBillingAddress( countryCode: string): boolean {
        return countryCode === 'GB';
    }
}
