import { noop } from 'lodash';

import {
    AmazonPayV2ChangeActionType,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2Placement,
    isAmazonPayAdditionalActionErrorBody,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CheckoutSettings,
    guard,
    InvalidArgumentError,
    isRequestError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStrategy,
    StoreProfile,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithAmazonPayV2PaymentInitializeOptions } from './amazon-pay-v2-payment-initialize-options';

export default class AmazonPayV2PaymentStrategy implements PaymentStrategy {
    private _amazonPayButton?: HTMLDivElement;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithAmazonPayV2PaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, amazonpay } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;
        const paymentMethod = state.getPaymentMethodOrThrow<AmazonPayV2InitializeOptions>(methodId);
        const initializationData = paymentMethod.initializationData || {};
        const { paymentToken = '', region = '', isButtonMicroTextDisabled } = initializationData;

        await this.amazonPayV2PaymentProcessor.initialize(paymentMethod);

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

            this._amazonPayButton = this.amazonPayV2PaymentProcessor.renderAmazonPayButton({
                checkoutState: state,
                containerId,
                decoupleCheckoutInitiation: this._isOneTimeTransaction(
                    features,
                    region.toUpperCase(),
                ),
                methodId,
                placement: AmazonPayV2Placement.Checkout,
                isButtonMicroTextDisabled,
            });

            if (!this._amazonPayButton) {
                throw new InvalidArgumentError(
                    'Unable to render the Amazon Pay button to an invalid HTML container element.',
                );
            }
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;
        const state = this.paymentIntegrationService.getState();
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;
        const paymentMethod = state.getPaymentMethodOrThrow<AmazonPayV2InitializeOptions>(methodId);
        const initializationData = paymentMethod.initializationData || {};
        const { paymentToken = '', region = '' } = initializationData;

        if (
            this._isReadyToPay(paymentToken) ||
            this._isOneTimeTransaction(features, region.toUpperCase())
        ) {
            const paymentPayload = {
                methodId,
                paymentData: { nonce: paymentToken || 'apb' },
            };

            await this.paymentIntegrationService.submitOrder(payload, options);

            try {
                await this.paymentIntegrationService.submitPayment(paymentPayload);

                return;
            } catch (error) {
                if (!isRequestError(error) || !isAmazonPayAdditionalActionErrorBody(error.body)) {
                    throw error;
                }

                const { additional_action_required: additionalAction } = error.body;
                const { redirect_url } = additionalAction.data;

                if (paymentToken) {
                    return new Promise(() => window.location.assign(redirect_url));
                }

                this.amazonPayV2PaymentProcessor.prepareCheckout(
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    JSON.parse(redirect_url) as Required<AmazonPayV2CheckoutSessionConfig>,
                );
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

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<void> {
        await this.amazonPayV2PaymentProcessor.deinitialize();

        this._amazonPayButton = undefined;
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

            clone.addEventListener('click', () => {
                void this._showLoadingSpinner();
            });
        }

        this.amazonPayV2PaymentProcessor.bindButton(buttonId, sessionId, changeAction);
    }

    private _isModalFlow(region: string) {
        return region === 'us';
    }

    private async _showLoadingSpinner(): Promise<void> {
        await this.paymentIntegrationService.widgetInteraction(() => new Promise(noop));
    }

    private _createContainer(): HTMLElement {
        let container = document.getElementById('AmazonPayButton');

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
            this.amazonPayV2PaymentProcessor.isPh4Enabled(features, storeCountryCode) &&
            features['PI-3837.amazon_pay_apb']
        );
    }

    private _isReadyToPay(paymentToken?: string): boolean {
        return !!paymentToken;
    }
}
