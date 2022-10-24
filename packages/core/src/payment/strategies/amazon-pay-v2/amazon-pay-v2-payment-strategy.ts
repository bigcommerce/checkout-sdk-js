import { CheckoutSettings } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { noop } from 'lodash';

import { guard } from '../../../../src/common/utility';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

import { AmazonPayV2ChangeActionType, AmazonPayV2Placement } from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';

export default class AmazonPayV2PaymentStrategy implements PaymentStrategy {

    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor
    ) { }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, amazonpay } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId" argument is not provided.');
        }

        const { features } = this._store.getState().config.getStoreConfigOrThrow().checkoutSettings;
        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);
        const { initializationData: { paymentToken, region } } = paymentMethod;

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);

        if (this._isReadyToPay(features, paymentToken) && amazonpay?.editButtonId) {
            this._bindEditButton(amazonpay.editButtonId, paymentToken, 'changePayment', this._isModalFlow(region));
        } else {
            const { id: containerId } = this._createContainer();

            this._walletButton =
                this._amazonPayV2PaymentProcessor.renderAmazonPayButton({
                    checkoutState: this._store.getState(),
                    containerId,
                    decoupleCheckoutInitiation:
                        this._isOneTimeTransaction(features),
                    methodId,
                    placement: AmazonPayV2Placement.Checkout,
                });
        }

        return this._store.getState();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;

        const { features } = this._store.getState().config.getStoreConfigOrThrow().checkoutSettings;
        const { region, paymentToken } = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId).initializationData;

        if (this._isReadyToPay(features, paymentToken) || this._isOneTimeTransaction(features)) {
            const paymentPayload = {
                methodId,
                paymentData: { nonce: paymentToken || 'apb' },
            };

            await this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));

            try {
                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            } catch (error) {
                if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                    if (paymentToken) {
                        return new Promise(() =>
                            window.location.assign(error.body.additional_action_required.data.redirect_url)
                        );
                    }

                    this._amazonPayV2PaymentProcessor.prepareCheckout(JSON.parse(error.body.additional_action_required.data.redirect_url));
                } else {
                    throw error;
                }
            }
        }

        this._getWalletButton().click();

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

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        await this._amazonPayV2PaymentProcessor.deinitialize();

        return Promise.resolve(this._store.getState());
    }

    private _bindEditButton(buttonId: string, sessionId: string, changeAction: AmazonPayV2ChangeActionType, isModalFlow: boolean): void {
        const button = document.getElementById(buttonId);

        if (!button || !button.parentNode) {
            return;
        }

        if (!isModalFlow) {
            const clone = button.cloneNode(true);
            button.parentNode.replaceChild(clone, button);

            clone.addEventListener('click', () => this._showLoadingSpinner());
        }

        this._amazonPayV2PaymentProcessor.bindButton(buttonId, sessionId, changeAction);
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

    private _getWalletButton() {
        return guard(this._walletButton, () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
    }

    private _isOneTimeTransaction(features: CheckoutSettings['features']): boolean {
        return features['PROJECT-3483.amazon_pay_ph4'] && features['INT-6399.amazon_pay_apb'];
    }

    private _isStandardIntegration(features: CheckoutSettings['features']): boolean {
        return !this._isOneTimeTransaction(features);
    }

    private _isReadyToPay(features: CheckoutSettings['features'], paymentToken?: string): boolean {
        return this._isStandardIntegration(features) && !!paymentToken;
    }
}
