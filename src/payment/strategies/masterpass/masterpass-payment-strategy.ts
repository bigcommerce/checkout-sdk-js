import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import getCallbackUrl from './get-callback-url';
import { Masterpass, MasterpassCheckoutOptions } from './masterpass';
import MasterpassScriptLoader from './masterpass-script-loader';

export default class MasterpassPaymentStrategy implements PaymentStrategy {
    private _masterpassClient?: Masterpass;
    private _paymentMethod?: PaymentMethod;
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        this._paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(methodId);

        if (!this._paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._masterpassScriptLoader.load(this._paymentMethod.config.testMode)
            .then(masterpass => {
                this._masterpassClient = masterpass;

                if (!options.masterpass) {
                    throw new InvalidArgumentError('Unable to initialize payment because "options.masterpass" argument is not provided.');
                }

                const walletButton  = options.masterpass.walletButton && document.getElementById(options.masterpass.walletButton);

                if (walletButton) {
                    this._walletButton = walletButton;
                    this._walletButton.addEventListener('click', this._handleWalletButtonClick);
                }

                return this._store.getState();
            });
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        if (this._walletButton) {
            this._walletButton.removeEventListener('click', this._handleWalletButtonClick);
        }

        this._walletButton = undefined;
        this._masterpassClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;
        const order = { useStoreCredit: payload.useStoreCredit };

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData || !this._paymentMethod.initializationData.gateway) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        // TODO: Refactor the API endpoint to return nonce in the right place.
        const paymentData = this._paymentMethod.initializationData.paymentData;

        // TODO: Redirect to Masterpass if nonce has not been generated yet. And then finalise the order when the shopper is redirected back to the checkout page.
        if (!paymentData) {
            throw new InvalidArgumentError('Unable to proceed because "paymentMethod.initializationData.paymentData" argument is not provided.');
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData })));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _createMasterpassPayload(): MasterpassCheckoutOptions {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();
        const storeConfig = state.config.getStoreConfig();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return {
            checkoutId: this._paymentMethod.initializationData.checkoutId,
            allowedCardTypes: this._paymentMethod.initializationData.allowedCardTypes,
            amount: checkout.subtotal.toFixed(2),
            currency: storeConfig.currency.code,
            cartId: checkout.cart.id,
            suppressShippingAddress: false,
            callbackUrl: getCallbackUrl('checkout'),
        };
    }

    @bind
    private _handleWalletButtonClick(event: Event) {
        event.preventDefault();

        if (!this._masterpassClient) {
            return;
        }

        const payload = this._createMasterpassPayload();
        this._masterpassClient.checkout(payload);
    }
}
