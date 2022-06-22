import { FormPoster } from '@bigcommerce/form-poster';
import { includes } from 'lodash';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { ApproveDataOptions, ButtonsOptions, ClickDataOptions, FundingType, PaypalCommerceInitializationData, PaypalCommercePaymentProcessor, PaypalCommerceScriptParams } from '../../../payment/strategies/paypal-commerce';
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
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

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

        await this._paypalCommercePaymentProcessor.initialize(this._getParamsScript(initializationData, cart), undefined, initializationData.isVenmoEnabled);

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

    private _getParamsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptParams {
        const {
            clientId,
            intent,
            isPayPalCreditAvailable,
            merchantId,
            attributionId,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
            isVenmoEnabled,
        } = initializationData;

        const disableFunding: FundingType = [ 'card' ];
        const enableFunding: FundingType = enabledAlternativePaymentMethods.slice();

        /**
         *  The default value is different depending on the countries,
         *  therefore there's a need to add credit, paylater or APM name to enable/disable funding explicitly
         */
        availableAlternativePaymentMethods.forEach(apm => {
            if (!includes(enabledAlternativePaymentMethods, apm)) {
                disableFunding.push(apm);
            }
        });

        if (isPayPalCreditAvailable) {
            enableFunding.push('credit', 'paylater');
        } else {
            disableFunding.push('credit', 'paylater');
        }

        if (isVenmoEnabled) {
            enableFunding.push('venmo');
        } else if (!enableFunding.includes('venmo')) {
            disableFunding.push('venmo');
        }

        return {
            'client-id': clientId,
            'merchant-id': merchantId,
            commit: false,
            currency: cart.currency.code,
            components: ['buttons', 'messages'],
            'disable-funding': disableFunding,
            ...(enableFunding.length && {'enable-funding': enableFunding}),
            intent,
            'data-partner-attribution-id': attributionId,
        };
    }
}
