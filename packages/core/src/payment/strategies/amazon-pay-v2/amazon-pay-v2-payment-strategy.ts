import { noop } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getShippableItemsCount } from '../../../shipping';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { AmazonPayV2ChangeActionType, AmazonPayV2PaymentProcessor, AmazonPayV2PayOptions, AmazonPayV2Placement } from '.';

export default class AmazonPayV2PaymentStrategy implements PaymentStrategy {

    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor
    ) { }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, amazonpay } = options;

        if (!methodId || !amazonpay) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazonpay" argument is not provided.');
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);

        const { paymentToken, region } = paymentMethod.initializationData;
        const buttonId = amazonpay.editButtonId;

        if (paymentToken && buttonId) {
            this._bindEditButton(buttonId, paymentToken, 'changePayment', this._isModalFlow(region));
        } else {
            this._walletButton = this._createSignInButton(paymentMethod);
        }

        return this._store.getState();
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        const { paymentToken, region } = paymentMethod.initializationData;

        if (paymentToken) {
            const paymentPayload = {
                methodId,
                paymentData: { nonce: paymentToken },
            };

            await this._store.dispatch(this._orderActionCreator.submitOrder(orderRequest, options));

            try {
                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            } catch (error) {
                if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                    return new Promise(() => {
                        window.location.replace(error.body.additional_action_required.data.redirect_url);
                    });
                }

                throw error;
            }
        }

        if (!this._walletButton) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._walletButton.click();

        // Focus of parent window used to try and detect the user cancelling the Amazon log in modal
        // Should be refactored if/when Amazon add a modal close hook to their SDK
        if (this._isModalFlow(region)) {
            return new Promise((_, reject) => {
                const onFocus = () => {
                    window.removeEventListener('focus', onFocus);
                    reject(new PaymentMethodCancelledError('Shopper needs to login to Amazonpay to continue'));
                };

                window.addEventListener('focus', onFocus);
            });
        }

        return new Promise<never>(noop);
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(_options?: PaymentRequestOptions | undefined): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        await this._amazonPayV2PaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _bindEditButton(id: string, sessionId: string, changeAction: AmazonPayV2ChangeActionType, isModalFlow: boolean): void {
        const button = document.getElementById(id);

        if (!button || !button.parentNode) {
            return;
        }

        if (!isModalFlow) {
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);

            clone.addEventListener('click', () => this._showLoadingSpinner());
        }

        this._amazonPayV2PaymentProcessor.bindButton(id, sessionId, changeAction);
    }

    private _isModalFlow(region: string) {
        return region === 'us';
    }

    private _showLoadingSpinner(): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._paymentStrategyActionCreator.widgetInteraction(() => new Promise(noop)),
            { queueId: 'widgetInteraction' }
        );
    }

    private _createContainer(): HTMLDivElement {
        let container = document.getElementById('AmazonPayButton') as HTMLDivElement;

        if (container) {
            return container;
        }

        container = document.createElement('div');
        container.id = 'AmazonPayButton';
        container.style.display = 'none';

        return document.body.appendChild(container);
    }

    private _createSignInButton(paymentMethod: PaymentMethod): HTMLElement {
        const state = this._store.getState();
        const cart = state.cart.getCart();
        const config = state.config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            config: {
                merchantId,
                testMode,
            },
            initializationData: {
                checkoutLanguage,
                ledgerCurrency,
                checkoutSessionMethod,
                extractAmazonCheckoutSessionId,
            },
        } = paymentMethod;

        if (!merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const amazonButtonOptions = {
            merchantId,
            sandbox: !!testMode,
            checkoutLanguage,
            ledgerCurrency,
            productType: cart && getShippableItemsCount(cart) === 0 ?
                AmazonPayV2PayOptions.PayOnly :
                AmazonPayV2PayOptions.PayAndShip,
            createCheckoutSession: {
                method: checkoutSessionMethod,
                // tslint:disable-next-line: no-string-literal
                url: config.checkoutSettings.features['INT-5826.amazon_relative_url']
                    ? `/remote-checkout/${paymentMethod.id}/payment-session`
                    : `${config.storeProfile.shopPath}/remote-checkout/${paymentMethod.id}/payment-session`,
                extractAmazonCheckoutSessionId,
            },
            placement: AmazonPayV2Placement.Checkout,
        };

        const container = this._createContainer();
        this._amazonPayV2PaymentProcessor.createButton(`#${container.id}`, amazonButtonOptions);

        return container;
    }
}
