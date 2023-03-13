import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BoltHostWindow, BoltPaymentMethod } from './bolt';
import BoltButtonInitializeOptions, {
    WithBoltButtonInitializeOptions,
} from './bolt-button-initialize-options';
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
        const { bolt, containerId, methodId, storefrontApiToken } = options;
        const { buyNowInitializeOptions } = bolt || {};

        console.log('*** bolt button initialize options', options);

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

        if (!storefrontApiToken || typeof storefrontApiToken !== 'string') {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.storefrontApiToken" argument is not provided.`,
            );
        }

        if (!bolt) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bolt" argument is not provided.`,
            );
        }

        const isBuyNowFlow = Boolean(buyNowInitializeOptions);

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod: BoltPaymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig } = initializationData || {};

        console.log('*** publishableKey -- ', publishableKey);
        console.log('*** storefrontApiToken -- ', storefrontApiToken);

        await this.boltScriptLoader.loadBoltClient(
            publishableKey,
            config.testMode,
            developerConfig,
            'BigCommerce', // TODO: check if need to be real id or can be hardcoded
            storefrontApiToken,
        );

        this.renderButton(containerId, methodId, paymentMethod, bolt);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paymentMethod: BoltPaymentMethod,
        bolt: BoltButtonInitializeOptions,
    ): void {
        // const { style } = bolt;
        console.log('*** bolt', bolt);

        if (typeof this.boltHostWindow.BoltConnect?.setupProductPageCheckout !== 'function') {
            return;
        }

        this.addButtonContainer(containerId, methodId, paymentMethod);
        this.boltHostWindow.BoltConnect.setupProductPageCheckout();
    }

    private addButtonContainer(
        containerId: string,
        methodId: string,
        paymentMethod: BoltPaymentMethod,
    ): void {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        const boltButtonContainer = document.createElement('div');
        const boltButtonObject = document.createElement('object');
        const buttonStyles = this.getButtonStyles(methodId);

        boltButtonContainer.setAttribute('id', 'product-page-checkout-wrapper');
        boltButtonContainer.setAttribute('class', 'bolt-button-wrapper');
        boltButtonContainer.setAttribute('style', 'display:none');
        boltButtonContainer.setAttribute('data-tid', 'product-page-checkout-wrapper');

        boltButtonObject.setAttribute('data', this.getBoltObjectData(paymentMethod));
        boltButtonObject.setAttribute('class', 'bolt-product-checkout-button');

        boltButtonContainer.append(boltButtonObject);
        container.innerHTML = '';
        container.append(boltButtonContainer);
        container.append(buttonStyles);
    }

    private getButtonStyles(methodId: string) {
        const styles = document.createElement('style');

        styles.id = `${methodId}-button--styles`;
        styles.innerText = `
            .bolt-button-wrapper,
            .bolt-button-wrapper svg {
                display: block;
                max-width: 100%;
                width: 100% !important;
                height: 40px;
            }
        `;

        return styles;
    }

    private getBoltObjectData(paymentMethod: BoltPaymentMethod): string {
        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig } = initializationData || {};

        const domainUrl = this.boltScriptLoader.getDomainURL(!!config.testMode, developerConfig);

        return `https://${domainUrl}/v1/checkout_button?publishable_key=${publishableKey!}`;
    }
}
