import { noop } from 'lodash';

import {
    AmazonPayV2ChangeActionType,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { CheckoutSettings } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { guard } from '../../../../src/common/utility';
import { StoreProfile } from '../../../../src/config';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    RequestError,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';

export default class AmazonPayV2PaymentStrategy implements PaymentStrategy {
    private _amazonPayButton?: HTMLDivElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, amazonpay } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const { features } = this._store.getState().config.getStoreConfigOrThrow().checkoutSettings;
        const paymentMethod = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);
        const {
            initializationData: { paymentToken, region },
        } = paymentMethod;

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);

        if (this._isReadyToPay(paymentToken)) {
            if (amazonpay?.editButtonId) {
                this._bindEditButton(
                    amazonpay.editButtonId,
                    paymentToken,
                    'changePayment',
                    this._isModalFlow(region),
                );
            }
        } else {
            const { id: containerId } = this._createContainer();

            this._amazonPayButton = this._amazonPayV2PaymentProcessor.renderAmazonPayButton({
                checkoutState: this._store.getState(),
                containerId,
                decoupleCheckoutInitiation: this._isOneTimeTransaction(
                    features,
                    region.toUpperCase(),
                ),
                methodId,
                placement: AmazonPayV2Placement.Checkout,
            });
        }

        return this._store.getState();
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;

        const { features } = this._store.getState().config.getStoreConfigOrThrow().checkoutSettings;
        const { region, paymentToken } = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId).initializationData;

        if (
            this._isReadyToPay(paymentToken) ||
            this._isOneTimeTransaction(features, region.toUpperCase())
        ) {
            const paymentPayload = {
                methodId,
                paymentData: { nonce: paymentToken || 'apb' },
            };

            await this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));

            try {
                return await this._store.dispatch(
                    this._paymentActionCreator.submitPayment(paymentPayload),
                );
            } catch (error) {
                if (
                    error instanceof RequestError &&
                    error.body.status === 'additional_action_required'
                ) {
                    if (paymentToken) {
                        return new Promise(() =>
                            window.location.assign(
                                error.body.additional_action_required.data.redirect_url,
                            ),
                        );
                    }

                    this._amazonPayV2PaymentProcessor.prepareCheckout(
                        JSON.parse(error.body.additional_action_required.data.redirect_url),
                    );
                } else {
                    throw error;
                }
            }
        }

        this._getAmazonPayButton().click();

        // Focus of parent window used to try and detect the user cancelling the Amazon log in modal
        // Should be refactored if/when Amazon add a modal close hook to their SDK
        if (this._isModalFlow(region)) {
            return new Promise((_, reject) => {
                const onFocus = () => {
                    window.removeEventListener('focus', onFocus);
                    reject(
                        new PaymentMethodCancelledError(
                            'Shopper needs to login to Amazonpay to continue',
                        ),
                    );
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
        await this._amazonPayV2PaymentProcessor.deinitialize();

        this._amazonPayButton = undefined;

        return this._store.getState();
    }

    private _bindEditButton(
        buttonId: string,
        sessionId: string,
        changeAction: AmazonPayV2ChangeActionType,
        isModalFlow: boolean,
    ): void {
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
            { queueId: 'widgetInteraction' },
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

    private _getAmazonPayButton() {
        return guard(
            this._amazonPayButton,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private _isOneTimeTransaction(
        features: CheckoutSettings['features'],
        storeCountryCode: StoreProfile['storeCountryCode'],
    ): boolean {
        return (
            this._amazonPayV2PaymentProcessor.isPh4Enabled(features, storeCountryCode) &&
            features['INT-6399.amazon_pay_apb']
        );
    }

    private _isReadyToPay(paymentToken?: string): boolean {
        return !!paymentToken;
    }
}
