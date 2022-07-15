import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ApproveDataOptions, ButtonsOptions, ClickDataOptions, PaypalCommercePaymentProcessor } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _isCredit?: boolean;
    private _isVenmo?: boolean;
    private _isVenmoEnabled?: boolean;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        let state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { initializationData } = paymentMethod;

        if (!initializationData.clientId) {
            throw new InvalidArgumentError();
        }

        this._isVenmoEnabled = initializationData.isVenmoEnabled;
        state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCartOrThrow();
        const buttonParams: ButtonsOptions = {
            onApprove: data => this._tokenizePayment(data),
            onClick: data => this._handleClickButtonProvider(data),
        };

        if (options.paypalCommerce && options.paypalCommerce.style) {
            buttonParams.style = options.paypalCommerce.style;
        }

        const messagingContainer = options.paypalCommerce?.messagingContainer;
        const isMessagesAvailable = Boolean(messagingContainer && document.getElementById(messagingContainer));

        await this._paypalCommercePaymentProcessor.initialize(paymentMethod, cart.currency.code, false);

        this._paypalCommercePaymentProcessor.renderButtons(cart.id, `#${options.containerId}`, buttonParams);

        if (isMessagesAvailable) {
            this._paypalCommercePaymentProcessor.renderMessages(cart.cartAmount, `#${messagingContainer}`);
        }

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        this._isCredit = undefined;
        this._isVenmo = undefined;

        return Promise.resolve();
    }

    private _handleClickButtonProvider({ fundingSource }: ClickDataOptions): void {
        this._isCredit = fundingSource === 'credit' || fundingSource === 'paylater';
        this._isVenmo = fundingSource === 'venmo';
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }
        let provider;

        if (this._isVenmo && this._isVenmoEnabled) {
            provider = 'paypalcommercevenmo';
        } else if (this._isCredit) {
            provider = 'paypalcommercecredit';
        } else {
            provider = 'paypalcommerce';
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider,
            order_id: orderID,
        });
    }
}
