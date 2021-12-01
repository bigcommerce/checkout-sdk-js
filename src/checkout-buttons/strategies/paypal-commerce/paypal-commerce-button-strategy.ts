import { FormPoster } from '@bigcommerce/form-poster';
import { includes } from 'lodash';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { PaymentRequestOptions } from '../../../payment';
// eslint-disable-next-line import/no-internal-modules
import PaymentActionCreator from '../../../payment/payment-action-creator';
import { ApproveDataOptions, ButtonsOptions, ClickDataOptions, FundingType, PaypalCommerceInitializationData, PaypalCommercePaymentProcessor, PaypalCommerceScriptParams } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _isCredit?: boolean;
    private _onShippingChangeData?: any;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _orderActionCreator?: OrderActionCreator,
        private _paymentActionCreator?: PaymentActionCreator
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        let state = this._store.getState();
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        console.log('Options', options, state);

        if (!initializationData.clientId) {
            throw new InvalidArgumentError();
        }

        state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCartOrThrow();
        const buttonParams: ButtonsOptions = {
            onApprove: data => this._tokenizePayment(data),
            onClick: data => this._handleClickButtonProvider(data),
            onShippingChange: data => this._onShippingChangeData = data,
        };

        if (options.paypalCommerce && options.paypalCommerce.style) {
            buttonParams.style = options.paypalCommerce.style;
        }

        const messagingContainer = options.paypalCommerce?.messagingContainer;
        const isMessagesAvailable = Boolean(messagingContainer && document.getElementById(messagingContainer));

        const paypal = await this._paypalCommercePaymentProcessor.initialize(this._getParamsScript(initializationData, cart));
        console.log('PAYPAL', paypal);

        this._paypalCommercePaymentProcessor.renderButtons(cart.id, `#${options.containerId}`, buttonParams);

        if (isMessagesAvailable) {
            this._paypalCommercePaymentProcessor.renderMessages(cart.cartAmount, `#${messagingContainer}`);
        }

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        this._isCredit = undefined;

        return Promise.resolve();
    }

    private _handleClickButtonProvider({ fundingSource }: ClickDataOptions): void {
        this._isCredit = fundingSource === 'credit' || fundingSource === 'paylater';
    }

    private async _tokenizePayment({ orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        if (this._orderActionCreator && this._paymentActionCreator) {
            const paymentData =  {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: 'paypalcommerce',
                    paypal_account: {
                        order_id: orderID,
                    },
                },
            };
            this._onShippingChangeData.orderId = orderID;
            const options = {
                methodId: 'paypalcommerce',
            };

            // const checkout = await PayPalCheckout.request(
            //     'POST',
            //     PayPalCheckout.CHECKOUT_ENDPOINT + '/checkouts/' + PayPalCheckout.cart.id + '/consignments?include=consignments.availableShippingOptions',
            //     payload
            // );

            // this._paypalCommercePaymentProcessor.getShippingOptions()

            await this._store.dispatch(this._orderActionCreator.submitOrder({}, options as PaymentRequestOptions, this._onShippingChangeData));

            await this._store.dispatch(this._paymentActionCreator.submitPayment({ ...{methodId: 'paypalcommerce', paymentData: {shouldCreateAccount: true, shouldSaveInstrument: false, terms: false}}, paymentData }));

            return;
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: this._isCredit ? 'paypalcommercecredit' : 'paypalcommerce',
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
