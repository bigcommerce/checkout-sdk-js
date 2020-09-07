import { FormPoster } from '@bigcommerce/form-poster';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import PaymentStrategyType from '../../../payment/payment-strategy-type';
import { validateStyleParams, ApproveDataOptions, ButtonsOptions, ClickDataOptions, DisableFundingType, PaypalCommerceInitializationData, PaypalCommerceRequestSender, PaypalCommerceScriptLoader, PaypalCommerceScriptOptions } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _isCredit?: boolean;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paypalScriptLoader: PaypalCommerceScriptLoader,
        private _formPoster: FormPoster,
        private _paypalCommerceRequestSender: PaypalCommerceRequestSender
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        let state = this._store.getState();
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!initializationData.clientId) {
            throw new InvalidArgumentError();
        }

        state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCartOrThrow();
        const paypalOptions = options.paypalCommerce;

        const buttonParams: ButtonsOptions = {
            onClick: data => this._handleClickButtonProvider(data),
            createOrder: () => this._setupPayment(cart.id),
            onApprove: data => this._tokenizePayment(data),
        };

        if (paypalOptions && paypalOptions.style) {
            buttonParams.style = validateStyleParams(paypalOptions.style);
        }

        const paramsScript = this._getParamsScript(initializationData, cart);
        const paypal = await this._paypalScriptLoader.loadPaypalCommerce({ options: paramsScript }, initializationData.isProgressiveOnboardingAvailable);

        return paypal.Buttons(buttonParams).render(`#${options.containerId}`);
    }

    deinitialize(): Promise<void> {
        this._isCredit = undefined;

        return Promise.resolve();
    }

    private _handleClickButtonProvider({ fundingSource }: ClickDataOptions): void {
        this._isCredit = fundingSource === 'credit';
    }

    private async _setupPayment(cartId: string): Promise<string> {
        const { orderId } = await this._paypalCommerceRequestSender.setupPayment(cartId, { isCredit: this._isCredit });

        return orderId;
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: this._isCredit ? PaymentStrategyType.PAYPAL_COMMERCE_CREDIT : PaymentStrategyType.PAYPAL_COMMERCE,
            order_id: orderID,
        });
    }

    private _getParamsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptOptions {
        const { clientId, intent, isPayPalCreditAvailable, merchantId } = initializationData;
        const disableFunding: DisableFundingType = [ 'card' ];

        if (!isPayPalCreditAvailable) {
            disableFunding.push('credit');
        }

        return {
            clientId,
            merchantId,
            commit: false,
            currency: cart.currency.code,
            disableFunding,
            intent,
        };
    }
}
