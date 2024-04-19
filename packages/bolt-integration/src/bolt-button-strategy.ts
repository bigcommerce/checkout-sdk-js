import { stringifyUrl } from 'query-string';

import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    NotImplementedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BoltButtonStyleOptions,
    BoltHostWindow,
    BoltPaymentMethod,
    StyleButtonShape,
    StyleButtonSize,
} from './bolt';
import { WithBoltButtonInitializeOptions } from './bolt-button-initialize-options';
import BoltScriptLoader from './bolt-script-loader';

export default class BoltButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private boltScriptLoader: BoltScriptLoader,
        public boltHostWindow: BoltHostWindow = window,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBoltButtonInitializeOptions,
    ): Promise<void> {
        const { bolt, containerId, methodId } = options;
        const { buyNowInitializeOptions, style } = bolt || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!bolt) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bolt" argument is not provided.`,
            );
        }

        const isBuyNowFlow = Boolean(buyNowInitializeOptions);

        if (!isBuyNowFlow) {
            throw new NotImplementedError('Only buy now flow is implemented for Bolt button');
        }

        if (
            !buyNowInitializeOptions?.storefrontApiToken ||
            typeof buyNowInitializeOptions.storefrontApiToken !== 'string'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.storefrontApiToken" argument is not provided.`,
            );
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod: BoltPaymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig } = initializationData || {};

        await this.boltScriptLoader.loadBoltClient(
            publishableKey,
            config.testMode,
            developerConfig,
            'BigCommerce',
            buyNowInitializeOptions.storefrontApiToken,
        );

        this.renderButton(containerId, paymentMethod, style);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        paymentMethod: BoltPaymentMethod,
        style?: BoltButtonStyleOptions,
    ): void {
        if (typeof this.boltHostWindow.BoltConnect?.setupProductPageCheckout !== 'function') {
            return;
        }

        this.addButtonContainer(containerId, paymentMethod, style);
        this.boltHostWindow.BoltConnect.setupProductPageCheckout();
    }

    private addButtonContainer(
        containerId: string,
        paymentMethod: BoltPaymentMethod,
        style?: BoltButtonStyleOptions,
    ): void {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const boltButtonContainer = document.createElement('div');
        const boltButtonObject = document.createElement('object');

        boltButtonContainer.setAttribute('id', 'product-page-checkout-wrapper');
        boltButtonContainer.setAttribute('class', 'bolt-button-wrapper');
        boltButtonContainer.setAttribute('style', 'display:none');
        boltButtonContainer.setAttribute('data-tid', 'product-page-checkout-wrapper');

        boltButtonObject.setAttribute('data', this.getBoltObjectData(paymentMethod, style));
        boltButtonObject.setAttribute('class', 'bolt-product-checkout-button');

        boltButtonContainer.append(boltButtonObject);
        container.innerHTML = '';
        container.append(boltButtonContainer);
    }

    private getBoltObjectData(
        paymentMethod: BoltPaymentMethod,
        style?: BoltButtonStyleOptions,
    ): string {
        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig } = initializationData || {};

        const domainUrl = this.boltScriptLoader.getDomainURL(!!config.testMode, developerConfig);
        const buttonHeight = this.getButtonHeight(style?.size);
        const buttonBorderRadius = this.getButtonBorderRadius(style?.shape, buttonHeight);

        return stringifyUrl({
            url: `https://${domainUrl}/v1/checkout_button`,
            query: {
                publishable_key: publishableKey,
                variant: 'ppc',
                height: buttonHeight,
                border_radius: buttonBorderRadius,
            },
        });
    }

    private getButtonHeight(buttonSize?: StyleButtonSize): number | undefined {
        if (!buttonSize) {
            return;
        }

        switch (buttonSize) {
            case StyleButtonSize.Small:
                return 25;

            case StyleButtonSize.Large:
                return 45;

            case StyleButtonSize.Medium:
            default:
                return 40;
        }
    }

    private getButtonBorderRadius(
        buttonShape?: StyleButtonShape,
        buttonHeight?: number,
    ): number | undefined {
        if (!buttonShape) {
            return;
        }

        switch (buttonShape) {
            case StyleButtonShape.Pill:
                return buttonHeight ? Math.round(buttonHeight / 2) : undefined;

            case StyleButtonShape.Rect:
            default:
                return 4;
        }
    }
}
