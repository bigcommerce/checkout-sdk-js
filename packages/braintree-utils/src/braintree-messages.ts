import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeHostWindow,
    BraintreeInitializationData,
    PayPalBNPLConfigurationItem,
} from './braintree';
import { MessagesStyleOptions, MessagingPlacements } from './paypal';

export default class BraintreeMessages {
    private braintreeHostWindow: BraintreeHostWindow = window;

    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    render(methodId: string, containerId: string, placement: MessagingPlacements): void {
        const messagingContainer = containerId && document.getElementById(containerId);

        if (this.braintreeHostWindow.paypal && messagingContainer) {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const billingAddress = state.getBillingAddressOrThrow();
            const paymentMethod =
                state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

            if (!paymentMethod.initializationData) {
                return;
            }

            const { paypalBNPLConfiguration = [] } = paymentMethod.initializationData;

            const bannedId = placement === MessagingPlacements.PAYMENT ? 'checkout' : placement;
            const bannerConfiguration =
                paypalBNPLConfiguration &&
                paypalBNPLConfiguration.find(({ id }) => id === bannedId);

            if (!bannerConfiguration || !bannerConfiguration.status) {
                return;
            }

            // TODO: remove this code when this data attributes will be removed from banner div container in content service
            if (placement === MessagingPlacements.CART) {
                messagingContainer.removeAttribute('data-pp-style-logo-type');
                messagingContainer.removeAttribute('data-pp-style-logo-position');
                messagingContainer.removeAttribute('data-pp-style-text-color');
                messagingContainer.removeAttribute('data-pp-style-text-size');
            }

            this.braintreeHostWindow.paypal
                .Messages({
                    amount: cart.cartAmount,
                    buyerCountry: billingAddress.countryCode,
                    placement,
                    style: this.getPaypalMessagesStylesFromBNPLConfig(bannerConfiguration),
                })
                .render(`#${containerId}`);
        }
    }

    private getPaypalMessagesStylesFromBNPLConfig({
        styles,
    }: PayPalBNPLConfigurationItem): MessagesStyleOptions {
        const messagesStyles: MessagesStyleOptions = {};

        if (styles.color) {
            messagesStyles.color = styles.color;
        }

        if (styles.layout) {
            messagesStyles.layout = styles.layout;
        }

        if (styles['logo-type'] || styles['logo-position']) {
            messagesStyles.logo = {};

            if (styles['logo-type']) {
                messagesStyles.logo.type = styles['logo-type'];
            }

            if (styles['logo-position']) {
                messagesStyles.logo.position = styles['logo-position'];
            }
        }

        if (styles.ratio) {
            messagesStyles.ratio = styles.ratio;
        }

        if (styles['text-color'] || styles['text-size']) {
            messagesStyles.text = {};

            if (styles['text-color']) {
                messagesStyles.text.color = styles['text-color'];
            }

            if (styles['text-size']) {
                messagesStyles.text.size = +styles['text-size'];
            }
        }

        return messagesStyles;
    }
}
