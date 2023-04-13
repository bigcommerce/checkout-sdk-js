import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    NotImplementedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BoltHostWindow, BoltPaymentMethod } from './bolt';
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
        const { buyNowInitializeOptions } = bolt || {};

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

        this.renderButton(containerId, paymentMethod);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(containerId: string, paymentMethod: BoltPaymentMethod): void {
        if (typeof this.boltHostWindow.BoltConnect?.setupProductPageCheckout !== 'function') {
            return;
        }

        this.addButtonContainer(containerId, paymentMethod);
        this.boltHostWindow.BoltConnect.setupProductPageCheckout();
    }

    private addButtonContainer(containerId: string, paymentMethod: BoltPaymentMethod): void {
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

        boltButtonObject.setAttribute('data', this.getBoltObjectData(paymentMethod));
        boltButtonObject.setAttribute('class', 'bolt-product-checkout-button');

        boltButtonContainer.append(boltButtonObject);
        container.innerHTML = '';
        container.append(boltButtonContainer);
    }

    private getBoltObjectData(paymentMethod: BoltPaymentMethod): string {
        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig } = initializationData || {};

        const domainUrl = this.boltScriptLoader.getDomainURL(!!config.testMode, developerConfig);

        return `https://${domainUrl}/v1/checkout_button?publishable_key=${publishableKey!}`;
    }
}
